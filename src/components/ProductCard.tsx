'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import { formatInr } from '@/lib/catalog';
import type { Product } from '@/types/store';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd(): void {
    addItem(product, 1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <article
      className="group flex flex-col justify-between overflow-hidden border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        borderRadius: 'var(--card-radius)',
      }}
    >
      <div>
        <Link href={`/products/${product.slug}`} className="block">
          <div
            className={`relative w-full overflow-hidden ${compact ? 'h-40 sm:h-44' : 'h-44 sm:h-52'}`}
            style={{ backgroundColor: 'var(--bg-hero)' }}
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </Link>

        <div className="space-y-2 p-3.5 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--accent-soft-text)',
              }}
            >
              {product.materialBadge}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {product.category}
            </span>
          </div>

          <Link href={`/products/${product.slug}`} className="block">
            <h3
              className="line-clamp-2 text-sm font-semibold leading-snug hover:underline sm:text-base"
              style={{ color: 'var(--text-main)' }}
            >
              {product.name}
            </h3>
          </Link>

          {!compact && (
            <p
              className="line-clamp-2 text-xs leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              {product.shortDescription}
            </p>
          )}
        </div>
      </div>

      <div
        className="flex items-center justify-between gap-2 border-t px-3.5 py-3 sm:px-4"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-base font-bold"
            style={{ color: 'var(--text-main)' }}
          >
            {formatInr(product.priceInr)}
          </span>
          {product.compareAtInr && (
            <span
              className="text-xs line-through"
              style={{ color: 'var(--text-muted)' }}
            >
              {formatInr(product.compareAtInr)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          aria-label={`Add ${product.name} to bag`}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
          style={{
            backgroundColor: justAdded ? 'var(--accent-soft)' : 'var(--accent)',
            color: justAdded ? 'var(--accent-soft-text)' : '#FFFFFF',
          }}
        >
          {justAdded ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Added
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Add
            </>
          )}
        </button>
      </div>
    </article>
  );
}
