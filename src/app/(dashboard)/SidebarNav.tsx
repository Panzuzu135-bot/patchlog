'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

type Project = { id: string; name: string; slug: string; brand_color: string | null; entryCount: number }
type Profile = { full_name: string | null; avatar_url: string | null }

export default function SidebarNav({
  projects,
  feedCount,
  profile,
  userInitial,
}: {
  projects: Project[]
  feedCount: number
  profile: Profile | null
  userInitial: string
}) {
  const pathname = usePathname()
  const slugMatch = pathname.match(/^\/dashboard\/([^/]+)/)
  const currentSlug = slugMatch?.[1] ?? ''
  const isFeed = pathname === '/feed'
  const isProjects = pathname === '/dashboard'
  const isSettings = pathname === '/settings'

  function SidebarItem({
    label,
    href,
    active,
    dotColor,
    count,
    faint,
  }: {
    label: string
    href: string
    active: boolean
    dotColor?: string
    count?: number
    faint?: boolean
  }) {
    return (
      <Link
        href={href}
        className="flex items-center gap-2.5 px-[10px] py-[7px] rounded-[6px] text-[13px] transition-colors"
        style={{
          color: faint ? 'var(--fg-faint)' : active ? 'var(--fg)' : 'var(--fg-muted)',
          background: active ? 'var(--bg-elev)' : 'transparent',
          boxShadow: active ? 'inset 2px 0 0 var(--accent)' : 'none',
        }}
      >
        <span
          className="w-2 h-2 rounded-[2px] shrink-0"
          style={{ background: dotColor ?? (active ? 'var(--accent)' : 'var(--border-strong)') }}
        />
        <span className="flex-1 truncate">{label}</span>
        {count !== undefined && (
          <span className="font-mono text-[11px]" style={{ color: 'var(--fg-faint)' }}>{count}</span>
        )}
      </Link>
    )
  }

  return (
    <aside
      className="w-[240px] shrink-0 flex flex-col"
      style={{ borderRight: '1px solid var(--border)', background: 'var(--bg)' }}
    >
      <div className="flex-1 overflow-y-auto p-[10px] flex flex-col gap-0.5">
        <SidebarItem label="Feed" href="/feed" active={isFeed} dotColor={isFeed ? 'var(--accent)' : undefined} count={feedCount} />
        <SidebarItem label="Proyectos" href="/dashboard" active={isProjects} count={projects.length} />

        <div className="flex items-center justify-between px-[10px] pt-[14px] pb-[6px]">
          <span className="font-mono text-[10px] uppercase tracking-[0.08em]" style={{ color: 'var(--fg-faint)' }}>
            Mis proyectos
          </span>
          <span className="font-mono text-[10px]" style={{ color: 'var(--fg-faint)' }}>⌘K</span>
        </div>

        {projects.map(p => (
          <SidebarItem
            key={p.id}
            label={p.name}
            href={`/dashboard/${p.slug}`}
            active={currentSlug === p.slug}
            dotColor={p.brand_color ?? undefined}
            count={p.entryCount}
          />
        ))}
        <SidebarItem label="+ Nuevo proyecto" href="/dashboard/new" active={false} faint />
      </div>

      <div className="p-[10px] flex flex-col gap-0.5" style={{ borderTop: '1px solid var(--border)' }}>
        <SidebarItem label="Ajustes" href="/settings" active={isSettings} />
        <div className="flex items-center gap-2 px-[10px] py-2">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full shrink-0" />
          ) : (
            <div
              className="w-7 h-7 rounded-full grid place-items-center font-mono font-bold text-xs shrink-0"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              {userInitial}
            </div>
          )}
          <span className="text-[13px] truncate" style={{ color: 'var(--fg-muted)' }}>
            {profile?.full_name ?? 'usuario'}
          </span>
        </div>
      </div>
    </aside>
  )
}
