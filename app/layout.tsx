import type { Metadata } from "next"
import { Work_Sans, Outfit } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"

const workSans = Work_Sans({ 
  subsets: ["latin"],
  variable: "--font-work-sans",
})

// Using Outfit as a geometric sans alternative to Scandia (which is not on Google Fonts)
const scandia = Outfit({
  subsets: ["latin"],
  variable: "--font-scandia",
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
      <body className={`${workSans.variable} ${scandia.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

