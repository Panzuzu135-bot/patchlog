# Patchlog

Patchlog es una web donde los desarrolladores publican el progreso de sus proyectos mediante entradas de changelog versionadas. Los seguidores las leen en su feed personal y nunca se pierden una novedad.

## Qué es Patchlog

- Los **desarrolladores** crean proyectos, publican entradas de changelog con versión y tipo (feature, fix, mejora, breaking, seguridad) y gestionan todo desde su dashboard.
- Los **seguidores** visitan la página pública de cada proyecto y pueden seguirlo para recibir sus actualizaciones en un feed personal.

No es un widget embebible ni una aplicación de terceros — es una web autónoma orientada a la información.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Supabase** — PostgreSQL, autenticación OAuth (GitHub) y RLS
- **Stripe** — planes free/pro *(pendiente)*

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page pública |
| `/login` | Autenticación con GitHub OAuth |
| `/dashboard` | Panel del desarrollador — lista de proyectos |
| `/dashboard/new` | Crear proyecto |
| `/dashboard/[slug]` | Entradas de changelog del proyecto |
| `/dashboard/[slug]/settings` | Configuración del proyecto |
| `/feed` | Feed personal del seguidor (autenticado) |
| `/[slug]` | Página pública del changelog de un proyecto |
| `/settings` | Perfil del usuario |

## Desarrollo local

```bash
npm install
npm run dev
```

La aplicación arranca en [http://localhost:3000](http://localhost:3000).

Variables de entorno necesarias (crear `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Tests

```bash
npm test
```

Suite de tests unitarios con Vitest sobre las Server Actions. No se usan mocks de la base de datos — los tests validan el comportamiento real de las actions con mocks de Supabase a nivel de cliente.

## Base de datos

Las migraciones están en `supabase/migrations/` y se aplican en orden. Tablas principales: `profiles`, `projects`, `changelog_entries`, `follows`.
