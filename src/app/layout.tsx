import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SlashSaaS — Slash Your Software Waste in 60 Seconds",
  description: "Detect inactive Notion, Figma, and AI tool seats in 60 seconds. Reclaim your wasted budget with autonomous 1-click Slack nudges.",
  keywords: ["SaaS spend management", "zombie license hunter", "startup finops", "license optimization", "slack nudge bot", "google workspace audit", "slashsaas"],
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
      <body className="min-h-full flex flex-col bg-black text-zinc-100 selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
