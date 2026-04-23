import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import EntryActions from './entries/EntryActions'

const TYPE_LABELS: Record<string, string> = {
  feature: 'Feature',
  fix: 'Fix',
  improvement: 'Improvement',
  breaking: 'Breaking',
  security: 'Security',
}

const TYPE_CLASSES: Record<string, string> = {
  feature: 'bg-green-100 text-green-700',
  fix: 'bg-red-100 text-red-700',
  improvement: 'bg-blue-100 text-blue-700',
  breaking: 'bg-orange-100 text-orange-700',
  security: 'bg-purple-100 text-purple-700',
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

const TABS = [
  { label: 'Todas', value: 'all' },
  { label: 'Publicadas', value: 'published' },
  { label: 'Borradores', value: 'draft' },
]

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ filter?: string }>
}) {
  const { slug } = await params
  const { filter = 'all' } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, slug, description, brand_color')
    .eq('slug', slug)
    .eq('user_id', user.id)
    .single()

  if (!project) notFound()

  let query = supabase
    .from('changelog_entries')
    .select('id, title, version, type, published, published_at, created_at')
    .eq('project_id', project.id)
  if (filter === 'published') query = query.eq('published', true)
  if (filter === 'draft') query = query.eq('published', false)
  const { data: entries } = await query.order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{project.name}</h1>
          {project.description && (
            <p className="mt-1 text-sm text-zinc-500">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/${slug}/settings`}
            className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            Ajustes
          </Link>
          <Link
            href={`/dashboard/${slug}/entries/new`}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            Nueva entrada
          </Link>
        </div>
      </div>

      <div className="flex gap-6 mb-6 border-b border-zinc-200">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/dashboard/${slug}?filter=${tab.value}`}
            className={`pb-3 text-sm transition-colors ${
              filter === tab.value
                ? 'border-b-2 border-zinc-900 font-semibold text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {entries && entries.length > 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          <ul className="divide-y divide-zinc-100">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_CLASSES[entry.type] ?? 'bg-zinc-100 text-zinc-600'}`}>
                    {TYPE_LABELS[entry.type] ?? entry.type}
                  </span>
                  <span className="truncate text-sm font-medium text-zinc-900">{entry.title}</span>
                  {entry.version && (
                    <span className="shrink-0 text-xs text-zinc-400 font-mono">{entry.version}</span>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`text-xs font-medium ${entry.published ? 'text-green-600' : 'text-zinc-400'}`}>
                    {entry.published ? formatDate(entry.published_at) ?? 'Publicado' : 'Borrador'}
                  </span>
                  <Link
                    href={`/dashboard/${slug}/entries/${entry.id}/edit`}
                    className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    Editar
                  </Link>
                  <EntryActions
                    entryId={entry.id}
                    slug={slug}
                    published={entry.published}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-white py-20 text-center">
          <h2 className="text-lg font-semibold text-zinc-900 mb-1">Sin entradas todavía</h2>
          <p className="text-sm text-zinc-500 mb-6 max-w-xs">
            Crea tu primera entrada de changelog para este proyecto.
          </p>
          <Link
            href={`/dashboard/${slug}/entries/new`}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            Nueva entrada
          </Link>
        </div>
      )}
    </div>
  )
}
