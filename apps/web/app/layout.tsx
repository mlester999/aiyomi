import type { Metadata, Viewport } from "next";
import { brandConfig } from "@aiyomi/config";
import { WaitlistDialog } from "@/components/waitlist-dialog";
import "./globals.css";
import "./polish.css";

const siteUrl = brandConfig.siteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brandConfig.name} | ${brandConfig.tagline}`,
    template: `%s | ${brandConfig.name}`,
  },
  description: brandConfig.description,
  applicationName: brandConfig.name,
  alternates: { canonical: "/" },
  keywords: [
    "AI life companion",
    "daily planning",
    "focus timer",
    "habit building",
    "personal growth",
    "day reflection",
  ],
  openGraph: {
    type: "website",
    url: "/",
    siteName: brandConfig.name,
    title: `${brandConfig.name} | ${brandConfig.tagline}`,
    description: brandConfig.description,
    images: [{ url: "/social/og-aiyomi-v2.jpg", width: 1200, height: 630, type: "image/jpeg", alt: "Aiyomi, your AI companion for better days" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brandConfig.name} | ${brandConfig.tagline}`,
    description: brandConfig.description,
    images: ["/social/og-aiyomi-v2.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#fbf7ee",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: brandConfig.name,
  description: brandConfig.description,
  url: siteUrl,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        {children}
        <WaitlistDialog />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
