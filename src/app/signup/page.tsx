'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { MailCheck } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSignUp(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(
        'Account registration is not configured yet. You can continue as a guest at checkout.'
      );
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        await supabase.from('profiles').upsert({
          id: data.user?.id,
          full_name: fullName.trim(),
          updated_at: new Date().toISOString(),
        });
        router.push('/profile');
        router.refresh();
        return;
      }

      // Email verification enabled: show dedicated verification screen
      setPendingEmail(cleanEmail);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendEmail(): Promise<void> {
    if (!pendingEmail) return;
    setError(null);
    setNotice(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setResending(true);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile`,
        },
      });
      if (resendError) {
        setError(resendError.message);
        return;
      }
      setNotice(`Sent a fresh verification email to ${pendingEmail}.`);
    } finally {
      setResending(false);
    }
  }

  async function handleGoogleSignUp(): Promise<void> {
    setError(null);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(
        'Google sign-up is not configured yet. You can continue as a guest at checkout.'
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

  if (pendingEmail) {
    return (
      <section className="mx-auto flex max-w-md px-4 py-12 sm:px-6">
        <div
          className="w-full space-y-4 border p-6 text-center"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--card-radius)',
          }}
        >
          <div className="flex justify-center">
            <span
              className="inline-flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--accent-soft-text)',
              }}
            >
              <MailCheck className="h-6 w-6" />
            </span>
          </div>

          <h1
            className="text-xl font-bold"
            style={{ color: 'var(--text-main)' }}
          >
            Verify your email
          </h1>
          <p
            className="text-xs leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            We sent a confirmation link to{' '}
            <span
              className="font-semibold"
              style={{ color: 'var(--text-main)' }}
            >
              {pendingEmail}
            </span>
            . Open your inbox and click the link to activate your Organico
            account.
          </p>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          {notice && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              {notice}
            </div>
          )}

          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              disabled={resending}
              onClick={() => void handleResendEmail()}
              className="min-h-10 w-full rounded-lg border px-4 text-xs font-semibold transition-colors disabled:opacity-60"
              style={{
                backgroundColor: 'var(--bg-page)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-main)',
              }}
            >
              {resending ? 'Sending again...' : 'Resend verification email'}
            </button>

            <Link
              href="/login"
              className="inline-flex min-h-10 w-full items-center justify-center rounded-lg px-4 text-xs font-semibold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </section>
    );
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
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: 'var(--text-main)' }}
          >
            Create your Organico account
          </h1>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            Save your delivery address and view past orders anytime.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-3">
          <input
            required
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            className="min-h-10 w-full rounded-lg border px-3 text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-page)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-main)',
            }}
          />

          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
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
            placeholder="Password (min 6 characters)"
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
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
            onClick={() => void handleGoogleSignUp()}
            className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border px-4 text-xs font-semibold transition-colors"
            style={{
              backgroundColor: 'var(--bg-page)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-main)',
            }}
          >
            Continue with Google
          </button>

          <button
            type="submit"
            disabled={loading}
            className="min-h-11 w-full rounded-lg px-4 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div
          className="flex items-center justify-between border-t pt-3 text-xs"
          style={{
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-muted)',
          }}
        >
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            Already have an account? Sign In
          </Link>
          <Link href="/checkout" className="font-medium hover:underline">
            Continue as guest &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
