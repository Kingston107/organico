'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setError(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(
        'Password reset is not configured yet. You can still check out as a guest.'
      );
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        }
      );
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSent(true);
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
          Reset your password
        </h1>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Enter your email address and we&apos;ll send you a one-time reset
          link.
        </p>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {sent ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs text-emerald-800">
            If an account exists for {email}, a reset link is on the way.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your account email"
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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <Link
          href="/login"
          className="block text-center text-xs font-medium hover:underline"
          style={{ color: 'var(--text-muted)' }}
        >
          Back to Sign In
        </Link>
      </div>
    </section>
  );
}
