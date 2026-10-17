import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tiruf Healthcare Shifts',
    short_name: 'Tiruf',
    description: 'On-demand clinical shifts for healthcare workers and hospitals in Addis Ababa',
    start_url: '/',
    display: 'standalone',
    background_color: '#1C2F72',
    theme_color: '#1C2F72',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
