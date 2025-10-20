"use client";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">Münih Sahne</Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#about" className="hover:underline">Biz Kimiz</a>
          <a href="#schedule" className="hover:underline">Takvim</a>
          <a href="#faq" className="hover:underline">SSS</a>
          <a href="#contact" className="hover:underline">İletişim</a>
        </nav>
        <a href="https://forms.gle/" target="_blank" rel="noreferrer"
           className="px-3 py-1.5 rounded bg-black text-white text-sm">
          Aramıza Katıl
        </a>
      </div>
    </header>
  );
}
