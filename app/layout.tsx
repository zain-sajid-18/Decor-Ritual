import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteUrl } from "@/lib/seo/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ZF Store | Curated Product Discovery",
    template: "%s | ZF Store",
  },
  description:
    "Discover purposeful, quality products curated across lifestyle and home decor. Verified items fulfilled by Amazon.",
  openGraph: {
    title: "ZF Store | Curated Product Discovery",
    description:
      "Discover purposeful, quality products curated across lifestyle and home decor. Verified items fulfilled by Amazon.",
    url: siteUrl,
    siteName: "ZF Store",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZF Store | Curated Product Discovery",
    description:
      "Discover purposeful, quality products curated across lifestyle and home decor. Verified items fulfilled by Amazon.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
