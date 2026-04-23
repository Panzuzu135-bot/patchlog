# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Vision

**Patchlog** es una página web donde desarrolladores publican el progreso de sus proyectos mediante entradas de changelog versionadas (ej. "v1.1 - Añadido personaje"). Los seguidores pueden ver esas actualizaciones en tiempo real. No es una aplicación embebida ni un widget: es una web autónoma, orientada a la información. No hay nada jugable ni descargable.

Roles principales:
- **Desarrollador**: crea proyectos, publica entradas de changelog con versión y tipo.
- **Seguidor/visitante**: ve el feed de actualizaciones de los proyectos que sigue.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Supabase** — base de datos PostgreSQL, autenticación y RLS
- **Stripe** — planes free/pro para desarrolladores

> AGENTS.md avisa: esta versión de Next.js puede tener breaking changes respecto a versiones anteriores. Leer `node_modules/next/dist/docs/` antes de escribir código que dependa de APIs específicas.

## Commands

```bash
npm run dev      # Servidor de desarrollo en localhost:3000
npm run build    # Build de producción
npm run start    # Servidor de producción (requiere build previo)
npm run lint     # ESLint
```

No hay test runner configurado actualmente.

## Database Schema

Las migraciones están en `supabase/migrations/` y se aplican en orden numérico.

Tablas principales:

| Tabla | Propósito |
|-------|-----------|
| `profiles` | Perfil público del desarrollador (nombre, avatar) |
| `projects` | Proyectos de un desarrollador (slug único, descripción) |
| `changelog_entries` | Entradas versionadas por proyecto (title, content, version, type, published) |
| `subscriptions` | Plan Stripe del desarrollador (free / pro) |

`entry_type` enum: `feature`, `fix`, `improvement`, `breaking`, `security`.

RLS activo en todas las tablas: el dueño del proyecto tiene acceso total a sus recursos; visitantes anónimos solo leen entradas con `published = true` y proyectos públicos.

Trigger `handle_new_user`: al crear un usuario en `auth.users` se crean automáticamente su `profile` y una `subscription` en plan `free`.

## Architecture

`src/app/` sigue el App Router de Next.js. La estructura de rutas esperada para el producto final:

- `/` — landing / feed público o página de inicio
- `/[username]/[slug]` — página pública del changelog de un proyecto
- `/dashboard` — panel del desarrollador (gestión de proyectos y entradas)
- `/dashboard/[slug]` — gestión de un proyecto concreto

El cliente de Supabase se instancia con `@supabase/ssr` (no el cliente genérico) para compatibilidad con Server Components y cookies de sesión.

Variables de entorno necesarias (no incluidas en el repo):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

## Key Decisions

- **Sin widget embebido**: la idea del widget/embed fue descartada. Todo el contenido vive en patchlog.
- **Sin reproductor ni descarga**: la web solo muestra información, no contenido jugable.
- El campo `widget_color` en `projects` puede reutilizarse como color de marca/acento del proyecto en la web.
