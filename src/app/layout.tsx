import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { JsonLd } from '@/components/JsonLd';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://slashsaas.com';

export const viewport: Viewport = {
  themeColor: '#13131b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'SlashSaaS — AI Search Visibility Monitoring',
    template: '%s | SlashSaaS',
  },
  description:
    'Track how ChatGPT, Perplexity, Google AI and Gemini answer about your brand versus competitors — every day. Visibility score, share of voice, citation sources, and change alerts. Public data only, no account connections.',
  keywords: [
    'AI search visibility',
    'generative engine optimization',
    'GEO monitoring',
    'ChatGPT brand monitoring',
    'Perplexity visibility',
    'AI SEO',
    'share of voice',
    'brand monitoring',
    'SlashSaaS',
  ],
  authors: [{ name: 'SlashSaaS', url: siteUrl }],
  creator: 'SlashSaaS',
  publisher: 'SlashSaaS',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'SlashSaaS — AI Search Visibility Monitoring',
    description:
      'See how ChatGPT, Perplexity, Google AI and Gemini answer about your brand versus competitors — daily. Visibility score, share of voice, citations, and alerts.',
    siteName: 'SlashSaaS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SlashSaaS — AI Search Visibility Monitoring',
    description:
      'See how ChatGPT, Perplexity, Google AI and Gemini answer about your brand versus competitors — daily. Visibility score, share of voice, citations, and alerts.',
    creator: '@slashsaas',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${jetbrains.variable} h-full antialiased dark`}
    >
      <head>
        <JsonLd />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-on-surface">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
