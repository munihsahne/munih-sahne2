// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Münih Sahne",
  description: "Münih’te erişilebilir, kolektif ve yaşayan tiyatro.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Tailwind (Play CDN) */}
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        {/* (İsteğe bağlı) küçük renk konfigi */}
        <Script id="tw-config" strategy="beforeInteractive">{`
          tailwind.config = {
            theme: { extend: {
              colors: {
                oxford: '#0B132B',
                bavaria:'#0077B6',
                warm:   '#EDE7E3',
                ink:    '#09090B'
              }
            }}
          }
        `}</Script>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
