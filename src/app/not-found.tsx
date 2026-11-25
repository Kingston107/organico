import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
        Page not found
      </h1>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        That item or page isn&apos;t available right now.
      </p>
      <Link
        href="/products"
        className="inline-flex min-h-10 items-center justify-center rounded-lg px-5 text-xs font-semibold text-white"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        Browse Products
      </Link>
    </section>
  );
}
