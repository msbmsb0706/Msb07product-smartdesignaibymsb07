import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ClientLayout } from "./client-layout"

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
      <head>
        <meta name="theme-color" content="#0b1220" />
        <meta name="mobile-web-app-capable" content="true" />
        <meta name="apple-mobile-web-app-capable" content="true" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/smart-design-logo.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/service-worker.js').then(
                    (registration) => {
                      console.log('[v0] Service Worker registered:', registration);
                    },
                    (error) => {
                      console.log('[v0] Service Worker registration failed:', error);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
