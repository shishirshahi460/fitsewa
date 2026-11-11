import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource/noto-sans-devanagari/400.css";
import "@fontsource/noto-sans-devanagari/500.css";
import "@fontsource/noto-sans-devanagari/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitSewa: Move Better. Live Healthier.",
  description: "Nepal-focused fitness, nutrition and wellness platform (in development).",
  referrer: "no-referrer" // keeps one-time email links out of Referer headers
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}