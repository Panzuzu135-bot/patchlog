import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import Link from 'next/link'

type EntryType = Database['public']['Enums']['entry_type']

const BADGE: Record<EntryType, { label: string; classes: string }> = {
  feature:     { label: 'Feature',     classes: 'bg-green-100 text-green-800' },
  fix:         { label: 'Fix',         classes: 'bg-red-100 text-red-800' },
  improvement: { label: 'Improvement', classes: 'bg-blue-100 text-blue-800' },
  breaking:    { label: 'Breaking',    classes: 'bg-orange-100 text-orange-800' },
  security:    { label: 'Security',    classes: 'bg-purple-100 text-purple-800' },
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
  const minutes = diff / 60_000
  const hours = minutes / 60
  const days = hours / 24
  if (Math.abs(days) >= 30) return rtf.format(-Math.round(days / 30), 'month')
  if (Math.abs(days) >= 1) return rtf.format(-Math.round(days), 'day')
  if (Math.abs(hours) >= 1) return rtf.format(-Math.round(hours), 'hour')
  return rtf.format(-Math.round(minutes), 'minute')
}

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: followedProjects } = await supabase
    .from('follows')
    .select('project_id')
    .eq('user_id', user!.id)

  const followedIds = followedProjects?.map((f) => f.project_id) ?? []

  if (followedIds.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-xl font-bold text-zinc-900 mb-8">Tu feed</h1>
        <p className="text-center text-zinc-400 py-16 text-sm">
          Aún no sigues ningún proyecto.{' '}
          <Link href="/" className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900">
            Explora proyectos →
          </Link>
        </p>
      </div>
    )
  }

  const { data: entries } = await supabase
    .from('changelog_entries')
    .select('id, title, version, type, published_at, projects!inner(name, slug, brand_color)')
    .in('project_id', followedIds)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(20)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-zinc-900 mb-8">Tu feed</h1>

      {(!entries || entries.length === 0) ? (
        <p className="text-center text-zinc-400 py-16 text-sm">
          Los proyectos que sigues aún no tienen entradas publicadas.
        </p>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const project = entry.projects as { name: string; slug: string; brand_color: string | null }
            const accentColor = project.brand_color ?? '#6366f1'
            const badge = BADGE[entry.type as EntryType]

            return (
              <article
                key={entry.id}
                className="bg-white rounded-lg border border-zinc-200 p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    href={`/${project.slug}`}
                    className="text-xs font-semibold hover:underline underline-offset-2"
                    style={{ color: accentColor }}
                  >
                    {project.name}
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.classes}`}
                  >
                    {badge.label}
                  </span>
                  {entry.version && (
                    <span className="text-xs font-mono text-zinc-400">{entry.version}</span>
                  )}
                  {entry.published_at && (
                    <span className="text-xs text-zinc-400 ml-auto">
                      {relativeTime(entry.published_at)}
                    </span>
                  )}
                </div>

                <h2 className="text-sm font-bold text-zinc-900">{entry.title}</h2>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
