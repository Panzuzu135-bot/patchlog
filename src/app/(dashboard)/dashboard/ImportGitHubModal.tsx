'use client'

import { useEffect, useState, useCallback } from 'react'

export interface GitHubRepo {
  id: number
  full_name: string
  name: string
  description: string | null
  language: string | null
  pushed_at: string
  private: boolean
}

interface Props {
  open: boolean
  onClose: () => void
  onImport: (repo: GitHubRepo) => void
}

function formatPushedAt(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ImportGitHubModal({ open, onClose, onImport }: Props) {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<GitHubRepo | null>(null)

  const fetchRepos = useCallback(async () => {
    setLoading(true)
    setError(null)
    setRepos([])
    setSelected(null)
    setSearch('')
    try {
      const res = await fetch('/api/github/repos')
      if (res.status === 401) {
        setError('No hay un token de GitHub conectado. Ve a Ajustes para conectar tu cuenta de GitHub.')
        return
      }
      if (!res.ok) {
        setError(`Error al obtener los repositorios (${res.status}). Inténtalo de nuevo.`)
        return
      }
      const data: GitHubRepo[] = await res.json()
      setRepos(data)
    } catch {
      setError('No se pudo conectar con GitHub. Comprueba tu conexión e inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchRepos()
    }
  }, [open, fetchRepos])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const filtered = repos.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleImport = () => {
    if (!selected) return
    onImport(selected)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl flex flex-col"
        style={{
          background: 'var(--bg-elev)',
          border: '1px solid var(--border)',
          padding: '24px',
          maxHeight: '80vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-[17px]" style={{ color: 'var(--fg)' }}>
            Importar desde GitHub
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-md transition-opacity hover:opacity-70"
            style={{ color: 'var(--fg-muted)', background: 'transparent' }}
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar repositorio..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm mb-3 outline-none"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            color: 'var(--fg)',
          }}
        />

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0" style={{ maxHeight: '340px' }}>
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <svg
                className="animate-spin"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                style={{ color: 'var(--accent)' }}
              >
                <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25"/>
                <path d="M20 11a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <span className="text-sm" style={{ color: 'var(--fg-muted)' }}>Cargando repositorios...</span>
            </div>
          )}

          {!loading && error && (
            <div
              className="rounded-lg px-4 py-4 text-sm"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--fg-muted)',
              }}
            >
              {error}
            </div>
          )}

          {!loading && !error && repos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>No se encontraron repositorios.</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && repos.length > 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                Ningún repositorio coincide con &ldquo;{search}&rdquo;.
              </p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {filtered.map(repo => {
                const isSelected = selected?.id === repo.id
                return (
                  <button
                    key={repo.id}
                    onClick={() => setSelected(repo)}
                    className="w-full text-left rounded-lg px-3 py-3 transition-all"
                    style={{
                      background: isSelected ? 'var(--accent-soft)' : 'var(--bg)',
                      border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span
                        className="font-medium text-[13px] truncate"
                        style={{ color: isSelected ? 'var(--accent)' : 'var(--fg)' }}
                      >
                        {repo.full_name}
                      </span>
                      {repo.private && (
                        <span
                          className="font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0"
                          style={{
                            background: 'var(--bg-elev-2)',
                            color: 'var(--fg-subtle)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          privado
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-[12px] truncate mb-1" style={{ color: 'var(--fg-muted)' }}>
                        {repo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 font-mono text-[11px]" style={{ color: 'var(--fg-faint)' }}>
                      {repo.language && <span>{repo.language}</span>}
                      <span>push {formatPushedAt(repo.pushed_at)}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 mt-5 pt-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={onClose}
            className="inline-flex items-center font-medium text-[13px] px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
            style={{
              background: 'var(--bg)',
              color: 'var(--fg-muted)',
              border: '1px solid var(--border)',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={!selected}
            className="inline-flex items-center font-semibold text-[13px] px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: selected ? 'var(--accent)' : 'var(--bg-elev-2)',
              color: selected ? 'var(--accent-fg)' : 'var(--fg-faint)',
              border: selected ? 'none' : '1px solid var(--border)',
              cursor: selected ? 'pointer' : 'not-allowed',
            }}
          >
            Importar
          </button>
        </div>
      </div>
    </div>
  )
}
