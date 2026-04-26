'use client'
import { useState } from 'react'
import { updateProfile } from './actions'

type Props = {
  full_name: string | null
}

export default function ProfileForm({ full_name }: Props) {
  const [status, setStatus] = useState<{ error?: string; success?: boolean } | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setStatus(null)
    const formData = new FormData(e.currentTarget)
    const result = await updateProfile(formData)
    setStatus(result ?? null)
    setPending(false)
  }

  return (
    <div className="rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-elev)' }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--fg)' }}>Información personal</h2>
      </div>
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="full_name" className="block text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
            Nombre completo <span className="text-red-400">*</span>
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            defaultValue={full_name ?? ''}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none transition-colors"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-elev-2)',
              color: 'var(--fg)',
            }}
          />
        </div>

        {status?.error && (
          <p className="text-sm text-red-400">{status.error}</p>
        )}
        {status?.success && (
          <p className="text-sm text-green-400">Cambios guardados correctamente.</p>
        )}

        <div className="pt-1">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
            style={{ background: 'var(--fg)', color: 'var(--bg)' }}
          >
            {pending ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
