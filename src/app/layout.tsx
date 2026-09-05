import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { JsonLd } from '@/components/JsonLd';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://slashsaas.com';

export const viewport: Viewport = {
  themeColor: '#08070f',
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <JsonLd />
      </head>
      <body className="min-h-full flex flex-col bg-[#08070f] text-zinc-100">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
