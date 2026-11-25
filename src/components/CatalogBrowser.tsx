'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { PRODUCT_CATEGORIES } from '@/lib/catalog';
import type { Product, ProductCategory } from '@/types/store';

interface CatalogBrowserProps {
  products: Product[];
  compactCards?: boolean;
}

type PriceFilter = 'all' | 'under-300' | '300-500' | 'above-500';

export function CatalogBrowser({
  products,
  compactCards = false,
}: CatalogBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    'All' | ProductCategory
  >('All');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }
      if (priceFilter === 'under-300' && product.priceInr >= 300) return false;
      if (
        priceFilter === '300-500' &&
        (product.priceInr < 300 || product.priceInr > 500)
      ) {
        return false;
      }
      if (priceFilter === 'above-500' && product.priceInr <= 500) return false;

      if (!q) return true;
      const haystack =
        `${product.name} ${product.category} ${product.materialBadge} ${product.shortDescription}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [products, selectedCategory, priceFilter, searchQuery]);

  return (
    <div className="space-y-6">
      <div
        className="flex flex-col gap-3 border p-3.5 sm:p-4"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
          borderRadius: 'var(--card-radius)',
        }}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {PRODUCT_CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className="min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors"
                  style={
                    active
                      ? {
                          backgroundColor: 'var(--accent)',
                          borderColor: 'var(--accent)',
                          color: '#FFFFFF',
                        }
                      : {
                          backgroundColor: 'var(--bg-page)',
                          borderColor: 'var(--border-subtle)',
                          color: 'var(--text-muted)',
                        }
                  }
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bamboo, hemp, glass..."
                className="min-h-9 w-full rounded-lg border pr-3 pl-8 text-xs outline-none sm:w-56"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              />
            </div>

            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
              aria-label="Filter by price"
              className="min-h-9 rounded-lg border px-3 text-xs font-medium outline-none"
              style={{
                backgroundColor: 'var(--bg-page)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-main)',
              }}
            >
              <option value="all">All Prices (₹)</option>
              <option value="under-300">Under ₹300</option>
              <option value="300-500">₹300 – ₹500</option>
              <option value="above-500">Above ₹500</option>
            </select>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div
          className="border p-8 text-center"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--card-radius)',
          }}
        >
          <p
            className="text-sm font-semibold"
            style={{ color: 'var(--text-main)' }}
          >
            No matching products found.
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            Try clearing your search or choosing another category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              compact={compactCards}
            />
          ))}
        </div>
      )}
    </div>
  );
}
