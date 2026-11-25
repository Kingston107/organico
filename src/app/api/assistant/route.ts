import { NextResponse } from 'next/server';
import { askStoreAssistant, type AssistantChatMessage } from '@/lib/gemini';
import { getCatalogProducts } from '@/lib/products-server';

interface AssistantRequestBody {
  messages?: unknown;
}

function sanitizeMessages(raw: unknown): AssistantChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is { role: unknown; content: unknown } =>
      Boolean(item && typeof item === 'object')
    )
    .map((item): AssistantChatMessage | null => {
      const role =
        item.role === 'assistant'
          ? 'assistant'
          : item.role === 'user'
            ? 'user'
            : null;
      const content =
        typeof item.content === 'string'
          ? item.content.trim().slice(0, 600)
          : '';
      if (!role || !content) return null;
      return { role, content };
    })
    .filter((m): m is AssistantChatMessage => m !== null)
    .slice(-8);
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as AssistantRequestBody;
    const messages = sanitizeMessages(body.messages);

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'Please enter a question about our products or checkout.' },
        { status: 400 }
      );
    }

    const products = await getCatalogProducts();
    const result = await askStoreAssistant(messages, products);

    return NextResponse.json({
      reply: result.reply,
      recommendedSlugs: result.recommendedSlugs,
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to answer right now. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
