// app/api/join/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

// Node runtime (email servisleri için gereklidir)
export const runtime = "nodejs";

// ENV:
// RESEND_API_KEY=...
// RESEND_FROM="Münih Sahne <no-reply@SIZIN-DOMAININIZ.com>"
// ORG_EMAIL=munihsahne@gmail.com

const resendApiKey = process.env.RESEND_API_KEY || "";
const resendFrom = process.env.RESEND_FROM || "onboarding@resend.dev";
const orgEmail = process.env.ORG_EMAIL || "no-reply@munihsahne.de";

// Basit e-posta regex'i
const MAIL_RE = /.+@.+\..+/;

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // Mevcut davranış: payload'ı logla
    console.log("JOIN_FORM_PAYLOAD:", data);

    const { name, mail, phone, interest, note } = data ?? {};

    // Input doğrulama (çok katı değil)
    if (!name || !mail || !MAIL_RE.test(mail)) {
      return NextResponse.json(
        { ok: false, error: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    // Resend yapılandırılmış mı?
    const canSend = Boolean(resendApiKey && resendFrom && orgEmail);

    if (!canSend) {
      console.warn(
        "[JOIN] Resend yapılandırılmamış görünüyor. (.env.local: RESEND_API_KEY / RESEND_FROM / ORG_EMAIL)"
      );
      // Eski davranışı koru: başarı dön (gönderim atlandı bilgisini ekle)
      return NextResponse.json({ ok: true, sent: false });
    }

    const resend = new Resend(resendApiKey);
    const submittedAt = new Date().toLocaleString("tr-TR", {
      timeZone: "Europe/Berlin",
    });

    // SADECE yönetime e-posta (başvuru sahibine otomatik mail yok)
    const textBody = [
      `Yeni ön kayıt alındı:\n`,
      `Ad Soyad: ${name}`,
      `E-posta: ${mail}`,
      `Telefon: ${phone || "-"}`,
      `İlgi Alanı: ${interest || "-"}`,
      `Not: ${note || "-"}`,
      ``,
      `Gönderim zamanı: ${submittedAt} (Europe/Berlin)`,
    ].join("\n");

    const result = await resend.emails.send({
      from: resendFrom,
      to: [orgEmail],
      replyTo: mail, // Cevapla -> başvurana gitsin
      subject: "Yeni Ön Kayıt – Münih Sahne",
      text: textBody,
    });

    if ((result as any)?.error) {
      console.error("[JOIN] Resend error:", (result as any).error);
      return NextResponse.json(
        { ok: false, error: "RESEND_ERROR" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, sent: true });
  } catch (err) {
    console.error("JOIN_API_ERROR:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
