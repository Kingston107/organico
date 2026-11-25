'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Plus, Send, Sparkles, X } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import { formatInr } from '@/lib/catalog';
import type { Product } from '@/types/store';

interface DrawerMessage {
  role: 'user' | 'assistant';
  content: string;
  recommendedProducts?: Product[];
}

interface SideAssistantDrawerProps {
  products: Product[];
}

const QUICK_PROMPTS: readonly string[] = [
  'Kitchen swaps under ₹300',
  'Best gift combo under ₹800',
  'How does guest checkout work?',
];

export function SideAssistantDrawer({ products }: SideAssistantDrawerProps) {
  const { assistantOpen, setAssistantOpen, addItem } = useCart();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<DrawerMessage[]>([
    {
      role: 'assistant',
      content:
        'Hi! Ask me for plastic-free product picks in ₹, material details, or help with checkout and delivery.',
    },
  ]);

  if (!assistantOpen) return null;

  async function sendQuestion(questionText: string): Promise<void> {
    const trimmed = questionText.trim();
    if (!trimmed || sending) return;

    const nextHistory: DrawerMessage[] = [
      ...messages,
      { role: 'user', content: trimmed },
    ];
    setMessages(nextHistory);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const data = (await res.json()) as {
        reply?: string;
        recommendedSlugs?: string[];
        error?: string;
      };

      const matched = (data.recommendedSlugs ?? [])
        .map((slug) => products.find((p) => p.slug === slug))
        .filter((p): p is Product => Boolean(p));

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            data.reply ?? data.error ?? 'Please try asking again in a moment.',
          recommendedProducts: matched,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Could not reach the store assistant right now. You can browse all items directly on the Products page.',
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void sendQuestion(input);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px]">
      <div
        className="flex h-full w-full flex-col border-l shadow-2xl sm:max-w-md"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
        role="dialog"
        aria-label="Organico shopping assistant"
      >
        <div
          className="flex items-center justify-between border-b px-4 py-3.5"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--accent-soft-text)',
              }}
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2
                className="text-sm font-bold"
                style={{ color: 'var(--text-main)' }}
              >
                Organico Shopping Guide
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Product help, budget picks &amp; checkout support
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAssistantOpen(false)}
            aria-label="Close assistant panel"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendQuestion(prompt)}
                className="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-page)',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-2">
              <div
                className={`rounded-xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                  msg.role === 'user' ? 'ml-8' : 'mr-4 border'
                }`}
                style={
                  msg.role === 'user'
                    ? {
                        backgroundColor: 'var(--accent)',
                        color: '#FFFFFF',
                      }
                    : {
                        backgroundColor: 'var(--bg-page)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-main)',
                      }
                }
              >
                {msg.content}
              </div>

              {msg.recommendedProducts &&
                msg.recommendedProducts.length > 0 && (
                  <div className="mr-4 space-y-1.5">
                    {msg.recommendedProducts.map((product) => (
                      <div
                        key={product.slug}
                        className="flex items-center justify-between gap-2 rounded-lg border p-2"
                        style={{
                          borderColor: 'var(--border-subtle)',
                          backgroundColor: 'var(--bg-surface)',
                        }}
                      >
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={() => setAssistantOpen(false)}
                          className="flex min-w-0 items-center gap-2"
                        >
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 shrink-0 rounded-md object-cover"
                          />
                          <div className="min-w-0">
                            <div
                              className="truncate text-xs font-semibold"
                              style={{ color: 'var(--text-main)' }}
                            >
                              {product.name}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--accent)' }}
                            >
                              {formatInr(product.priceInr)}
                            </div>
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={() => addItem(product, 1)}
                          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md px-2.5 text-xs font-semibold text-white"
                          style={{ backgroundColor: 'var(--accent)' }}
                        >
                          <Plus className="h-3 w-3" />
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ))}

          {sending && (
            <div
              className="mr-8 rounded-xl border px-3.5 py-2.5 text-xs"
              style={{
                backgroundColor: 'var(--bg-page)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-muted)',
              }}
            >
              Checking our store catalog...
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t p-3"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about products, prices in ₹, or checkout..."
            className="min-h-10 flex-1 rounded-lg border px-3 text-xs outline-none"
            style={{
              backgroundColor: 'var(--bg-page)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-main)',
            }}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            aria-label="Send message"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
