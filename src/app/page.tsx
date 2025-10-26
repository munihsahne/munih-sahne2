"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, MapPin, Users, Mail, ChevronRight, X, Menu, ChevronDown, Megaphone } from "lucide-react";

type CSSVars = React.CSSProperties & Record<string, string>;

/** =====================
 *  BRAND TOKENS
 *  ===================== */
const PALETTE = {
  white: "#FFFFFF",
  black: "#09090B",
  oxford: "#0B132B",
  bavaria: "#0077B6",
  warmWhite: "#EDE7E3",
  dustyRose: "#BBA2A0",
  mutedRed: "#A44A3F",
  border: "#E6E6E6",
};

/** =====================
 *  ORG / EVENT CONFIG
 *  ===================== */
const ORG = {
  name: "Münih Sahne",
  email: "munihsahne@gmail.com",
  city: "Münih",
  instagram: "https://instagram.com/munihsahne",
  googleForm: "",
  logoSrc: "/logo.png",
};

const MEETUP = {
  title: "Tanışma Toplantısı / İlk Çalışma",
  date: "2025-11-03",
  startTime: "19:30",
  endTime: "22:00",
  location: "Fat Cat / Kellerstraße 8a, 81667 München",
  details:
    "Münih Sahne tanışma toplantısı. Kolektif yapımız, prova takvimi ve 2025–2026 dönemi hakkında bilgilendirme.",
};

/** =====================
 *  HELPERS (Calendar/Date)
 *  ===================== */
function toUtcCalString(localDate: string, time: string) {
  const [y, m, d] = localDate.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    dt.getUTCFullYear().toString() +
    pad(dt.getUTCMonth() + 1) +
    pad(dt.getUTCDate()) +
    "T" +
    pad(dt.getUTCHours()) +
    pad(dt.getUTCMinutes()) +
    pad(dt.getUTCSeconds()) +
    "Z"
  );
}
function buildICS(opts: typeof MEETUP) {
  const dtStart = toUtcCalString(opts.date, opts.startTime);
  const dtEnd = toUtcCalString(opts.date, opts.endTime);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MunihSahne//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@munihsahne`,
    `DTSTAMP:${dtStart}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${opts.title}`,
    `DESCRIPTION:${opts.details.replace(/\n/g, "\\n")}`,
    `LOCATION:${opts.location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
function downloadICS(filename: string, ics: string) {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function googleCalendarLink(opts: typeof MEETUP) {
  const start = toUtcCalString(opts.date, opts.startTime).replace(/[-:]/g, "");
  const end = toUtcCalString(opts.date, opts.endTime).replace(/[-:]/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${start}/${end}`,
    details: opts.details,
    location: opts.location,
    ctz: "Europe/Berlin",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
function formatDateTR(dateStr: string) {
  const dt = new Date(dateStr + "T00:00:00");
  return dt.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
}
function pad2(n: number) { return n.toString().padStart(2, "0"); }
function yyyymmddLocal(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function datesOfWeekdayInMonth(year: number, monthIndex0: number, weekday: number) {
  const first = new Date(year, monthIndex0, 1);
  const last = new Date(year, monthIndex0 + 1, 0);
  const out: string[] = [];
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === weekday) out.push(yyyymmddLocal(d));
  }
  return out;
}
function classNames(...cn: (string | false | undefined)[]) {
  return cn.filter(Boolean).join(" ");
}

/** =====================
 *  PAGE
 *  ===================== */
export default function Home() {
  const [open, setOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // CTA close memory
  const [ctaClosed, setCtaClosed] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("ms-cta-closed") === "1") {
      setCtaClosed(true);
    }
  }, []);
  const closeCta = () => {
    setCtaClosed(true);
    try { localStorage.setItem("ms-cta-closed", "1"); } catch {}
  };

  const meetupDateLabel = useMemo(() => formatDateTR(MEETUP.date), []);
  const gcal = useMemo(() => googleCalendarLink(MEETUP), []);

  // Eğitim takvimi (Kasım–Aralık Pazartesileri, 19:30–22:00)
  const year = useMemo(() => Number(MEETUP.date.slice(0, 4)), []);
  const kasimDates = useMemo(() => datesOfWeekdayInMonth(year, 10, 1), [year]); // Mon
  const aralikDates = useMemo(() => datesOfWeekdayInMonth(year, 11, 1), [year]); // Mon
  const egitimSaat = "19:30–22:00";

  // 29 Aralık eğitim yok
  const noClassDates = useMemo(() => [`${year}-12-29`], [year]);
  const aralikDatesShown = useMemo(
    () => aralikDates.filter((d) => !noClassDates.includes(d)),
    [aralikDates, noClassDates]
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const nextEventCta = !ctaClosed && (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-6xl px-5 py-3 flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3 text-sm text-neutral-700">
          <Megaphone className="h-5 w-5 text-[color:var(--accent)]" />
          <div>
            <div className="font-medium">{MEETUP.title}</div>
            <div className="opacity-70">
              {meetupDateLabel} • {MEETUP.startTime}–{MEETUP.endTime} • {MEETUP.location}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOpen(true)} className="px-4 py-2 rounded text-sm text-white shadow-sm" style={{ background: PALETTE.bavaria }}>
            Kayıt Ol
          </button>
          <button
            onClick={() => downloadICS("tanisma-toplantisi.ics", buildICS(MEETUP))}
            className="px-3 py-2 rounded border text-sm hover:bg-neutral-50"
          >
            Takvime Ekle
          </button>
          <a
            href={gcal}
            target="_blank"
            className="px-3 py-2 rounded border text-sm hover:bg-neutral-50"
          >
            Google Calendar
          </a>
          <button
            onClick={closeCta}
            aria-label="Kapat"
            className="ml-1 p-1 rounded border border-[color:var(--border)] hover:bg-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // CSS variables (force LIGHT only)
  const mainStyle: CSSVars = {
    background: "var(--page-bg)",
    "--page-bg": PALETTE.white,
    "--card-bg": "#FFFFFF",
    "--subtle": PALETTE.warmWhite,
    "--border": PALETTE.border,
    "--accent": PALETTE.bavaria,
    "--heading": PALETTE.oxford,
    "--fg": "#111111",
    "--muted-fg": "#6b7280",
    "--field-bg": "#FFFFFF",
  };

  return (
    <main className="min-h-screen text-neutral-900" style={mainStyle}>
      <style>{`
        /* LIGHT ONLY */
        :root {
          --page-bg: ${PALETTE.white};
          --card-bg: #FFFFFF;
          --subtle: ${PALETTE.warmWhite};
          --border: ${PALETTE.border};
          --accent: ${PALETTE.bavaria};
          --heading: ${PALETTE.oxford};
          --fg: #111111;
          --muted-fg: #6b7280;
          --field-bg: #FFFFFF;
        }
        html { color-scheme: light; }
        body, html { background: var(--page-bg); }

        /* iOS Safari form dark-auto fix */
        input, select, textarea, button {
          color: var(--fg);
          background: var(--field-bg);
          border-color: var(--border);
          -webkit-text-size-adjust: 100%;
          color-scheme: light;
        }
        input::placeholder, textarea::placeholder {
          color: var(--muted-fg);
          opacity: 1;
        }
        @supports (-webkit-touch-callout: none) {
          input, select, textarea {
            background-color: var(--field-bg) !important;
            color: var(--fg) !important;
          }
        }
      `}</style>

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3">
            <Image
              src={ORG.logoSrc}
              alt="Münih Sahne"
              width={32}
              height={32}
              priority
              className="rounded object-cover ring-1 ring-[color:var(--border)]"
            />
            <span className="font-semibold tracking-tight text-[color:var(--heading)]">Münih Sahne</span>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {[
              { href: "#top", label: "Biz Kimiz" },
              { href: "#events", label: "Yaklaşan Etkinlikler" },
              { href: "#education", label: "Eğitim Takvimi" },
              { href: "#faq", label: "SSS" },
              { href: "#contact", label: "İletişim" },
            ].map((i) => (
              <a key={i.href} href={i.href} className="text-neutral-700 hover:text-[color:var(--accent)]">
                {i.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => setOpen(true)} className="hidden md:inline-flex px-3 py-1.5 rounded text-sm text-white shadow-sm" style={{ background: PALETTE.bavaria }}>
              Ön Kayıt
            </button>
            <button onClick={() => setMobileNav((v) => !v)} className="md:hidden p-2 rounded border border-[color:var(--border)]">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
        {mobileNav && (
          <div className="md:hidden border-t border-[color:var(--border)] bg-[color:var(--card-bg)]">
            <div className="mx-auto max-w-6xl px-5 py-3 grid gap-2 text-sm">
              {["Biz Kimiz", "Yaklaşan Etkinlikler", "Eğitim Takvimi", "SSS", "İletişim"].map((label, i) => (
                <a key={i} href={`#${["top", "events", "education", "faq", "contact"][i]}`} className="flex items-center justify-between py-2">
                  {label}
                  <ChevronRight className="h-4 w-4" />
                </a>
              ))}
              <button onClick={() => setOpen(true)} className="mt-2 px-3 py-2 rounded text-white" style={{ background: PALETTE.bavaria }}>
                Ön Kayıt
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="top" className="mx-auto max-w-6xl px-5 pt-16 pb-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--subtle)] px-3 py-1 text-xs text-neutral-700">
              <Users className="h-4 w-4 text-[color:var(--accent)]" />
              Herkese Açık
            </span>
            <h1 className="text-4xl md:text-5xl font-semibold mt-4 text-[color:var(--heading)]">Münih Sahne</h1>
            <p className="mt-4 text-lg text-neutral-700">
              Biz; amatör ruhla profesyonel özeni buluşturan kolektif bir tiyatro topluluğuyuz.
              <br /><br />
              Kimimiz yeni, kimimiz yıllardır bu işin içinde. Ama hepimiz aynı heyecanla öğreniyor, eğleniyor, ve sahne alıyoruz.
              <br /><br />
              Münih Sahne; herkesin kendine yer bulduğu, birlikte ürettiği bir topluluk. Sen de aramıza katılmak ister misin?
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => setOpen(true)} className="px-5 py-2.5 rounded text-white shadow-sm" style={{ background: PALETTE.bavaria }}>
                Ön Kayıt
              </button>
              <a href={ORG.instagram} target="_blank" className="px-5 py-2.5 rounded border border-[color:var(--border)] text-neutral-800">
                Instagram
              </a>
            </div>
          </div>

          {/* Highlight Card */}
          <div className="relative">
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-bg)] p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <CalendarDays className="h-4 w-4" /> Yaklaşan: Tanışma / İlk Çalışma
              </div>
              <div className="mt-2 text-xl font-semibold text-[color:var(--heading)]">{MEETUP.title}</div>
              <div className="mt-1 text-sm text-neutral-700 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{meetupDateLabel} • {MEETUP.startTime}–{MEETUP.endTime}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{MEETUP.location}</span>
              </div>
              <p className="mt-3 text-sm text-neutral-700">{MEETUP.details}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => setOpen(true)} className="px-4 py-2 rounded text-sm text-white" style={{ background: PALETTE.bavaria }}>
                  Kayıt Ol
                </button>
                <button onClick={() => downloadICS("tanisma-toplantisi.ics", buildICS(MEETUP))} className="px-3 py-2 rounded border text-sm hover:bg-neutral-50">
                  Takvime ekle (.ics)
                </button>
                <a href={gcal} target="_blank" className="px-3 py-2 rounded border text-sm hover:bg-neutral-50">
                  Google Calendar
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { t: "Detaylı eğitim program ve düzenli prova takvimi" },
            { t: "Gelişen ve değişen, yaşayan tiyatro bakış açısı" },
            { t: "Amatör ruh, profesyonel bilinç" },
          ].map((k, i) => (
            <div key={i} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-bg)] p-5">
              <div className="text-sm font-medium text-[color:var(--heading)]">{k.t}</div>
              <div className="mt-1 text-sm text-neutral-700" />
            </div>
          ))}
        </div>
      </section>

      {/* EVENTS (empty) */}
      <section id="events" className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-2xl font-semibold text-[color:var(--heading)]">Yaklaşan Etkinlikler</h2>
        <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-bg)] p-5">
          <p className="text-sm text-neutral-700">
            Henüz planlanan bir etkinlik yok. Gelişmelerden haberdar olmak için Instagram hesabımızı takip edebilirsiniz.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => setOpen(true)} className="px-3 py-2 rounded text-white" style={{ background: PALETTE.bavaria }}>
              Aramıza Katıl
            </button>
            <a href={ORG.instagram} target="_blank" className="px-3 py-2 rounded border border-[color:var(--border)]">
              Instagram
            </a>
          </div>
        </div>
      </section>

      {/* EDUCATION (Kasım–Aralık) */}
      <section id="education" className="mx-auto max-w-6xl px-5 py-12">
        <h3 className="text-xl font-semibold text-[color:var(--heading)]">Eğitim Takvimi (Kasım–Aralık {year})</h3>
        <p className="mt-2 text-sm text-neutral-700">
          Tüm oturumlar Pazartesi günleri {egitimSaat} arasında yapılır.
        </p>

        <div className="mt-4 grid md:grid-cols-2 gap-6">
          {/* Kasım */}
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-bg)] p-5">
            <div className="font-medium text-[color:var(--heading)]">Kasım {year} • Pazartesi {egitimSaat}</div>
            <ul className="mt-3 text-sm text-neutral-700 grid gap-1">
              {kasimDates.length === 0 && <li>Bu ay için tarih bulunamadı</li>}
              {kasimDates.map((d) => (
                <li key={d} className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {formatDateTR(d)}
                </li>
              ))}
            </ul>
          </div>

          {/* Aralık */}
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-bg)] p-5">
            <div className="font-medium text-[color:var(--heading)]">Aralık {year} • Pazartesi {egitimSaat}</div>
            <ul className="mt-3 text-sm text-neutral-700 grid gap-1">
              {aralikDatesShown.length === 0 && <li>Bu ay için tarih bulunamadı</li>}
              {aralikDatesShown.map((d) => (
                <li key={d} className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {formatDateTR(d)}
                </li>
              ))}
              {noClassDates.map((d) => (
                <li key={d} className="flex items-center gap-2 opacity-80">
                  <CalendarDays className="h-4 w-4" />
                  {formatDateTR(d)} — eğitim yok
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ (left aligned) */}
      <section id="faq" className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-2xl font-semibold text-[color:var(--heading)]">Sıkça Sorulanlar</h2>
        <div className="mt-4 max-w-3xl pl-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-bg)] divide-y">
          {[
            { q: "Deneyim gerekiyor mu?", a: "Hayır. İlk kez geliyorsan kısa bir tanışma ve ısınma yapıyoruz; sonra akışa dahil oluyorsun." },
            { q: "Devamlılık kuralı var mı?", a: "Eğitim ve provalara düzenli katılım beklenir. Arada kaçıracaksan önceden haber vermen yeterli." },
            { q: "Herhangi bir ücret var mı?", a: "Salon ve teknik giderleri dönem başında birlikte netleştirip şeffafça paylaşıyoruz." },
            { q: "Dil?", a: "Eğitim ve oyun dilimiz Türkçe; gerektiğinde Almanca/İngilizce destekliyoruz." },
            { q: "Nasıl katılırım?", a: "Ön Kayıt formunu doldur; seni tanışma/ilk çalışma gününe davet edelim." },
          ].map((item, i) => (
            <details key={i} className="group p-4">
              <summary className="flex cursor-pointer list-none items-center gap-2">
                {item.q}
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-neutral-700">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-2xl font-semibold text-[color:var(--heading)]">İletişim</h2>
        <ul className="mt-4 space-y-2 text-neutral-700">
          <li className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> E-posta:{" "}
            <a className="underline text-[color:var(--accent)]" href={`mailto:${ORG.email}`}>
              {ORG.email}
            </a>
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Konum: {ORG.city}
          </li>
        </ul>
        <div className="mt-8 text-sm text-neutral-600">
          <a className="hover:underline" href="/impressum">Impressum</a>{" "}
          · <a className="hover:underline" href="/datenschutz">Datenschutz</a>
        </div>
      </section>

      <footer className="pb-20 md:pb-10 text-center text-sm text-neutral-600">
        © {new Date().getFullYear()} {ORG.name}
      </footer>

      {nextEventCta}

      {open && <JoinModal onClose={() => setOpen(false)} org={ORG} onSubmitted={() => setToast("Başvurun oluşturuldu.")} />}

      {toast && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-[color:var(--border)] bg-[color:var(--card-bg)] px-4 py-2 text-sm shadow-md">
          {toast}
        </div>
      )}
    </main>
  );
}

/** =====================
 *  JOIN MODAL
 *  ===================== */
function JoinModal({ onClose, org, onSubmitted }: { onClose: () => void; org: typeof ORG; onSubmitted: () => void }) {
  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("Oyunculuk");
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const subject = encodeURIComponent("Münih Sahne • Ön Kayıt");
  const body = encodeURIComponent(
    `Ad Soyad: ${name}\nE-posta: ${mail}\nTelefon: ${phone || "-"}\nİlgi Alanı: ${interest}\nNot: ${note}`
  );
  const mailto = `mailto:${org.email}?subject=${subject}&body=${body}`;
  const canSubmit = name.trim() && /.+@.+\..+/.test(mail) && agree;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    const payload = { name, mail, phone, interest, note };
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("api");
      onSubmitted();
      onClose();
    } catch {
      onSubmitted();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-bg)] p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[color:var(--heading)]">Ön Kayıt</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-neutral-100" aria-label="Kapat">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1 text-sm">
            <span>Ad Soyad</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="rounded border border-[color:var(--border)] px-3 py-2 bg-[color:var(--field-bg)] text-[color:var(--fg)] placeholder:text-[color:var(--muted-fg)]" placeholder="Ad Soyad" />
          </label>

          <label className="grid gap-1 text-sm">
            <span>E-posta</span>
            <input required type="email" value={mail} onChange={(e) => setMail(e.target.value)} className="rounded border border-[color:var(--border)] px-3 py-2 bg-[color:var(--field-bg)] text-[color:var(--fg)] placeholder:text-[color:var(--muted-fg)]" placeholder="ornek@mail.com" />
          </label>

          <label className="grid gap-1 text-sm">
            <span>Telefon <span className="opacity-60">(opsiyonel — WhatsApp grubumuza eklenmek için)</span></span>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded border border-[color:var(--border)] px-3 py-2 bg-[color:var(--field-bg)] text-[color:var(--fg)] placeholder:text-[color:var(--muted-fg)]" placeholder="+49 ..." />
          </label>

          <label className="grid gap-1 text-sm">
            <span>İlgi Alanı</span>
            <select value={interest} onChange={(e) => setInterest(e.target.value)} className="rounded border border-[color:var(--border)] px-3 py-2 bg-[color:var(--field-bg)] text-[color:var(--fg)]">
              <option className="text-black">Oyunculuk</option>
              <option className="text-black">Teknik (ışık/ses/sahne)</option>
              <option className="text-black">Prodüksiyon / Afiş / Sosyal Medya</option>
              <option className="text-black">Diğer</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            <span>Not (opsiyonel)</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-24 rounded border border-[color:var(--border)] px-3 py-2 bg-[color:var(--field-bg)] text-[color:var(--fg)] placeholder:text-[color:var(--muted-fg)]" placeholder="Kısaca kendinden bahsedebilir veya sorularını yazabilirsin." />
          </label>

          <label className="mt-1 flex items-start gap-2 text-xs text-neutral-700">
            <input type="checkbox" className="mt-0.5" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>Kişisel verilerimin ön kayıt iletişimi amacıyla işlenmesini kabul ediyorum (<a href="/datenschutz" className="underline">Aydınlatma Metni</a>).</span>
          </label>

          <div className="mt-2 flex flex-wrap gap-2">
            {/* RESEND ile gönderir */}
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className={classNames("px-4 py-2 rounded text-white", (!canSubmit || submitting) && "opacity-50 cursor-not-allowed")}
              style={{ background: PALETTE.bavaria }}
            >
              {submitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}
            </button>

            {/* mailto butonu AYNI KALSIN */}
            {!ORG.googleForm && (
              <a href={mailto} className="px-4 py-2 rounded border border-[color:var(--border)]">
                E-posta Uygulamasıyla Aç
              </a>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
