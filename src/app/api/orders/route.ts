import { NextResponse } from 'next/server';
import { calculateShippingInr } from '@/lib/catalog';
import { getCatalogProducts } from '@/lib/products-server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { OrderSummary } from '@/types/store';

interface OrderItemInput {
  slug: string;
  quantity: number;
}

interface OrderRequestBody {
  isGuest?: unknown;
  customerName?: unknown;
  customerEmail?: unknown;
  customerPhone?: unknown;
  shippingAddress?: unknown;
  city?: unknown;
  state?: unknown;
  pincode?: unknown;
  paymentMethod?: unknown;
  items?: unknown;
}

function asTrimmedString(value: unknown, maxLen = 200): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLen) : '';
}

function generateOrderNumber(): string {
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `ORG-${randomPart}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as OrderRequestBody;
    const customerName = asTrimmedString(body.customerName, 120);
    const customerEmail = asTrimmedString(body.customerEmail, 160);
    const customerPhone = asTrimmedString(body.customerPhone, 20);
    const shippingAddress = asTrimmedString(body.shippingAddress, 250);
    const city = asTrimmedString(body.city, 80);
    const state = asTrimmedString(body.state, 80);
    const pincode = asTrimmedString(body.pincode, 12);
    const paymentMethod =
      asTrimmedString(body.paymentMethod, 40) || 'upi_or_cod';

    if (
      !customerName ||
      !customerEmail.includes('@') ||
      !customerPhone ||
      !shippingAddress ||
      !city ||
      !state ||
      !/^\d{6}$/.test(pincode)
    ) {
      return NextResponse.json(
        {
          error:
            'Please complete all delivery fields, including a valid email and 6-digit PIN code.',
        },
        { status: 400 }
      );
    }

    const rawItems = Array.isArray(body.items) ? body.items : [];
    const parsedItems: OrderItemInput[] = rawItems
      .filter((item): item is { slug: unknown; quantity: unknown } =>
        Boolean(item && typeof item === 'object')
      )
      .map((item) => ({
        slug: asTrimmedString(item.slug, 80),
        quantity:
          typeof item.quantity === 'number' ? Math.floor(item.quantity) : 0,
      }))
      .filter(
        (item) =>
          item.slug.length > 0 && item.quantity > 0 && item.quantity <= 20
      );

    if (parsedItems.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty.' },
        { status: 400 }
      );
    }

    const catalog = await getCatalogProducts();
    const productMap = new Map(catalog.map((p) => [p.slug, p]));

    const resolvedItems = parsedItems.map((entry) => {
      const product = productMap.get(entry.slug);
      if (!product) {
        throw new Error(`Unknown product: ${entry.slug}`);
      }
      return {
        product,
        quantity: entry.quantity,
      };
    });

    const subtotalInr = resolvedItems.reduce(
      (sum, entry) => sum + entry.product.priceInr * entry.quantity,
      0
    );
    const shippingInr = calculateShippingInr(subtotalInr);
    const totalInr = subtotalInr + shippingInr;
    const orderNumber = generateOrderNumber();

    const supabase = await getSupabaseServerClient();
    let activeUserId: string | null = null;

    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      activeUserId = user?.id ?? null;

      const isGuestOrder = !activeUserId || body.isGuest === true;

      const { data: orderRow, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: isGuestOrder ? null : activeUserId,
          is_guest: isGuestOrder,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          shipping_address: shippingAddress,
          city,
          state,
          pincode,
          payment_method: paymentMethod,
          subtotal_inr: subtotalInr,
          shipping_inr: shippingInr,
          total_inr: totalInr,
          status: 'confirmed',
        })
        .select('id')
        .single();

      if (!orderError && orderRow) {
        const isUuid = (id: string): boolean =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            id
          );

        await supabase.from('order_items').insert(
          resolvedItems.map((entry) => ({
            order_id: orderRow.id as string,
            product_id: isUuid(entry.product.id) ? entry.product.id : null,
            product_slug: entry.product.slug,
            product_name: entry.product.name,
            unit_price_inr: entry.product.priceInr,
            quantity: entry.quantity,
          }))
        );
      }
    }

    const summary: OrderSummary = {
      orderNumber,
      isGuest: !activeUserId || body.isGuest === true,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      state,
      pincode,
      paymentMethod,
      subtotalInr,
      shippingInr,
      totalInr,
      createdAt: new Date().toISOString(),
      items: resolvedItems.map((entry) => ({
        slug: entry.product.slug,
        name: entry.product.name,
        unitPriceInr: entry.product.priceInr,
        quantity: entry.quantity,
      })),
    };

    return NextResponse.json({ order: summary }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unable to place order.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
