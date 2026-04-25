import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import EntryActions from './entries/EntryActions'

const typeColor: Record<string, string> = {
  feature: 'var(--t-feature)',
  fix: 'var(--t-fix)',
  improvement: 'var(--t-improvement)',
  breaking: 'var(--t-breaking)',
  security: 'var(--t-security)',
}

function relTime(dateStr: string | null) {
  if (!dateStr) return '—'
  const days = (Date.now() - new Date(dateStr).getTime()) / 86400000
  if (days < 1) return 'hoy'
  if (days < 2) return 'ayer'
  if (days < 7) return `hace ${Math.round(days)}d`
  if (days < 30) return `hace ${Math.round(days / 7)}sem`
  return `hace ${Math.round(days / 30)}mes`
}

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

  const { data: allData } = await supabase
    .from('changelog_entries')
    .select('id, title, version, type, published, published_at, created_at')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })

  const all = allData ?? []
  const publishedCount = all.filter(e => e.published).length
  const draftCount = all.filter(e => !e.published).length
  const entries = filter === 'published' ? all.filter(e => e.published)
    : filter === 'draft' ? all.filter(e => !e.published)
    : all

  const initials = project.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <div
            className="w-[44px] h-[44px] rounded-[10px] grid place-items-center font-mono font-bold text-base shrink-0 mt-0.5"
            style={{ background: project.brand_color ?? 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            {initials}
          </div>
          <div>
            <p className="font-mono text-xs mb-0.5" style={{ color: 'var(--fg-faint)' }}>proyectos / {slug}</p>
            <h1 className="text-[22px] font-bold tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--fg-muted)' }}>{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-1">
          <Link
            href={`/${slug}`}
            className="text-[13px] font-medium px-2.5 py-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--fg-muted)' }}
          >
            Ver página pública ↗
          </Link>
          <Link
            href={`/dashboard/${slug}/settings`}
            className="inline-flex font-medium text-[13px] px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--bg-elev)', color: 'var(--fg)', border: '1px solid var(--border)' }}
          >
            Ajustes
          </Link>
          <Link
            href={`/dashboard/${slug}/entries/new`}
            className="inline-flex font-semibold text-[13px] px-3 py-1.5 rounded-lg hover:brightness-110"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            + Nueva entrada
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        {([['all', 'Todas', all.length], ['published', 'Publicadas', publishedCount], ['draft', 'Borradores', draftCount]] as const).map(([val, label, count]) => (
          <Link
            key={val}
            href={`/dashboard/${slug}?filter=${val}`}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium transition-colors"
            style={{
              color: filter === val ? 'var(--fg)' : 'var(--fg-muted)',
              borderBottom: filter === val ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {label}
            <span className="font-mono text-[11px]" style={{ color: 'var(--fg-faint)' }}>{count}</span>
          </Link>
        ))}
        <div className="flex-1" />
        <span className="font-mono text-[11px] px-4" style={{ color: 'var(--fg-faint)' }}>⌘F filtrar</span>
      </div>

      {/* Entries */}
      {entries.length > 0 ? (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 px-5 py-3.5"
              style={{
                borderBottom: i < entries.length - 1 ? '1px solid var(--border)' : 'none',
                background: 'var(--bg-elev)',
              }}
            >
              <span className="font-mono text-[11px] shrink-0">
                <span style={{ color: 'var(--fg-faint)' }}>[ </span>
                <span style={{ color: typeColor[entry.type] }}>{entry.type}</span>
                <span style={{ color: 'var(--fg-faint)' }}> ]</span>
              </span>
              <span
                className="font-mono text-[11px] px-1.5 py-[2px] rounded-[4px] shrink-0"
                style={{ color: 'var(--fg-subtle)', border: '1px solid var(--border)', background: 'var(--bg)' }}
              >
                {entry.version}
              </span>
              <span className="flex-1 text-sm font-medium truncate" style={{ color: 'var(--fg)' }}>
                {entry.title}
              </span>
              <span
                className="text-xs font-medium shrink-0 flex items-center gap-1.5"
                style={{ color: entry.published ? 'var(--t-feature)' : 'var(--fg-subtle)' }}
              >
                {entry.published && (
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--t-feature)' }} />
                )}
                {entry.published ? 'publicado' : 'borrador'}
              </span>
              <span className="font-mono text-[11px] shrink-0" style={{ color: 'var(--fg-faint)' }}>
                {relTime(entry.published_at ?? entry.created_at)}
              </span>
              <Link
                href={`/dashboard/${slug}/entries/${entry.id}/edit`}
                className="text-[13px] shrink-0 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--fg-faint)' }}
              >
                ✎
              </Link>
              <EntryActions entryId={entry.id} slug={slug} published={entry.published} />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center rounded-xl py-20 text-center"
          style={{ border: '1px dashed var(--border)' }}
        >
          <h2 className="text-base font-semibold mb-1">Sin entradas en este filtro</h2>
          <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--fg-muted)' }}>
            Prueba a cambiar el filtro o crea una nueva entrada.
          </p>
          <Link
            href={`/dashboard/${slug}/entries/new`}
            className="inline-flex font-semibold text-[13px] px-3 py-1.5 rounded-lg hover:brightness-110"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            + Nueva entrada
          </Link>
        </div>
      )}
    </div>
  )
}
