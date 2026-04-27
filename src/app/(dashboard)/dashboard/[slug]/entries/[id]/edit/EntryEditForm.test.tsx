import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import EntryEditForm from './EntryEditForm'

vi.mock('../../actions', () => ({
  updateEntry: vi.fn().mockResolvedValue(undefined),
}))

const defaultEntry = {
  id: 'entry-1',
  title: 'Mi entrada de prueba',
  content: '## Cambios\n- Añadido responsive',
  version: 'v1.2.0',
  type: 'feature' as const,
  published: false,
}

describe('EntryEditForm — responsive en móvil', () => {
  it('el grid de versión+tipo es grid-cols-1 en móvil y sm:grid-cols-2 en escritorio', () => {
    render(<EntryEditForm entry={defaultEntry} slug="mi-proyecto" />)
    const grid = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2')
    expect(grid).toBeInTheDocument()
  })

  it('el input de versión tiene min-h-[44px] para target táctil', () => {
    render(<EntryEditForm entry={defaultEntry} slug="mi-proyecto" />)
    const versionInput = screen.getByLabelText(/versión/i)
    expect(versionInput).toHaveClass('min-h-[44px]')
  })

  it('el select de tipo tiene min-h-[44px] para target táctil', () => {
    render(<EntryEditForm entry={defaultEntry} slug="mi-proyecto" />)
    const typeSelect = screen.getByLabelText(/tipo/i)
    expect(typeSelect).toHaveClass('min-h-[44px]')
  })

  it('muestra el título de la entrada como valor inicial', () => {
    render(<EntryEditForm entry={defaultEntry} slug="mi-proyecto" />)
    expect(screen.getByDisplayValue('Mi entrada de prueba')).toBeInTheDocument()
  })

  it('muestra la versión actual como valor inicial', () => {
    render(<EntryEditForm entry={defaultEntry} slug="mi-proyecto" />)
    expect(screen.getByDisplayValue('v1.2.0')).toBeInTheDocument()
  })

  it('el formulario usa flex flex-col gap-5 (layout vertical en móvil)', () => {
    render(<EntryEditForm entry={defaultEntry} slug="mi-proyecto" />)
    const form = document.querySelector('form.flex.flex-col.gap-5')
    expect(form).toBeInTheDocument()
  })

  it('usa variables CSS del design system en lugar de clases zinc (dark theme)', () => {
    render(<EntryEditForm entry={defaultEntry} slug="mi-proyecto" />)
    const titleInput = screen.getByLabelText(/título/i)
    expect(titleInput.style.background).toContain('var(--bg-elev)')
    expect(titleInput.style.color).toContain('var(--fg)')
  })

  it('muestra el botón de guardar cambios', () => {
    render(<EntryEditForm entry={defaultEntry} slug="mi-proyecto" />)
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
  })
})
