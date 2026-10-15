# De Barrio — Landing de cafetería

Landing page responsive para la cafetería **De Barrio**: nombre, imagen de fondo de barra con café, y formulario de contacto que envía el mensaje por email (incluye fecha/hora del envío).

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v4
- Envío de email con [Resend](https://resend.com) (API route en Vercel)

## Desarrollo local

```bash
npm install
cp .env.example .env.local
# Edita .env.local con CONTACT_EMAIL y RESEND_API_KEY
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Configurar el email de destino

Prioridad:

1. Query `?to=alguien@email.com` — solo si `ALLOW_EMAIL_OVERRIDE=true`
2. Variable de entorno `CONTACT_EMAIL`
3. Valor por defecto en `src/config/site.ts` (`contactEmail`)

En Vercel: **Project → Settings → Environment Variables**

| Variable | Descripción |
|---|---|
| `CONTACT_EMAIL` | Destinatario de los mensajes |
| `RESEND_API_KEY` | API key de Resend |
| `FROM_EMAIL` | Remitente (opcional) |
| `ALLOW_EMAIL_OVERRIDE` | `true` solo para demos con `?to=` |

## Desplegar en Vercel

1. Sube el repo a GitHub / GitLab / Bitbucket
2. Importa el proyecto en [vercel.com](https://vercel.com)
3. Añade las variables de entorno anteriores
4. Deploy

O con CLI:

```bash
npm i -g vercel
vercel
```

## Formulario

Campos: nombre, apellidos, tema y mensaje. El email incluye esos datos más:

- Fecha ISO (`datetime`)
- Fecha legible en zona `Europe/Madrid`
