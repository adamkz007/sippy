import type { Metadata } from "next"
import { Work_Sans, Outfit } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"

const workSans = Work_Sans({ 
  subsets: ["latin"],
  variable: "--font-work-sans",
})

// Outfit ExtraBold for headings
const outfitHeading = Outfit({
  weight: "800",
  subsets: ["latin"],
  variable: "--font-outfit-heading",
})

export const metadata: Metadata = {
  title: "Sippy - Cafe Management Platform",
  description: "Every coffee counts, everywhere. POS, loyalty, and analytics for modern cafes.",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${workSans.variable} ${outfitHeading.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
