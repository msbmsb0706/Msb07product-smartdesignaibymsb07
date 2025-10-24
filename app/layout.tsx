import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Smart Design AI by MSB07 - AI-Powered Design Platform",
  description:
    "Transform your creative process with intelligent design tools that understand your vision and bring it to life instantly. Smart Design by MSB07 - From Image to Reality.",
  generator: "Smart Design AI by MSB07",
  keywords: ["AI design", "smart design", "MSB07", "artificial intelligence", "design platform", "image processing"],
  authors: [{ name: "MSB07" }],
  creator: "MSB07",
  publisher: "Smart Design by MSB07",
  openGraph: {
    title: "Smart Design AI by MSB07",
    description: "AI-Powered Design Platform - Transform your images into stunning designs",
    url: "https://smartdesignai.vercel.app",
    siteName: "Smart Design AI by MSB07",
    images: [
      {
        url: "/images/smart-design-logo.png",
        width: 1200,
        height: 630,
        alt: "Smart Design AI by MSB07",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Design AI by MSB07",
    description: "AI-Powered Design Platform - Transform your images into stunning designs",
    images: ["/images/smart-design-logo.png"],
    creator: "@msb07",
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
  icons: {
    icon: "/images/smart-design-logo.png",
    shortcut: "/images/smart-design-logo.png",
    apple: "/images/smart-design-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          {children}
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
