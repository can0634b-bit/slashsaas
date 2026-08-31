import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/JsonLd";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://slashsaas.com";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SlashSaaS — Slash Your Software Waste in 60 Seconds",
    template: "%s | SlashSaaS",
  },
  description:
    "Detect inactive Notion, Figma, and AI tool seats in 60 seconds. Reclaim your wasted startup budget with autonomous 1-click Slack license nudges.",
  keywords: [
    "SaaS spend management",
    "zombie license hunter",
    "startup finops",
    "software license optimization",
    "slack nudge bot",
    "google workspace audit",
    "slashsaas",
    "shadow IT detector",
  ],
  authors: [{ name: "SlashSaaS", url: siteUrl }],
  creator: "SlashSaaS",
  publisher: "SlashSaaS",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "SlashSaaS — Slash Your Software Waste in 60 Seconds",
    description:
      "Detect inactive Notion, Figma, and AI tool seats in 60 seconds. Reclaim your wasted startup budget with autonomous 1-click Slack license nudges.",
    siteName: "SlashSaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "SlashSaaS — Slash Your Software Waste in 60 Seconds",
    description:
      "Detect inactive Notion, Figma, and AI tool seats in 60 seconds. Reclaim your wasted startup budget with autonomous 1-click Slack license nudges.",
    creator: "@slashsaas",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
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
      <body className="min-h-full flex flex-col bg-black text-zinc-100 selection:bg-white selection:text-black">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
