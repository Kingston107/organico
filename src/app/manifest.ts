import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Organico — Recyclable & Organic Essentials',
    short_name: 'Organico',
    description:
      'Plastic-free, recyclable, and organic everyday goods delivered across India.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F2F9F4',
    theme_color: '#237A4B',
    icons: [
      {
        src: '/icons/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}
