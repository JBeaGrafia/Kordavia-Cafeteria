"use client";

import { FormEvent, useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

type ContactFormProps = {
  /** Email destino opcional (p. ej. desde ?to= en la URL) */
  toEmail?: string;
};

export default function ContactForm({ toEmail }: ContactFormProps) {
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedLocal, setSubmittedLocal] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setErrorMessage("");
    setSubmittedLocal("");

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: data.get("nombre"),
          apellidos: data.get("apellidos"),
          tema: data.get("tema"),
          mensaje: data.get("mensaje"),
          ...(toEmail ? { to: toEmail } : {}),
        }),
      });

      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        submittedAt?: { local: string };
      };

      if (!response.ok || !result.ok) {
        setState("error");
        setErrorMessage(result.error || "No se pudo enviar el mensaje.");
        return;
      }

      setState("success");
      setSubmittedLocal(result.submittedAt?.local || "");
      form.reset();
    } catch {
      setState("error");
      setErrorMessage("Error de red. Inténtalo de nuevo en unos segundos.");
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="field-row">
        <label className="field">
          <span>Nombre</span>
          <input
            name="nombre"
            type="text"
            autoComplete="given-name"
            required
            maxLength={80}
            placeholder="María"
          />
        </label>

        <label className="field">
          <span>Apellidos</span>
          <input
            name="apellidos"
            type="text"
            autoComplete="family-name"
            required
            maxLength={120}
            placeholder="García López"
          />
        </label>
      </div>

      <label className="field">
        <span>Tema</span>
        <input
          name="tema"
          type="text"
          required
          maxLength={160}
          placeholder="Reservas, horarios, catering…"
        />
      </label>

      <label className="field">
        <span>Mensaje</span>
        <textarea
          name="mensaje"
          required
          maxLength={4000}
          rows={5}
          placeholder="Cuéntanos qué necesitas…"
        />
      </label>

      <button type="submit" className="submit-btn" disabled={state === "loading"}>
        {state === "loading" ? "Enviando…" : "Enviar mensaje"}
      </button>

      {state === "success" && (
        <p className="form-status success" role="status">
          Mensaje enviado
          {submittedLocal ? ` el ${submittedLocal}` : ""}. Te responderemos pronto.
        </p>
      )}

      {state === "error" && (
        <p className="form-status error" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
