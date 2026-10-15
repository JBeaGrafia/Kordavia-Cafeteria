/**
 * Configuración del sitio y del formulario de contacto.
 *
 * Prioridad del email destino:
 * 1. Query param `?to=` (solo si ALLOW_EMAIL_OVERRIDE=true)
 * 2. Variable de entorno CONTACT_EMAIL (Vercel → Settings → Environment Variables)
 * 3. Valor por defecto de este archivo (`contactEmail`)
 */
export const siteConfig = {
  name: "De Barrio",
  tagline: "Café de barrio, conversación de siempre.",
  /** Email por defecto si no hay CONTACT_EMAIL en el entorno */
  contactEmail: "contacto@debarrio.local",
  /**
   * Remitente verificado en Resend.
   * En pruebas puedes usar: De Barrio <onboarding@resend.dev>
   * En producción: un dominio verificado en Resend.
   */
  fromEmail: "De Barrio <onboarding@resend.dev>",
  timezone: "Europe/Madrid",
  locale: "es-ES",
} as const;

export function resolveContactEmail(override?: string | null): string {
  const fromEnv = process.env.CONTACT_EMAIL?.trim();
  const fromOverride = override?.trim();

  if (fromOverride && isValidEmail(fromOverride)) {
    return fromOverride;
  }

  if (fromEnv && isValidEmail(fromEnv)) {
    return fromEnv;
  }

  return siteConfig.contactEmail;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
