import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import EntryForm from './EntryForm'

vi.mock('../actions', () => ({
  createEntry: vi.fn().mockResolvedValue(undefined),
}))

describe('EntryForm — responsive en móvil', () => {
  it('la barra de acciones es flex-col en móvil y sm:flex-row en escritorio', () => {
    render(<EntryForm slug="mi-proyecto" />)
    const actionBar = document.querySelector('.flex-col.gap-3.sm\\:flex-row')
    expect(actionBar).toBeInTheDocument()
  })

  it('los botones de acción tienen min-h-[44px] para target táctil', () => {
    render(<EntryForm slug="mi-proyecto" />)
    const buttons = screen.getAllByRole('button').filter(
      b => b.classList.contains('min-h-[44px]') || b.getAttribute('class')?.includes('min-h-[44px]')
    )
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('los botones de tipo tienen min-h-[44px]', () => {
    render(<EntryForm slug="mi-proyecto" />)
    const typeButtons = ['feature', 'fix', 'improvement', 'breaking', 'security']
    typeButtons.forEach(type => {
      const btn = screen.getByRole('button', { name: new RegExp(type, 'i') })
      expect(btn).toHaveClass('min-h-[44px]')
    })
  })

  it('el contenedor de botones de tipo tiene flex-wrap para móvil', () => {
    render(<EntryForm slug="mi-proyecto" />)
    const typeContainer = document.querySelector('.flex.flex-wrap.gap-1\\.5.md\\:flex-col')
    expect(typeContainer).toBeInTheDocument()
  })

  it('el aside tiene w-full en móvil y md:w-[220px] en escritorio', () => {
    render(<EntryForm slug="mi-proyecto" />)
    const aside = document.querySelector('aside.w-full.md\\:w-\\[220px\\]')
    expect(aside).toBeInTheDocument()
  })

  it('el layout principal usa flex-col en móvil y md:flex-row en escritorio', () => {
    render(<EntryForm slug="mi-proyecto" />)
    const layout = document.querySelector('.flex.flex-col.gap-6.md\\:flex-row')
    expect(layout).toBeInTheDocument()
  })

  it('renderiza el campo de título', () => {
    render(<EntryForm slug="mi-proyecto" />)
    expect(screen.getByPlaceholderText('Título de la entrada...')).toBeInTheDocument()
  })

  it('renderiza el textarea de contenido', () => {
    render(<EntryForm slug="mi-proyecto" />)
    expect(screen.getByPlaceholderText('## ¿Qué cambió?')).toBeInTheDocument()
  })
})
