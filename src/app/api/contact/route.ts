import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  isValidEmail,
  resolveContactEmail,
  siteConfig,
} from "@/config/site";

export const runtime = "nodejs";

type ContactPayload = {
  nombre: string;
  apellidos: string;
  tema: string;
  mensaje: string;
  to?: string;
};

function sanitize(value: unknown, max = 500): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function formatSubmittedAt(date: Date) {
  const formatter = new Intl.DateTimeFormat(siteConfig.locale, {
    dateStyle: "full",
    timeStyle: "medium",
    timeZone: siteConfig.timezone,
  });

  return {
    iso: date.toISOString(),
    local: formatter.format(date),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactPayload;

    const nombre = sanitize(body.nombre, 80);
    const apellidos = sanitize(body.apellidos, 120);
    const tema = sanitize(body.tema, 160);
    const mensaje = sanitize(body.mensaje, 4000);
    const allowOverride = process.env.ALLOW_EMAIL_OVERRIDE === "true";
    const toOverride = allowOverride ? sanitize(body.to, 160) : "";

    if (!nombre || !apellidos || !tema || !mensaje) {
      return NextResponse.json(
        { ok: false, error: "Todos los campos son obligatorios." },
        { status: 400 },
      );
    }

    if (toOverride && !isValidEmail(toOverride)) {
      return NextResponse.json(
        { ok: false, error: "El email de destino no es válido." },
        { status: 400 },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Falta RESEND_API_KEY. Configúrala en Vercel o en tu archivo .env.local.",
        },
        { status: 500 },
      );
    }

    const to = resolveContactEmail(toOverride || null);
    const submittedAt = formatSubmittedAt(new Date());
    const fromEmail = process.env.FROM_EMAIL?.trim() || siteConfig.fromEmail;

    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `[De Barrio] ${tema}`,
      replyTo: undefined,
      text: [
        `Nuevo mensaje desde la web de ${siteConfig.name}`,
        "",
        `Nombre: ${nombre}`,
        `Apellidos: ${apellidos}`,
        `Tema: ${tema}`,
        `Fecha (ISO): ${submittedAt.iso}`,
        `Fecha local (${siteConfig.timezone}): ${submittedAt.local}`,
        "",
        "Mensaje:",
        mensaje,
      ].join("\n"),
      html: `
        <div style="font-family: Georgia, serif; color: #2a1f18; line-height: 1.5;">
          <h2 style="margin: 0 0 12px;">Nuevo mensaje — ${siteConfig.name}</h2>
          <p style="margin: 0 0 8px;"><strong>Nombre:</strong> ${escapeHtml(nombre)}</p>
          <p style="margin: 0 0 8px;"><strong>Apellidos:</strong> ${escapeHtml(apellidos)}</p>
          <p style="margin: 0 0 8px;"><strong>Tema:</strong> ${escapeHtml(tema)}</p>
          <p style="margin: 0 0 8px;"><strong>Fecha (ISO):</strong> ${escapeHtml(submittedAt.iso)}</p>
          <p style="margin: 0 0 16px;"><strong>Fecha local (${siteConfig.timezone}):</strong> ${escapeHtml(submittedAt.local)}</p>
          <p style="margin: 0 0 6px;"><strong>Mensaje:</strong></p>
          <p style="white-space: pre-wrap; margin: 0; padding: 12px; background: #f7f1ea; border-radius: 8px;">${escapeHtml(mensaje)}</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message || "No se pudo enviar el email." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, submittedAt });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Error inesperado al procesar el formulario." },
      { status: 500 },
    );
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
