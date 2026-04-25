'use client'
import { useState } from 'react'
import { deleteProject } from './actions'

type Props = {
  slug: string
}

export default function DeleteZone({ slug }: Props) {
  const [open, setOpen] = useState(false)
  const [confirmValue, setConfirmValue] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirmed = confirmValue === slug

  async function handleDelete() {
    if (!confirmed) return
    setPending(true)
    setError(null)
    const result = await deleteProject(slug)
    if (result?.error) {
      setError(result.error)
      setPending(false)
    }
  }

  return (
    <>
      <div
        className="rounded-lg border"
        style={{ borderColor: 'oklch(0.36 0.08 15 / 0.5)', background: 'var(--bg-elev)' }}
      >
        <div className="px-6 py-4 border-b" style={{ borderColor: 'oklch(0.36 0.08 15 / 0.5)' }}>
          <h2 className="text-base font-semibold text-red-400">Zona de peligro</h2>
        </div>
        <div className="px-6 py-5 flex items-center justify-between gap-6">
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            Borrar este proyecto eliminará permanentemente todas sus entradas de changelog.
            Esta acción no se puede deshacer.
          </p>
          <button
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-md border px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/40"
            style={{ borderColor: 'oklch(0.45 0.1 15 / 0.6)' }}
          >
            Borrar proyecto
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div
            className="w-full max-w-md rounded-lg border p-6 shadow-xl mx-4"
            style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}
          >
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--fg)' }}>
              ¿Borrar proyecto?
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--fg-muted)' }}>
              Esta acción eliminará permanentemente el proyecto y todas sus entradas de changelog.
              No se puede deshacer.
            </p>

            <div className="space-y-1.5 mb-5">
              <label className="block text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
                Escribe <span className="font-mono font-semibold" style={{ color: 'var(--fg)' }}>{slug}</span> para confirmar
              </label>
              <input
                type="text"
                value={confirmValue}
                onChange={(e) => setConfirmValue(e.target.value)}
                placeholder={slug}
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--bg-elev-2)',
                  color: 'var(--fg)',
                }}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 mb-4">{error}</p>
            )}

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setOpen(false)
                  setConfirmValue('')
                  setError(null)
                }}
                disabled={pending}
                className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--fg-muted)',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={!confirmed || pending}
                className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {pending ? 'Borrando…' : 'Borrar permanentemente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
