'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useDrawer } from './DashboardShell'

type Project = { id: string; name: string; slug: string; brand_color: string | null; entryCount: number }
type Profile = { full_name: string | null; avatar_url: string | null }

function SidebarItem({
  label,
  href,
  active,
  dotColor,
  count,
  faint,
  onNavigate,
}: {
  label: string
  href: string
  active: boolean
  dotColor?: string
  count?: number
  faint?: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
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
  const { open, close } = useDrawer()
  const slugMatch = pathname.match(/^\/dashboard\/([^/]+)/)
  const currentSlug = slugMatch?.[1] ?? ''
  const isFeed = pathname === '/feed'
  const isProjects = pathname === '/dashboard'
  const isSettings = pathname === '/settings'

  const navContent = (
    <>
      <div className="flex-1 overflow-y-auto p-[10px] flex flex-col gap-0.5">
        <SidebarItem label="Feed" href="/feed" active={isFeed} dotColor={isFeed ? 'var(--accent)' : undefined} count={feedCount} onNavigate={close} />
        <SidebarItem label="Proyectos" href="/dashboard" active={isProjects} count={projects.length} onNavigate={close} />

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
            onNavigate={close}
          />
        ))}
        <SidebarItem label="+ Nuevo proyecto" href="/dashboard/new" active={false} faint onNavigate={close} />
      </div>

      <div className="p-[10px] flex flex-col gap-0.5" style={{ borderTop: '1px solid var(--border)' }}>
        <SidebarItem label="Ajustes" href="/settings" active={isSettings} onNavigate={close} />
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
    </>
  )

  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <aside
        className="hidden md:flex w-[240px] shrink-0 flex-col"
        style={{ borderRight: '1px solid var(--border)', background: 'var(--bg)' }}
      >
        {navContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className="fixed top-0 left-0 h-full z-50 flex flex-col w-[240px] md:hidden transition-transform duration-200"
        style={{
          borderRight: '1px solid var(--border)',
          background: 'var(--bg)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Close button row */}
        <div
          className="h-[52px] flex items-center px-3 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <button
            type="button"
            onClick={close}
            className="ml-auto flex items-center justify-center w-8 h-8 rounded-[6px] text-lg leading-none"
            style={{ color: 'var(--fg-muted)' }}
            aria-label="Cerrar menú"
          >
            ×
          </button>
        </div>
        {navContent}
      </aside>
    </>
  )
}
