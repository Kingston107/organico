'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setError(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(
        'Account sign-in is not configured yet. You can continue as a guest at checkout.'
      );
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push('/profile');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn(): Promise<void> {
    setError(null);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(
        'Google sign-in is not configured yet. You can continue as a guest at checkout.'
      );
      return;
    }

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
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
          Welcome to Organico
        </h1>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-3">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Username or email"
            className="min-h-10 w-full rounded-lg border px-3 text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-page)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-main)',
            }}
          />

          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="min-h-10 w-full rounded-lg border px-3 text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-page)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-main)',
            }}
          />

          <div
            className="flex items-center gap-3 py-0.5 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <span
              className="h-px flex-1"
              style={{ backgroundColor: 'var(--border-subtle)' }}
            />
            <span>or</span>
            <span
              className="h-px flex-1"
              style={{ backgroundColor: 'var(--border-subtle)' }}
            />
          </div>

          <button
            type="button"
            onClick={() => void handleGoogleSignIn()}
            className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border px-4 text-xs font-semibold transition-colors"
            style={{
              backgroundColor: 'var(--bg-page)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-main)',
            }}
          >
            Continue with Google
          </button>

          <div className="flex items-center justify-between pt-1 text-xs">
            <Link
              href="/forgot-password"
              className="font-medium underline"
              style={{ color: 'var(--accent)' }}
            >
              Forgot password?
            </Link>
            <Link
              href="/checkout"
              className="font-medium hover:underline"
              style={{ color: 'var(--text-muted)' }}
            >
              Continue as guest &rarr;
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="min-h-11 w-full rounded-lg px-4 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {loading ? 'Please wait...' : 'Sign In'}
          </button>
        </form>

        <div
          className="space-y-2 border-t pt-3 text-center"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            New to Organico?
          </p>
          <Link
            href="/signup"
            className="flex min-h-10 w-full items-center justify-center rounded-lg border px-4 text-xs font-semibold transition-colors"
            style={{
              borderColor: 'var(--accent)',
              color: 'var(--accent)',
              backgroundColor: 'var(--accent-soft)',
            }}
          >
            Create an Account (Sign Up)
          </Link>
        </div>
      </div>
    </section>
  );
}
