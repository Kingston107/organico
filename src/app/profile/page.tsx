'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { LogOut, Package } from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatusProvider';
import { formatInr } from '@/lib/catalog';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface SavedOrderRow {
  id: string;
  order_number: string;
  total_inr: number;
  status: string;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStatus();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [orders, setOrders] = useState<SavedOrderRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase
      .from('profiles')
      .select('full_name, phone, address_line, city, state, pincode')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setFullName((data.full_name as string) ?? '');
        setPhone((data.phone as string) ?? '');
        setAddressLine((data.address_line as string) ?? '');
        setCity((data.city as string) ?? '');
        setStateName((data.state as string) ?? '');
        setPincode((data.pincode as string) ?? '');
      });

    supabase
      .from('orders')
      .select('id, order_number, total_inr, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data as SavedOrderRow[]);
      });
  }, [user]);

  async function handleSaveProfile(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    if (!user) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setSaving(true);
    setNotice(null);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
        address_line: addressLine.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pincode: pincode.trim(),
        updated_at: new Date().toISOString(),
      });
      setNotice(error ? error.message : 'Your delivery details were saved.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut(): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/');
    router.refresh();
  }

  if (authLoading) {
    return (
      <section
        className="mx-auto max-w-3xl px-4 py-12 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        Loading your profile...
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-md px-4 py-12">
        <div
          className="space-y-4 border p-6 text-center"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--card-radius)',
          }}
        >
          <h1
            className="text-lg font-bold"
            style={{ color: 'var(--text-main)' }}
          >
            Sign in to view your profile
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Manage your saved delivery address and track past orders.
          </p>
          <Link
            href="/login"
            className="inline-flex min-h-10 items-center justify-center rounded-lg px-5 py-2 text-xs font-semibold text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Go to Login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-main)' }}
          >
            Your Profile
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Signed in as {user.email}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3.5 text-xs font-semibold"
          style={{
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-main)',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <form
          onSubmit={handleSaveProfile}
          className="space-y-3 border p-5 md:col-span-6"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--card-radius)',
          }}
        >
          <h2
            className="text-sm font-bold"
            style={{ color: 'var(--text-main)' }}
          >
            Saved Delivery Address
          </h2>
          {notice && (
            <p
              className="text-xs font-medium"
              style={{ color: 'var(--accent)' }}
            >
              {notice}
            </p>
          )}
          <input
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
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Mobile number"
            className="min-h-10 w-full rounded-lg border px-3 text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-page)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-main)',
            }}
          />
          <input
            type="text"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            placeholder="Street address"
            className="min-h-10 w-full rounded-lg border px-3 text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-page)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-main)',
            }}
          />
          <div className="grid grid-cols-3 gap-2">
            <input
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
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="PIN code"
              className="min-h-10 rounded-lg border px-3 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bg-page)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-main)',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="min-h-10 rounded-lg px-4 text-xs font-semibold text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {saving ? 'Saving...' : 'Save Address'}
          </button>
        </form>

        <div
          className="space-y-3 border p-5 md:col-span-6"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--card-radius)',
          }}
        >
          <h2
            className="text-sm font-bold"
            style={{ color: 'var(--text-main)' }}
          >
            Past Orders
          </h2>
          {orders.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              No orders placed on this account yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-xs"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <Package
                      className="h-4 w-4"
                      style={{ color: 'var(--accent)' }}
                    />
                    <div>
                      <div
                        className="font-semibold"
                        style={{ color: 'var(--text-main)' }}
                      >
                        {order.order_number}
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="font-bold"
                      style={{ color: 'var(--text-main)' }}
                    >
                      {formatInr(order.total_inr)}
                    </div>
                    <div
                      className="capitalize"
                      style={{ color: 'var(--accent)' }}
                    >
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
