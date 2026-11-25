'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function StoreFooter() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installMessage, setInstallMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
    };
  }, []);

  async function handleInstallClick(): Promise<void> {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallMessage('Organico has been added to your device.');
      }
      setDeferredPrompt(null);
      return;
    }

    setInstallMessage(
      'On Android Chrome tap the menu and choose "Add to Home screen". On iPhone Safari tap Share and select "Add to Home Screen".'
    );
  }

  return (
    <footer
      className="mt-12 border-t"
      style={{
        backgroundColor: 'var(--bg-footer)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div
          className="flex flex-col justify-between gap-4 border p-4 sm:flex-row sm:items-center sm:p-5"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--card-radius)',
          }}
        >
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--accent-soft-text)',
              }}
            >
              <Smartphone className="h-5 w-5" />
            </span>
            <div>
              <h2
                className="text-sm font-bold"
                style={{ color: 'var(--text-main)' }}
              >
                Get the Organico Web App
              </h2>
              <p
                className="mt-0.5 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                Install Organico directly on your phone or desktop for fast
                one-tap shopping.
              </p>
              {installMessage && (
                <p
                  className="mt-2 text-xs font-medium"
                  style={{ color: 'var(--accent)' }}
                >
                  {installMessage}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-95"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Download className="h-4 w-4" />
            Download Web App
          </button>
        </div>

        <div
          className="flex flex-col items-start justify-between gap-3 border-t pt-5 text-xs sm:flex-row sm:items-center"
          style={{
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            <span
              className="font-semibold"
              style={{ color: 'var(--text-main)' }}
            >
              Organico
            </span>{' '}
            &middot; Everyday recyclable &amp; organic essentials across India.
          </div>

          <nav
            className="flex items-center gap-5 font-medium"
            aria-label="Footer navigation"
          >
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <Link href="/products" className="hover:underline">
              Products
            </Link>
            <Link href="/checkout" className="hover:underline">
              Checkout
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
