import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, slug, description, brand_color, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: true })

  const stats: Record<string, { entries: number; followers: number }> = {}
  if (projects && projects.length > 0) {
    await Promise.all(projects.map(async p => {
      const [{ count: entries }, { count: followers }] = await Promise.all([
        supabase.from('changelog_entries').select('*', { count: 'exact', head: true }).eq('project_id', p.id),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('project_id', p.id),
      ])
      stats[p.id] = { entries: entries ?? 0, followers: followers ?? 0 }
    }))
  }

  const totalEntries = Object.values(stats).reduce((s, c) => s + c.entries, 0)

  return (
    <div className="p-8 max-w-[900px]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="font-mono text-xs mb-1" style={{ color: 'var(--fg-faint)' }}>~ / proyectos</p>
          <h1 className="text-[28px] font-bold tracking-tight">Mis proyectos</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
            {projects?.length ?? 0} proyectos · {totalEntries} entradas publicadas este mes
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1 shrink-0">
          <span
            className="inline-flex items-center font-medium text-[13px] px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--bg-elev)', color: 'var(--fg)', border: '1px solid var(--border)' }}
          >
            Importar desde GitHub
          </span>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center font-semibold text-[13px] px-3 py-1.5 rounded-lg transition-all hover:brightness-110"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            + Nuevo proyecto
          </Link>
        </div>
      </div>

      {projects && projects.length > 0 ? (
        <div className="flex flex-col gap-3">
          {projects.map(p => (
            <Link
              key={p.id}
              href={`/dashboard/${p.slug}`}
              className="block p-5 rounded-xl transition-opacity hover:opacity-90"
              style={{
                background: 'var(--bg-elev)',
                border: '1px solid var(--border)',
                borderLeft: `3px solid ${p.brand_color ?? 'var(--border)'}`,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-[8px] grid place-items-center font-mono font-bold text-sm shrink-0"
                  style={{ background: p.brand_color ?? 'var(--accent)', color: 'var(--accent-fg)' }}
                >
                  {initials(p.name)}
                </div>
                <div>
                  <p className="font-semibold text-[15px]" style={{ color: 'var(--fg)' }}>{p.name}</p>
                  <p className="font-mono text-xs" style={{ color: 'var(--fg-subtle)' }}>/{p.slug}</p>
                </div>
              </div>
              {p.description && (
                <p className="text-sm mb-3" style={{ color: 'var(--fg-muted)' }}>{p.description}</p>
              )}
              <div
                className="flex items-center gap-4 font-mono text-[12px] pt-3"
                style={{ color: 'var(--fg-faint)', borderTop: '1px dashed var(--border)' }}
              >
                <span><strong style={{ color: 'var(--fg-muted)', fontWeight: 500 }}>{stats[p.id]?.entries ?? 0}</strong> entradas</span>
                <span><strong style={{ color: 'var(--fg-muted)', fontWeight: 500 }}>{stats[p.id]?.followers ?? 0}</strong> siguiendo</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center rounded-xl py-20 text-center"
          style={{ border: '1px dashed var(--border)' }}
        >
          <p className="font-mono text-xs mb-4" style={{ color: 'var(--fg-faint)' }}>sin proyectos</p>
          <h2 className="text-lg font-semibold mb-1">Todavía no tienes proyectos</h2>
          <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--fg-muted)' }}>
            Crea tu primer proyecto y empieza a publicar tu changelog
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex font-semibold text-[13px] px-3 py-1.5 rounded-lg hover:brightness-110"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            Crear mi primer proyecto
          </Link>
        </div>
      )}
    </div>
  )
}
