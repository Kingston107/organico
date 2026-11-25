import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { AuthStatusProvider } from '@/components/AuthStatusProvider';
import { CartProvider } from '@/components/CartContext';
import { SideAssistantDrawer } from '@/components/SideAssistantDrawer';
import { StoreFooter } from '@/components/StoreFooter';
import { StoreHeader } from '@/components/StoreHeader';
import { getCatalogProducts } from '@/lib/products-server';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Organico — Recyclable & Organic Everyday Goods',
    template: '%s | Organico',
  },
  description:
    'Thoughtful plastic-free, recyclable, and organic home essentials priced fairly in Indian Rupees.',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const products = await getCatalogProducts();

  return (
    <html lang="en">
      <body className="min-h-screen antialiased flex flex-col">
        <AuthStatusProvider>
          <CartProvider>
            <StoreHeader />
            <main className="flex-1">{children}</main>
            <StoreFooter />
            <SideAssistantDrawer products={products} />
          </CartProvider>
        </AuthStatusProvider>
      </body>
    </html>
  );
}
