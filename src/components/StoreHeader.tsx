'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Leaf, Menu, MessageCircle, ShoppingBag, User, X } from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatusProvider';
import { useCart } from '@/components/CartContext';

export function StoreHeader() {
  const pathname = usePathname();
  const { totalItems, setAssistantOpen } = useCart();
  const { user } = useAuthStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
  ];

  const accountHref = user ? '/profile' : '/login';
  const accountLabel = user ? 'Profile' : 'Login';

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        backgroundColor: 'var(--header-bg)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-base font-bold tracking-tight"
            style={{ color: 'var(--text-main)' }}
          >
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Leaf className="h-4 w-4" />
            </span>
            <span>Organico</span>
          </Link>

          <nav
            className="hidden items-center gap-5 md:flex"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => {
              const active =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium transition-colors"
                  style={{
                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setAssistantOpen(true)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3"
            style={{
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent-soft-text)',
            }}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ask Assistant</span>
            <span className="sm:hidden">Guide</span>
          </button>

          <Link
            href={accountHref}
            className="hidden min-h-9 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors sm:inline-flex"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-main)',
            }}
          >
            <User className="h-3.5 w-3.5" />
            {accountLabel}
          </Link>

          <Link
            href="/checkout"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-95 sm:px-3.5"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Checkout</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[11px] leading-none">
              {totalItems}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border md:hidden"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-main)',
            }}
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="border-t px-4 py-3 md:hidden"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium"
              style={{ color: 'var(--text-main)' }}
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium"
              style={{ color: 'var(--text-main)' }}
            >
              Products
            </Link>
            <Link
              href="/checkout"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium"
              style={{ color: 'var(--text-main)' }}
            >
              Checkout ({totalItems})
            </Link>
            <Link
              href={accountHref}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium"
              style={{ color: 'var(--accent)' }}
            >
              {accountLabel}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
