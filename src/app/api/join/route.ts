// app/api/join/route.ts
import { NextResponse } from "next/server";

// ÖNEMLİ: Email servisleri için edge uygun değil. Node runtime'a zorla.
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("JOIN_FORM_PAYLOAD:", data); // terminale düşer
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("JOIN_API_ERROR:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
