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
    <div className="rounded-lg border border-zinc-200 bg-white">
      <div className="px-6 py-4 border-b border-zinc-200">
        <h2 className="text-base font-semibold text-zinc-900">Información personal</h2>
      </div>
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="full_name" className="block text-sm font-medium text-zinc-700">
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            defaultValue={full_name ?? ''}
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        {status?.error && (
          <p className="text-sm text-red-600">{status.error}</p>
        )}
        {status?.success && (
          <p className="text-sm text-green-600">Cambios guardados correctamente.</p>
        )}

        <div className="pt-1">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {pending ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
