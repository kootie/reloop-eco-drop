import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { TranslationProvider } from "@/hooks/use-translation"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Reloop - E-waste Recycling Platform",
  description: "Recycle e-waste and earn Cardano rewards in Zugdidi, Georgia",
  generator: "Reloop Platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${inter.style.fontFamily};
}
        `}</style>
      </head>
      <body className={inter.className}>
        <TranslationProvider>{children}</TranslationProvider>
      </body>
    </html>
  )
}
