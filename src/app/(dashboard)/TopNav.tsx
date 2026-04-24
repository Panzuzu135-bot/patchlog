'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

type Project = { name: string; slug: string }

export default function TopNav({ projects }: { projects: Project[] }) {
  const pathname = usePathname()
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
      className="h-[52px] flex items-center px-5 gap-1 shrink-0"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
    >
      <div className="flex items-center gap-2.5 font-mono font-semibold text-sm tracking-tight mr-3 shrink-0">
        <span
          className="w-[22px] h-[22px] grid place-items-center rounded-[6px] text-xs font-bold"
          style={{ border: '1px solid var(--border-strong)', background: 'var(--bg-elev)', color: 'var(--accent)' }}
        >~</span>
        <Link href="/dashboard" className="hover:opacity-80">
          <span style={{ color: 'var(--fg)' }}>patchlog</span>
          <span className="font-normal" style={{ color: 'var(--fg-faint)' }}>/v1</span>
        </Link>
      </div>

      <nav className="flex items-center gap-0.5">
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

      <Link href="/" className="text-[13px] font-medium px-2.5 py-1.5 rounded-[6px]" style={{ color: 'var(--fg-muted)' }}>
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
