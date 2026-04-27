import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FollowButton from './FollowButton'

vi.mock('./actions', () => ({
  followProject: vi.fn().mockResolvedValue(undefined),
  unfollowProject: vi.fn().mockResolvedValue(undefined),
}))

const defaultProps = {
  projectId: 'project-1',
  slug: 'mi-proyecto',
  initialFollowing: false,
  initialCount: 42,
  accentColor: '#6366f1',
}

describe('FollowButton — responsive y táctil', () => {
  it('tiene clase min-h-[44px] para target táctil mínimo en móvil', () => {
    render(<FollowButton {...defaultProps} />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('min-h-[44px]')
  })

  it('muestra "Seguir" cuando no se está siguiendo', () => {
    render(<FollowButton {...defaultProps} initialFollowing={false} />)
    expect(screen.getByText('Seguir')).toBeInTheDocument()
  })

  it('muestra "Siguiendo" cuando ya se sigue', () => {
    render(<FollowButton {...defaultProps} initialFollowing={true} />)
    expect(screen.getByText('Siguiendo')).toBeInTheDocument()
  })

  it('muestra el contador de seguidores', () => {
    render(<FollowButton {...defaultProps} initialCount={42} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('al pulsar pasa de "Seguir" a "Siguiendo" y aumenta el contador', () => {
    render(<FollowButton {...defaultProps} initialFollowing={false} initialCount={10} />)
    const button = screen.getByRole('button')

    fireEvent.click(button)

    expect(screen.getByText('Siguiendo')).toBeInTheDocument()
    expect(screen.getByText('11')).toBeInTheDocument()
  })

  it('al pulsar dos veces vuelve a "Seguir" y decrementa el contador', async () => {
    render(<FollowButton {...defaultProps} initialFollowing={false} initialCount={10} />)
    const button = screen.getByRole('button')

    fireEvent.click(button)
    // Esperar a que termine la transición (el botón vuelve a habilitarse)
    await waitFor(() => expect(button).not.toBeDisabled())

    fireEvent.click(button)
    await waitFor(() => expect(button).not.toBeDisabled())

    expect(screen.getByText('Seguir')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('el botón es un inline-flex para no romper layouts en móvil', () => {
    render(<FollowButton {...defaultProps} />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('inline-flex')
  })
})
