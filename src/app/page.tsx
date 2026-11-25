import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { CatalogBrowser } from '@/components/CatalogBrowser';
import { HomeHeroTrigger } from '@/components/HomeHeroTrigger';
import { FREE_SHIPPING_THRESHOLD_INR, formatInr } from '@/lib/catalog';
import { getCatalogProducts } from '@/lib/products-server';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getCatalogProducts();

  return (
    <div>
      {/* Crisp Mint Utility Compact Header Strip */}
      <section
        className="border-b px-4 py-6 sm:px-6 sm:py-8"
        style={{
          backgroundColor: 'var(--bg-hero)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="space-y-2">
            <div
              className="flex flex-wrap items-center gap-3 text-xs font-medium"
              style={{ color: 'var(--accent-soft-text)' }}
            >
              <span
                className="rounded-full px-2.5 py-0.5 font-semibold"
                style={{ backgroundColor: 'var(--accent-soft)' }}
              >
                {products.length} Plastic-Free Essentials
              </span>
              <span
                className="inline-flex items-center gap-1"
                style={{ color: 'var(--text-muted)' }}
              >
                <Truck className="h-3.5 w-3.5" />
                Free delivery over {formatInr(FREE_SHIPPING_THRESHOLD_INR)}
              </span>
              <span
                className="inline-flex items-center gap-1"
                style={{ color: 'var(--text-muted)' }}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Guest checkout ready
              </span>
            </div>

            <h1
              className="text-2xl font-bold tracking-tight sm:text-3xl"
              style={{ color: 'var(--text-main)' }}
            >
              Plastic-free everyday essentials, clearly priced in ₹.
            </h1>

            <p
              className="max-w-xl text-xs sm:text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              Recyclable, refillable, and organic goods shipped in plastic-free
              kraft packaging.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            <Link
              href="/products"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-95"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              All Products
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <HomeHeroTrigger label="Ask Shopping Guide" />
          </div>
        </div>
      </section>

      {/* Immediate Utility Filter + Compact Product Grid */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <CatalogBrowser products={products} compactCards />
      </section>
    </div>
  );
}
