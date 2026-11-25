'use client';

export default function StoreError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
      <h1 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
        Something didn&apos;t load properly
      </h1>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Please refresh this view or head back to the store home page.
      </p>
      <button
        type="button"
        onClick={reset}
        className="min-h-10 rounded-lg px-5 text-xs font-semibold text-white"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        Try Again
      </button>
    </section>
  );
}
