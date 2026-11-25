import type { Metadata } from 'next';
import { CatalogBrowser } from '@/components/CatalogBrowser';
import { getCatalogProducts } from '@/lib/products-server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Browse all recyclable, refillable, and organic home essentials priced in Indian Rupees.',
};

export default async function ProductsPage() {
  const products = await getCatalogProducts();

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-1">
        <h1
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: 'var(--text-main)' }}
        >
          All Products ({products.length})
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Filter by category, budget in ₹, or material to build your
          plastic-free routine.
        </p>
      </div>

      <CatalogBrowser products={products} />
    </section>
  );
}
