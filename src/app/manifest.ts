import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SlashSaaS',
    short_name: 'SlashSaaS',
    description: 'AI Search Visibility & Autonomous GEO Monitoring Platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#13131b',
    theme_color: '#13131b',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
