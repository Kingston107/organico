import { GoogleGenAI } from '@google/genai';
import type { Product } from '@/types/store';
import {
  FREE_SHIPPING_THRESHOLD_INR,
  STANDARD_SHIPPING_INR,
  formatInr,
} from '@/lib/catalog';

export interface AssistantChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantReply {
  reply: string;
  recommendedSlugs: string[];
  modelUsed: string;
}

interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  timeoutMs: number;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 2,
  baseDelayMs: 450,
  maxDelayMs: 4000,
  timeoutMs: 12000,
};

const HEDGE_DELAY_MS = 6000;

function getPrimaryModel(): string {
  return process.env.GEMINI_MODEL?.trim() || 'gemini-3.1-flash-lite';
}

function getBackupModel(): string {
  return process.env.GEMINI_BACKUP_MODEL?.trim() || 'gemini-2.5-flash-lite';
}

function getErrorFallbackModels(): string[] {
  const custom = process.env.GEMINI_FALLBACK_MODELS?.split(',')
    .map((m) => m.trim())
    .filter(Boolean);
  if (custom && custom.length > 0) return custom;
  return ['gemini-2.5-flash-lite', 'gemini-3.6-flash'];
}

export function buildAssistantSystemPrompt(products: Product[]): string {
  const catalogLines = products
    .map(
      (p) =>
        `- ${p.name} (slug: ${p.slug}) | Category: ${p.category} | Material: ${p.materialBadge} | Price: ${formatInr(p.priceInr)} | Stock: ${p.stock} | Summary: ${p.shortDescription} Details: ${p.description} Sustainability: ${p.sustainabilityNote}`
    )
    .join('\n');

  return [
    'You are the Organico Storefront Shopping Guide for an Indian recyclable and organic products store.',
    'Rules:',
    '1. Only recommend products, prices (always in Indian Rupees ₹), and descriptions from the Catalog below. Never invent items or prices.',
    '2. Keep answers concise, warm, clear, and helpful—no generic marketing hype, and never mention software frameworks, databases, or internal tools.',
    '3. Help shoppers compare products, stay within a ₹ budget, pick starter swaps, and complete checkout easily.',
    `4. Checkout & Payment info: Shoppers can use Guest Checkout (no sign-up needed, just name, email, phone, and delivery address) or Signed-In Checkout at /checkout. Payment options include UPI, Card, or Cash on Delivery. Orders of ${formatInr(FREE_SHIPPING_THRESHOLD_INR)}+ ship free; orders below that have ${formatInr(STANDARD_SHIPPING_INR)} flat shipping.`,
    '5. When recommending products, include the exact product name and ₹ price.',
    '',
    'Current Storefront Catalog:',
    catalogLines,
  ].join('\n');
}

function isNonRetryableModelError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes('404') || msg.includes('not found') || msg.includes('model')
  );
}

function isRetryableError(err: unknown): boolean {
  if (isNonRetryableModelError(err)) return false;
  if (!(err instanceof Error)) return true;
  const msg = err.message.toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('500') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('504') ||
    msg.includes('104') ||
    msg.includes('econnreset') ||
    msg.includes('resource_exhausted') ||
    msg.includes('unavailable') ||
    msg.includes('overload') ||
    msg.includes('timeout') ||
    msg.includes('rate') ||
    msg.includes('fetch failed')
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('Request timeout')),
          timeoutMs
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function generateWithExponentialBackoff(
  ai: GoogleGenAI,
  model: string,
  systemInstruction: string,
  contents: string,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<{ text: string; model: string }> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.4,
            maxOutputTokens: 350,
          },
        }),
        options.timeoutMs
      );
      const text = response.text?.trim();
      if (text) return { text, model };
      throw new Error('Empty model response');
    } catch (err) {
      lastError = err;
      if (attempt === options.maxRetries || !isRetryableError(err)) {
        throw err;
      }
      const expDelay = Math.min(
        options.maxDelayMs,
        options.baseDelayMs * 2 ** attempt
      );
      const jitter = Math.floor(Math.random() * 250);
      await sleep(expDelay + jitter);
    }
  }
  throw lastError;
}

/**
 * Starts the primary model immediately and hedges with the backup model if the
 * primary takes longer than HEDGE_DELAY_MS (or fails early), returning whichever succeeds first.
 */
async function racePrimaryAndBackupModel(
  ai: GoogleGenAI,
  primaryModel: string,
  backupModel: string,
  systemInstruction: string,
  contents: string
): Promise<{ text: string; model: string }> {
  if (primaryModel === backupModel) {
    return generateWithExponentialBackoff(
      ai,
      primaryModel,
      systemInstruction,
      contents
    );
  }

  return new Promise<{ text: string; model: string }>((resolve, reject) => {
    let settled = false;
    let backupStarted = false;
    let failures = 0;
    const expectedBranches = 2;

    const finishSuccess = (result: { text: string; model: string }): void => {
      if (settled) return;
      settled = true;
      clearTimeout(hedgeTimer);
      resolve(result);
    };

    const finishFailure = (err: unknown): void => {
      failures += 1;
      if (!settled && failures >= expectedBranches) {
        settled = true;
        clearTimeout(hedgeTimer);
        reject(err);
      }
    };

    const startBackup = (): void => {
      if (settled || backupStarted) return;
      backupStarted = true;
      generateWithExponentialBackoff(
        ai,
        backupModel,
        systemInstruction,
        contents
      )
        .then(finishSuccess)
        .catch(finishFailure);
    };

    const hedgeTimer = setTimeout(startBackup, HEDGE_DELAY_MS);

    generateWithExponentialBackoff(
      ai,
      primaryModel,
      systemInstruction,
      contents
    )
      .then(finishSuccess)
      .catch((err) => {
        startBackup();
        finishFailure(err);
      });
  });
}

function buildLocalCatalogFallback(
  query: string,
  products: Product[]
): AssistantReply {
  const q = query.toLowerCase();
  const budgetMatch = q.match(
    /(?:under|below|less than|within|₹|rs\.?)\s*(\d{2,5})/i
  );
  const maxBudget = budgetMatch ? Number(budgetMatch[1]) : null;

  if (
    q.includes('checkout') ||
    q.includes('pay') ||
    q.includes('ship') ||
    q.includes('guest') ||
    q.includes('delivery')
  ) {
    return {
      reply: `You can check out anytime on the Checkout page—either as a guest (just name, email, phone, and address) or signed in. We support UPI, cards, and Cash on Delivery, with free shipping on orders of ${formatInr(FREE_SHIPPING_THRESHOLD_INR)} or more (or ${formatInr(STANDARD_SHIPPING_INR)} flat shipping below that).`,
      recommendedSlugs: [],
      modelUsed: 'catalog-guide',
    };
  }

  let matches = products.filter((p) => {
    const budgetOk = maxBudget === null || p.priceInr <= maxBudget;
    const text =
      `${p.name} ${p.category} ${p.materialBadge} ${p.shortDescription}`.toLowerCase();
    const keywords = q
      .split(/\s+/)
      .filter(
        (w) =>
          w.length >= 3 &&
          ![
            'the',
            'and',
            'for',
            'under',
            'below',
            'with',
            'show',
            'want',
            'best',
            'find',
          ].includes(w)
      );
    const keywordOk =
      keywords.length === 0 || keywords.some((k) => text.includes(k));
    return budgetOk && keywordOk;
  });

  if (matches.length === 0) {
    matches = products
      .filter((p) =>
        maxBudget === null ? p.featured : p.priceInr <= maxBudget
      )
      .slice(0, 3);
  } else {
    matches = matches.slice(0, 3);
  }

  const lines = matches.map(
    (p) => `• ${p.name} (${formatInr(p.priceInr)}) — ${p.shortDescription}`
  );

  return {
    reply:
      matches.length > 0
        ? `Here are the closest matches from our store:\n${lines.join('\n')}\n\nYou can add any of these straight to your bag and check out as a guest or signed-in shopper.`
        : 'Browse our Products page to filter across Kitchen, Bath, Carry, and Home essentials in ₹.',
    recommendedSlugs: matches.map((m) => m.slug),
    modelUsed: 'catalog-guide',
  };
}

export async function askStoreAssistant(
  history: AssistantChatMessage[],
  products: Product[]
): Promise<AssistantReply> {
  const latestUserMessage =
    [...history].reverse().find((m) => m.role === 'user')?.content ?? '';
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return buildLocalCatalogFallback(latestUserMessage, products);
  }

  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = buildAssistantSystemPrompt(products);
  const conversationText = history
    .slice(-6)
    .map((m) => `${m.role === 'user' ? 'Shopper' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const primaryModel = getPrimaryModel();
  const backupModel = getBackupModel();

  const buildReply = (winner: {
    text: string;
    model: string;
  }): AssistantReply => {
    const recommendedSlugs = products
      .filter((p) => winner.text.toLowerCase().includes(p.name.toLowerCase()))
      .map((p) => p.slug)
      .slice(0, 4);

    return {
      reply: winner.text,
      recommendedSlugs,
      modelUsed: winner.model,
    };
  };

  try {
    const winner = await racePrimaryAndBackupModel(
      ai,
      primaryModel,
      backupModel,
      systemInstruction,
      conversationText
    );
    return buildReply(winner);
  } catch {
    const alreadyTried = new Set([primaryModel, backupModel]);
    const fallbackModels = getErrorFallbackModels().filter(
      (m) => !alreadyTried.has(m)
    );

    for (const fallbackModel of fallbackModels) {
      try {
        const winner = await generateWithExponentialBackoff(
          ai,
          fallbackModel,
          systemInstruction,
          conversationText,
          { ...DEFAULT_RETRY_OPTIONS, maxRetries: 1 }
        );
        return buildReply(winner);
      } catch {
        // Continue down the fallback chain
      }
    }

    return buildLocalCatalogFallback(latestUserMessage, products);
  }
}
