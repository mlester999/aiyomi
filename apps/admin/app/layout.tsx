import type { Metadata, Viewport } from "next";

import aiyomiLogo from "../../web/public/aiyomi-logo-cropped.png";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Aiyomi Admin",
    template: "%s | Aiyomi Admin",
  },
  description: "The secure operations workspace for Aiyomi.",
  icons: { icon: aiyomiLogo.src, apple: aiyomiLogo.src },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f8f4ea",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
