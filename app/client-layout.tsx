"use client"

import type React from "react"

import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { useEffect } from "react"

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch((err) => {
        console.log("Service Worker registration failed:", err)
      })
    }
  }, [])

  return (
    <Suspense fallback={null}>
      {children}
      <Analytics />
    </Suspense>
  )
}

export default ClientLayout
