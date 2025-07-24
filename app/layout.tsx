import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import StarryBackground from "@/components/StarryBackground"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CloudHire - Technical Assessment",
  description: "AI-powered technical assessment platform",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* The body is made transparent to see the canvas behind it. */}
      <body className={`${inter.className} bg-transparent`}>
        <StarryBackground />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {/* The main content area is now the scrollable container */}
          <main className="relative z-10 h-screen overflow-y-auto">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
