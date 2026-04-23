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
      <div className="rounded-lg border border-red-200 bg-white">
        <div className="px-6 py-4 border-b border-red-200">
          <h2 className="text-base font-semibold text-red-700">Zona de peligro</h2>
        </div>
        <div className="px-6 py-5 flex items-center justify-between gap-6">
          <p className="text-sm text-zinc-600">
            Borrar este proyecto eliminará permanentemente todas sus entradas de changelog.
            Esta acción no se puede deshacer.
          </p>
          <button
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
          >
            Borrar proyecto
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-xl mx-4">
            <h3 className="text-base font-semibold text-zinc-900 mb-2">
              ¿Borrar proyecto?
            </h3>
            <p className="text-sm text-zinc-600 mb-5">
              Esta acción eliminará permanentemente el proyecto y todas sus entradas de changelog.
              No se puede deshacer.
            </p>

            <div className="space-y-1.5 mb-5">
              <label className="block text-sm font-medium text-zinc-700">
                Escribe <span className="font-mono font-semibold text-zinc-900">{slug}</span> para confirmar
              </label>
              <input
                type="text"
                value={confirmValue}
                onChange={(e) => setConfirmValue(e.target.value)}
                placeholder={slug}
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            )}

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setOpen(false)
                  setConfirmValue('')
                  setError(null)
                }}
                disabled={pending}
                className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={!confirmed || pending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
