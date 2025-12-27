import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PrepAI",
  description: "Created with AI",
  generator: "prepai.app",
  icons: {
    // Use YOUR new mark everywhere (Pack 6)
    icon: [
      { url: "/prepai-mark-1024.png", type: "image/png", sizes: "32x32" },
      { url: "/prepai-mark-1024.png", type: "image/png", sizes: "192x192" },
      { url: "/prepai-mark-1024.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/prepai-mark-1024.png", type: "image/png", sizes: "180x180" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
