import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DashboardShell from './DashboardShell'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className, style, onClick, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} className={className} style={style} onClick={onClick} {...rest}>{children}</a>
  ),
}))

const defaultProps = {
  projects: [
    { id: '1', name: 'Test Project', slug: 'test-project', brand_color: null, entryCount: 3 },
  ],
  feedCount: 7,
  profile: null,
  userInitial: 'T',
}

describe('DashboardShell — responsive layout', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renderiza el botón hamburguesa para móvil', () => {
    render(<DashboardShell {...defaultProps}><div>content</div></DashboardShell>)
    const hamburger = screen.getByRole('button', { name: 'Abrir menú' })
    expect(hamburger).toBeInTheDocument()
  })

  it('el botón hamburguesa tiene clase md:hidden (solo visible en móvil)', () => {
    render(<DashboardShell {...defaultProps}><div>content</div></DashboardShell>)
    const hamburger = screen.getByRole('button', { name: 'Abrir menú' })
    expect(hamburger).toHaveClass('md:hidden')
  })

  it('el sidebar de escritorio tiene clase hidden md:flex (oculto en móvil)', () => {
    render(<DashboardShell {...defaultProps}><div>content</div></DashboardShell>)
    const desktopSidebar = document.querySelector('aside.hidden.md\\:flex')
    expect(desktopSidebar).toBeInTheDocument()
  })

  it('el drawer móvil tiene clase md:hidden (oculto en escritorio)', () => {
    render(<DashboardShell {...defaultProps}><div>content</div></DashboardShell>)
    const closeBtns = screen.getAllByRole('button', { name: 'Cerrar menú' })
    const mobileDrawer = closeBtns[0].closest('aside')
    expect(mobileDrawer).toHaveClass('md:hidden')
  })

  it('el drawer móvil empieza fuera de pantalla (translateX(-100%))', () => {
    render(<DashboardShell {...defaultProps}><div>content</div></DashboardShell>)
    const closeBtn = screen.getByRole('button', { name: 'Cerrar menú' })
    const mobileDrawer = closeBtn.closest('aside') as HTMLElement
    expect(mobileDrawer.style.transform).toBe('translateX(-100%)')
  })

  it('al pulsar el hamburger el drawer se abre (translateX(0))', () => {
    render(<DashboardShell {...defaultProps}><div>content</div></DashboardShell>)
    const hamburger = screen.getByRole('button', { name: 'Abrir menú' })
    const closeBtn = screen.getByRole('button', { name: 'Cerrar menú' })
    const mobileDrawer = closeBtn.closest('aside') as HTMLElement

    fireEvent.click(hamburger)
    expect(mobileDrawer.style.transform).toBe('translateX(0)')
  })

  it('al pulsar el overlay el drawer se cierra', () => {
    render(<DashboardShell {...defaultProps}><div>content</div></DashboardShell>)
    const hamburger = screen.getByRole('button', { name: 'Abrir menú' })
    fireEvent.click(hamburger)

    const overlay = document.querySelector('[aria-hidden="true"]') as HTMLElement
    expect(overlay).toBeInTheDocument()
    fireEvent.click(overlay)

    const closeBtn = screen.getByRole('button', { name: 'Cerrar menú' })
    const mobileDrawer = closeBtn.closest('aside') as HTMLElement
    expect(mobileDrawer.style.transform).toBe('translateX(-100%)')
  })

  it('al pulsar el botón cerrar del drawer este se cierra', () => {
    render(<DashboardShell {...defaultProps}><div>content</div></DashboardShell>)
    const hamburger = screen.getByRole('button', { name: 'Abrir menú' })
    fireEvent.click(hamburger)

    const closeBtn = screen.getByRole('button', { name: 'Cerrar menú' })
    const mobileDrawer = closeBtn.closest('aside') as HTMLElement
    expect(mobileDrawer.style.transform).toBe('translateX(0)')

    fireEvent.click(closeBtn)
    expect(mobileDrawer.style.transform).toBe('translateX(-100%)')
  })

  it('los enlaces de nav principal están en contenedor hidden md:flex (ocultos en móvil)', () => {
    render(<DashboardShell {...defaultProps}><div>content</div></DashboardShell>)
    const navContainer = document.querySelector('nav.hidden.md\\:flex')
    expect(navContainer).toBeInTheDocument()
  })

  it('renderiza el contenido hijo en el main', () => {
    render(<DashboardShell {...defaultProps}><div data-testid="hijo">Mi contenido</div></DashboardShell>)
    expect(screen.getByTestId('hijo')).toBeInTheDocument()
  })

  it('el nombre de proyecto aparece en el sidebar', () => {
    render(<DashboardShell {...defaultProps}><div>content</div></DashboardShell>)
    const projectLinks = screen.getAllByText('Test Project')
    expect(projectLinks.length).toBeGreaterThan(0)
  })
})
