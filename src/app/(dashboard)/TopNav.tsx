'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useDrawer } from './DashboardShell'

type Project = { name: string; slug: string }

export default function TopNav({ projects }: { projects: Project[] }) {
  const pathname = usePathname()
  const { toggle } = useDrawer()
  const slugMatch = pathname.match(/^\/dashboard\/([^/]+)/)
  const currentSlug = slugMatch?.[1] ?? projects[0]?.slug ?? ''

  const isProjects = pathname === '/dashboard'
  const isProject = !!(slugMatch && !pathname.includes('/entries/'))
  const isFeed = pathname === '/feed'
  const isNewEntry = pathname.includes('/entries/')

  const navItems = [
    { label: 'Proyectos', href: '/dashboard', active: isProjects },
    { label: currentSlug, href: `/dashboard/${currentSlug}`, active: isProject, hidden: !currentSlug },
    { label: 'Feed', href: '/feed', active: isFeed },
    { label: 'Página pública', href: `/${currentSlug}`, active: false, hidden: !currentSlug },
    { label: 'Nueva entrada', href: `/dashboard/${currentSlug}/entries/new`, active: isNewEntry, hidden: !currentSlug },
  ]

  return (
    <div
      className="h-[52px] flex items-center px-3 md:px-5 gap-1 shrink-0"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
    >
      {/* Hamburger button — mobile only */}
      <button
        type="button"
        onClick={toggle}
        className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] rounded-[6px] shrink-0 mr-1"
        style={{ color: 'var(--fg-muted)' }}
        aria-label="Abrir menú"
      >
        <span className="block w-4.5 h-[1.5px] rounded-full" style={{ background: 'currentColor' }} />
        <span className="block w-4.5 h-[1.5px] rounded-full" style={{ background: 'currentColor' }} />
        <span className="block w-4.5 h-[1.5px] rounded-full" style={{ background: 'currentColor' }} />
      </button>

      <div className="flex items-center gap-2.5 font-mono font-semibold text-sm tracking-tight mr-3 shrink-0">
        <span
          className="w-[22px] h-[22px] grid place-items-center rounded-[6px] text-xs font-bold"
          style={{ border: '1px solid var(--border-strong)', background: 'var(--bg-elev)', color: 'var(--accent)' }}
        >~</span>
        <Link href="/dashboard" className="hover:opacity-80">
          <span style={{ color: 'var(--fg)' }}>patchlog</span>
          <span className="hidden sm:inline font-normal" style={{ color: 'var(--fg-faint)' }}>/v1</span>
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-0.5">
        {navItems.filter(i => !i.hidden).map(item => (
          <Link
            key={item.label}
            href={item.href}
            className="px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors"
            style={{
              color: item.active ? 'var(--fg)' : 'var(--fg-muted)',
              background: item.active ? 'var(--bg-elev)' : 'transparent',
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex-1" />

      <Link href="/" className="hidden md:block text-[13px] font-medium px-2.5 py-1.5 rounded-[6px]" style={{ color: 'var(--fg-muted)' }}>
        Ver landing
      </Link>
      <form action="/auth/logout" method="POST">
        <button type="submit" className="text-[13px] font-medium px-2.5 py-1.5 rounded-[6px] cursor-pointer" style={{ color: 'var(--fg-muted)' }}>
          Salir
        </button>
      </form>
    </div>
  )
}
