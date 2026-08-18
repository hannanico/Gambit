import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SerwistProvider } from "@serwist/next/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Gambit — Offline Chess Puzzles",
    template: "%s | Gambit",
  },
  description: "Download chess puzzle packs and solve offline.",
  applicationName: "Gambit",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gambit",
  },
  icons: {
    icon: "/icons/gambit-icon-192.png",
    apple: "/icons/gambit-icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
  <SerwistProvider
    disable={process.env.NODE_ENV === "development"}
    swUrl="/sw.js"
  >
    {children}
  </SerwistProvider>
</body>
    </html>
  );
}
