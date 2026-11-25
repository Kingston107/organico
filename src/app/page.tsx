import Link from 'next/link';
import { ArrowRight, Leaf, ShieldCheck, Truck } from 'lucide-react';
import { HomeHeroTrigger } from '@/components/HomeHeroTrigger';
import { ProductCard } from '@/components/ProductCard';
import { FREE_SHIPPING_THRESHOLD_INR, formatInr } from '@/lib/catalog';
import { getCatalogProducts } from '@/lib/products-server';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getCatalogProducts();
  const featuredProducts = products.slice(0, 8);

  return (
    <div>
      {/* Meadow Light Green Airy Hero */}
      <section
        className="border-b px-4 py-10 sm:px-6 sm:py-14"
        style={{
          backgroundColor: 'var(--bg-hero)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold"
            style={{
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent-soft-text)',
            }}
          >
            <Leaf className="h-3.5 w-3.5" />
            Recyclable &amp; Organic Home Goods
          </span>

          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: 'var(--text-main)' }}
          >
            Thoughtful daily staples that return cleanly to the earth.
          </h1>

          <p
            className="mx-auto max-w-xl text-sm leading-relaxed sm:text-base"
            style={{ color: 'var(--text-muted)' }}
          >
            Vetted recyclable, refillable, and compostable essentials in Indian
            Rupees—easy to compare, ask questions, and order as a guest.
          </p>

          <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Browse All {products.length} Products
              <ArrowRight className="h-4 w-4" />
            </Link>
            <HomeHeroTrigger label="Ask Side Assistant" />
          </div>

          <div
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-3 text-xs font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="inline-flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" />
              Free shipping over {formatInr(FREE_SHIPPING_THRESHOLD_INR)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Plastic-free kraft packaging
            </span>
          </div>
        </div>
      </section>

      {/* Featured Catalog Below Hero */}
      <section className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2
              className="text-xl font-bold tracking-tight sm:text-2xl"
              style={{ color: 'var(--text-main)' }}
            >
              Everyday Essentials
            </h2>
            <p
              className="text-xs sm:text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              Showing {featuredProducts.length} popular picks out of{' '}
              {products.length} plastic-free items.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-xs font-semibold hover:underline sm:text-sm"
            style={{ color: 'var(--accent)' }}
          >
            View full catalog
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
