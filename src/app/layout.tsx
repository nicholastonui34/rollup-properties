import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
});

const DESCRIPTION =
  "Search verified rental and sale properties across Nairobi and Kenya. Real photos, real addresses, honest prices — and direct contact with property managers. No brokers.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nyoomba — Verified homes to rent & buy in Kenya",
    template: "%s | Nyoomba",
  },
  description: DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nyoomba",
  },
  icons: {
    apple: "/icons/icon-192",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_KE",
    title: "Nyoomba — Verified homes to rent & buy in Kenya",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Nyoomba — Verified homes to rent & buy in Kenya",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#1f4a3d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <RegisterServiceWorker />
        <InstallPrompt />
      </body>
    </html>
  );
}
