import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/supabase'
import Link from 'next/link'

type EntryType = Database['public']['Enums']['entry_type']

const typeColor: Record<string, string> = {
  feature: 'var(--t-feature)',
  fix: 'var(--t-fix)',
  improvement: 'var(--t-improvement)',
  breaking: 'var(--t-breaking)',
  security: 'var(--t-security)',
}

function relTime(dateStr: string): string {
  const days = (Date.now() - new Date(dateStr).getTime()) / 86400000
  if (days < 1) return 'hoy'
  if (days < 2) return 'ayer'
  if (days < 7) return `hace ${Math.round(days)}d`
  if (days < 30) return `hace ${Math.round(days / 7)}sem`
  return `hace ${Math.round(days / 30)}mes`
}

function getGroup(dateStr: string): 'today' | 'week' | 'older' {
  const days = (Date.now() - new Date(dateStr).getTime()) / 86400000
  if (days < 1) return 'today'
  if (days < 7) return 'week'
  return 'older'
}

function initials(name: string) {
  return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
}

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: followedProjects } = await supabase
    .from('follows')
    .select('project_id')
    .eq('user_id', user.id)

  const followedIds = followedProjects?.map(f => f.project_id) ?? []

  if (followedIds.length === 0) {
    return (
      <div className="p-8 max-w-[760px]">
        <p className="font-mono text-xs mb-1" style={{ color: 'var(--fg-faint)' }}>~ / feed</p>
        <h1 className="text-[28px] font-bold tracking-tight mb-2">Tu feed</h1>
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          Aún no sigues ningún proyecto.{' '}
          <Link href="/" className="underline underline-offset-2 hover:opacity-80" style={{ color: 'var(--fg)' }}>
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
    .limit(40)

  const all = entries ?? []
  const groups = [
    { key: 'today', label: 'Hoy', items: all.filter(e => e.published_at && getGroup(e.published_at) === 'today') },
    { key: 'week', label: 'Esta semana', items: all.filter(e => e.published_at && getGroup(e.published_at) === 'week') },
    { key: 'older', label: 'Anteriores', items: all.filter(e => e.published_at && getGroup(e.published_at) === 'older') },
  ].filter(g => g.items.length > 0)

  return (
    <div className="p-8 max-w-[760px]">
      <div className="mb-6">
        <p className="font-mono text-xs mb-1" style={{ color: 'var(--fg-faint)' }}>~ / feed</p>
        <h1 className="text-[28px] font-bold tracking-tight">Tu feed</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
          Actualizaciones de los proyectos que sigues
        </p>
      </div>

      {all.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          Los proyectos que sigues aún no tienen entradas publicadas.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(group => (
            <div key={group.key}>
              <p
                className="font-mono text-[11px] mb-3 pb-2 uppercase tracking-[0.06em]"
                style={{ color: 'var(--fg-faint)', borderBottom: '1px dashed var(--border)' }}
              >
                {'// '}{group.label.toUpperCase()}
              </p>
              <div className="flex flex-col gap-2">
                {group.items.map(entry => {
                  const project = entry.projects as { name: string; slug: string; brand_color: string | null }
                  return (
                    <Link
                      key={entry.id}
                      href={`/${project.slug}`}
                      className="flex items-start gap-3 p-4 rounded-xl transition-opacity hover:opacity-90"
                      style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}
                    >
                      <div
                        className="w-9 h-9 rounded-[7px] grid place-items-center font-mono font-bold text-xs shrink-0"
                        style={{ background: project.brand_color ?? 'var(--accent)', color: 'var(--accent-fg)' }}
                      >
                        {initials(project.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[13px] font-semibold" style={{ color: 'var(--fg)' }}>{project.name}</span>
                          <span className="font-mono text-[11px]" style={{ color: 'var(--fg-faint)' }}>/{project.slug}</span>
                          {entry.published_at && (
                            <span className="ml-auto font-mono text-[11px] shrink-0" style={{ color: 'var(--fg-faint)' }}>
                              {relTime(entry.published_at)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono text-[11px]">
                            <span style={{ color: 'var(--fg-faint)' }}>[ </span>
                            <span style={{ color: typeColor[entry.type as EntryType] }}>{entry.type}</span>
                            <span style={{ color: 'var(--fg-faint)' }}> ]</span>
                          </span>
                          {entry.version && (
                            <span
                              className="font-mono text-[11px] px-1.5 py-[2px] rounded-[4px]"
                              style={{ color: 'var(--fg-subtle)', border: '1px solid var(--border)', background: 'var(--bg)' }}
                            >
                              {entry.version}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{entry.title}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
