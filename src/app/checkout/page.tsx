'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, Minus, Plus, Trash2 } from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatusProvider';
import { useCart } from '@/components/CartContext';
import { FREE_SHIPPING_THRESHOLD_INR, formatInr } from '@/lib/catalog';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { OrderSummary } from '@/types/store';

export default function CheckoutPage() {
  const { user } = useAuthStatus();
  const {
    items,
    subtotalInr,
    shippingInr,
    totalInr,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'member'>('guest');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderSummary | null>(
    null
  );

  useEffect(() => {
    if (!user) {
      setCheckoutMode('guest');
      return;
    }
    setCheckoutMode('member');
    if (user.email) setCustomerEmail(user.email);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase
      .from('profiles')
      .select('full_name, phone, address_line, city, state, pincode')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        if (data.full_name) setCustomerName(data.full_name as string);
        if (data.phone) setCustomerPhone(data.phone as string);
        if (data.address_line) setShippingAddress(data.address_line as string);
        if (data.city) setCity(data.city as string);
        if (data.state) setStateName(data.state as string);
        if (data.pincode) setPincode(data.pincode as string);
      });
  }, [user]);

  async function handlePlaceOrder(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isGuest: checkoutMode === 'guest',
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          city,
          state: stateName,
          pincode,
          paymentMethod,
          items: items.map((entry) => ({
            slug: entry.product.slug,
            quantity: entry.quantity,
          })),
        }),
      });

      const data = (await res.json()) as {
        order?: OrderSummary;
        error?: string;
      };

      if (!res.ok || !data.order) {
        setError(data.error ?? 'Could not complete checkout.');
        return;
      }

      setConfirmedOrder(data.order);
      clearCart();
    } catch {
      setError('Network issue while placing your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedOrder) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div
          className="space-y-5 border p-6 sm:p-8"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--card-radius)',
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--accent-soft-text)',
              }}
            >
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: 'var(--text-main)' }}
              >
                Order Confirmed ({confirmedOrder.orderNumber})
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Confirmation sent to {confirmedOrder.customerEmail}
              </p>
            </div>
          </div>

          <div
            className="space-y-2 border-t border-b py-4 text-xs"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            {confirmedOrder.items.map((item) => (
              <div key={item.slug} className="flex justify-between">
                <span style={{ color: 'var(--text-main)' }}>
                  {item.name} &times; {item.quantity}
                </span>
                <span
                  className="font-semibold"
                  style={{ color: 'var(--text-main)' }}
                >
                  {formatInr(item.unitPriceInr * item.quantity)}
                </span>
              </div>
            ))}
            <div
              className="flex justify-between pt-2"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>Shipping</span>
              <span>
                {confirmedOrder.shippingInr === 0
                  ? 'Free'
                  : formatInr(confirmedOrder.shippingInr)}
              </span>
            </div>
            <div
              className="flex justify-between text-sm font-bold"
              style={{ color: 'var(--text-main)' }}
            >
              <span>Total Paid / Due</span>
              <span>{formatInr(confirmedOrder.totalInr)}</span>
            </div>
          </div>

          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Delivering to: {confirmedOrder.customerName},{' '}
            {confirmedOrder.shippingAddress}, {confirmedOrder.city},{' '}
            {confirmedOrder.state} - {confirmedOrder.pincode}
          </div>

          <Link
            href="/products"
            className="inline-flex min-h-10 items-center justify-center rounded-lg px-5 py-2 text-xs font-semibold text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: 'var(--text-main)' }}
        >
          Checkout
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Order quickly as a guest or use your signed-in account details.
        </p>
      </div>

      {items.length === 0 ? (
        <div
          className="space-y-4 border p-8 text-center"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--card-radius)',
          }}
        >
          <p
            className="text-base font-semibold"
            style={{ color: 'var(--text-main)' }}
          >
            Your bag is empty.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Add recyclable or organic items from our catalog to check out.
          </p>
          <Link
            href="/products"
            className="inline-flex min-h-10 items-center justify-center rounded-lg px-5 py-2 text-xs font-semibold text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <form
            onSubmit={handlePlaceOrder}
            className="space-y-4 border p-5 sm:p-6 lg:col-span-7"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              borderRadius: 'var(--card-radius)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                className="text-base font-bold"
                style={{ color: 'var(--text-main)' }}
              >
                Delivery Details
              </h2>

              <div
                className="inline-flex rounded-lg p-0.5"
                style={{ backgroundColor: 'var(--bg-hero)' }}
              >
                <button
                  type="button"
                  onClick={() => setCheckoutMode('guest')}
                  className="rounded-md px-3 py-1 text-xs font-semibold"
                  style={
                    checkoutMode === 'guest'
                      ? { backgroundColor: 'var(--accent)', color: '#FFFFFF' }
                      : { color: 'var(--text-muted)' }
                  }
                >
                  Guest Checkout
                </button>
                {user ? (
                  <button
                    type="button"
                    onClick={() => setCheckoutMode('member')}
                    className="rounded-md px-3 py-1 text-xs font-semibold"
                    style={
                      checkoutMode === 'member'
                        ? { backgroundColor: 'var(--accent)', color: '#FFFFFF' }
                        : { color: 'var(--text-muted)' }
                    }
                  >
                    Signed-In
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-md px-3 py-1 text-xs font-semibold"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                required
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full name"
                className="min-h-10 rounded-lg border px-3 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              />
              <input
                required
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Email for receipt"
                className="min-h-10 rounded-lg border px-3 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              />
            </div>

            <input
              required
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Mobile number (10 digits)"
              className="min-h-10 w-full rounded-lg border px-3 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bg-page)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-main)',
              }}
            />

            <input
              required
              type="text"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="House / Street / Locality"
              className="min-h-10 w-full rounded-lg border px-3 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bg-page)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-main)',
              }}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                required
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="min-h-10 rounded-lg border px-3 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              />
              <input
                required
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="State"
                className="min-h-10 rounded-lg border px-3 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              />
              <input
                required
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="6-digit PIN code"
                className="min-h-10 rounded-lg border px-3 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              />
            </div>

            <div className="space-y-2 pt-1">
              <div
                className="text-xs font-semibold"
                style={{ color: 'var(--text-main)' }}
              >
                Payment Method
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upi', label: 'UPI' },
                  { id: 'card', label: 'Card' },
                  { id: 'cod', label: 'Cash on Delivery' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id)}
                    className="min-h-10 rounded-lg border px-2 py-2 text-xs font-semibold transition-colors"
                    style={
                      paymentMethod === opt.id
                        ? {
                            backgroundColor: 'var(--accent-soft)',
                            borderColor: 'var(--accent)',
                            color: 'var(--accent-soft-text)',
                          }
                        : {
                            backgroundColor: 'var(--bg-page)',
                            borderColor: 'var(--border-subtle)',
                            color: 'var(--text-muted)',
                          }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="min-h-11 w-full rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {submitting
                ? 'Placing Order...'
                : `Place Order (${formatInr(totalInr)})`}
            </button>
          </form>

          <aside
            className="h-fit space-y-4 border p-5 sm:p-6 lg:col-span-5"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              borderRadius: 'var(--card-radius)',
            }}
          >
            <h2
              className="text-base font-bold"
              style={{ color: 'var(--text-main)' }}
            >
              Order Summary
            </h2>

            <div className="space-y-3">
              {items.map((entry) => (
                <div
                  key={entry.product.slug}
                  className="flex items-center justify-between gap-3 border-b pb-3"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={entry.product.imageUrl}
                      alt={entry.product.name}
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <div
                        className="truncate text-xs font-semibold"
                        style={{ color: 'var(--text-main)' }}
                      >
                        {entry.product.name}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {formatInr(entry.product.priceInr)} each
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(entry.product.slug, entry.quantity - 1)
                      }
                      aria-label={`Decrease ${entry.product.name}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded border"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-semibold">
                      {entry.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(entry.product.slug, entry.quantity + 1)
                      }
                      aria-label={`Increase ${entry.product.name}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded border"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(entry.product.slug)}
                      aria-label={`Remove ${entry.product.name}`}
                      className="inline-flex h-7 w-7 items-center justify-center text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs">
              <div
                className="flex justify-between"
                style={{ color: 'var(--text-muted)' }}
              >
                <span>Subtotal</span>
                <span>{formatInr(subtotalInr)}</span>
              </div>
              <div
                className="flex justify-between"
                style={{ color: 'var(--text-muted)' }}
              >
                <span>Shipping</span>
                <span>
                  {shippingInr === 0 ? 'Free' : formatInr(shippingInr)}
                </span>
              </div>
              {shippingInr > 0 && (
                <p className="text-xs" style={{ color: 'var(--accent)' }}>
                  Add {formatInr(FREE_SHIPPING_THRESHOLD_INR - subtotalInr)}{' '}
                  more for free shipping.
                </p>
              )}
              <div
                className="flex justify-between border-t pt-2.5 text-base font-bold"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-main)',
                }}
              >
                <span>Total</span>
                <span>{formatInr(totalInr)}</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
