import type React from "react"
import type { Metadata, Viewport } from "next"
import { Outfit } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { QueryProvider } from "@/lib/providers/query-provider"
import { AuthProvider } from "@/lib/providers/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
})

export const metadata: Metadata = {
  title: "MUBAS Leo Club - Leadership, Experience, Opportunity",
  description:
    "Official platform for MUBAS Leo Club members. Join us in making a difference through community service, leadership development, and social activities.",
  keywords: ["MUBAS Leo Club", "Leo Club", "Leadership", "Community Service", "Youth Development"],
  authors: [{ name: "MUBAS Leo Club" }],
  openGraph: {
    title: "MUBAS Leo Club",
    description: "Leadership, Experience, Opportunity - Join us in making a difference",
    type: "website",
    locale: "en_US",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#F59E0B",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <body className="font-sans antialiased">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
