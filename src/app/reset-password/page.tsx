'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setError(null);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError('Password update is not configured yet.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      router.push('/profile');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-md px-4 py-12 sm:px-6">
      <div
        className="w-full space-y-4 border p-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
          borderRadius: 'var(--card-radius)',
        }}
      >
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
          Choose a new password
        </h1>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-3">
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min 6 characters)"
            className="min-h-10 w-full rounded-lg border px-3 text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-page)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-main)',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="min-h-10 w-full rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {loading ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>
    </section>
  );
}
