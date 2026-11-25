export default function StoreLoading() {
  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div
        className="h-36 animate-pulse rounded-2xl"
        style={{ backgroundColor: 'var(--bg-hero)' }}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="h-64 animate-pulse rounded-2xl border"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          />
        ))}
      </div>
    </section>
  );
}
