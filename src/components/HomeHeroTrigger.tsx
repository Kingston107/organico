'use client';

import { MessageCircle } from 'lucide-react';
import { useCart } from '@/components/CartContext';

interface HomeHeroTriggerProps {
  label?: string;
}

export function HomeHeroTrigger({
  label = 'Ask Side Assistant',
}: HomeHeroTriggerProps) {
  const { setAssistantOpen } = useCart();

  return (
    <button
      type="button"
      onClick={() => setAssistantOpen(true)}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        color: 'var(--text-main)',
      }}
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </button>
  );
}
