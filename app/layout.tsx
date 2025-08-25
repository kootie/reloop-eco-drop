import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TranslationProvider } from "@/hooks/use-translation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reloop - E-waste Recycling Platform",
  description: "Recycle e-waste and earn Cardano rewards in Zugdidi, Georgia",
  generator: "Reloop Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
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
      <body className={inter.className} suppressHydrationWarning={true}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Handle ethereum property conflicts from browser extensions
              if (typeof window !== 'undefined') {
                const originalDefineProperty = Object.defineProperty;
                Object.defineProperty = function(obj, prop, descriptor) {
                  if (obj === window && prop === 'ethereum') {
                    // Skip redefining ethereum property to avoid conflicts
                    return obj;
                  }
                  return originalDefineProperty.call(this, obj, prop, descriptor);
                };
              }
            `,
          }}
        />
        <TranslationProvider>{children}</TranslationProvider>
      </body>
    </html>
  );
}
