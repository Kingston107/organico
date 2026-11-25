'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import { formatInr } from '@/lib/catalog';
import type { Product } from '@/types/store';

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAddToBag(): void {
    addItem(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-6">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
        style={{ color: 'var(--accent)' }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Products
      </Link>

      <div
        className="grid grid-cols-1 gap-6 overflow-hidden border p-4 sm:p-6 md:grid-cols-12"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
          borderRadius: 'var(--card-radius)',
        }}
      >
        <div
          className="overflow-hidden rounded-xl md:col-span-6"
          style={{ backgroundColor: 'var(--bg-hero)' }}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-72 w-full object-cover sm:h-96"
          />
        </div>

        <div className="flex flex-col justify-between gap-5 md:col-span-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: 'var(--accent-soft)',
                  color: 'var(--accent-soft-text)',
                }}
              >
                {product.materialBadge}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {product.category} &middot; {product.stock} in stock
              </span>
            </div>

            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--text-main)' }}
            >
              {product.name}
            </h1>

            <div className="flex items-baseline gap-2.5">
              <span
                className="text-2xl font-bold"
                style={{ color: 'var(--text-main)' }}
              >
                {formatInr(product.priceInr)}
              </span>
              {product.compareAtInr && (
                <span
                  className="text-sm line-through"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {formatInr(product.compareAtInr)}
                </span>
              )}
            </div>

            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-main)' }}
            >
              {product.description}
            </p>

            <div
              className="rounded-xl border p-3.5 text-xs leading-relaxed"
              style={{
                backgroundColor: 'var(--bg-hero)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-main)',
              }}
            >
              <span className="font-semibold">Care &amp; Disposal: </span>
              {product.sustainabilityNote}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <div
              className="inline-flex h-11 items-center justify-between rounded-lg border px-2"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-page)',
              }}
            >
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="p-2"
                style={{ color: 'var(--text-main)' }}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span
                className="w-8 text-center text-sm font-semibold"
                style={{ color: 'var(--text-main)' }}
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                aria-label="Increase quantity"
                className="p-2"
                style={{ color: 'var(--text-main)' }}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToBag}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold text-white transition-opacity hover:opacity-95"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" />
                  Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  Add to Bag &mdash; {formatInr(product.priceInr * quantity)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
