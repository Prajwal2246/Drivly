import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Drivly | Peer-to-Peer Society Vehicle Sharing",
  description: "Rent your unused car or bike to verified neighbors in your residential community. Earn passive income while building trusted local mobility.",
  keywords: ["vehicle sharing", "peer to peer car rental", "society vehicle sharing", "passive income", "neighborhood car share", "Drivly", "society mobility"],
  authors: [{ name: "Drivly Team" }],
  openGraph: {
    title: "Drivly | Peer-to-Peer Society Vehicle Sharing",
    description: "Rent your unused car or bike to verified neighbors in your society. Secure, convenient, and community-first.",
    type: "website",
    locale: "en_US",
    siteName: "Drivly",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 1200,
        alt: "Drivly Gated Society Sharing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Drivly | Peer-to-Peer Society Vehicle Sharing",
    description: "Rent your unused car or bike to verified neighbors in your society. Secure, convenient, and community-first.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased scroll-smooth ${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
