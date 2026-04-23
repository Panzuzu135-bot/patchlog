'use client'
import { useState } from 'react'
import { updateProject } from './actions'

type Project = {
  id: string
  name: string
  slug: string
  description: string | null
  brand_color: string
}

type Props = {
  project: Project
}

export default function GeneralForm({ project }: Props) {
  const [status, setStatus] = useState<{ error?: string; success?: boolean } | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setStatus(null)
    const formData = new FormData(e.currentTarget)
    const result = await updateProject(project.slug, formData)
    setStatus(result ?? null)
    setPending(false)
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white">
      <div className="px-6 py-4 border-b border-zinc-200">
        <h2 className="text-base font-semibold text-zinc-900">General</h2>
      </div>
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={project.name}
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">Slug</label>
          <div className="flex items-center gap-2">
            <span className="w-full rounded-md border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-500 select-all">
              {project.slug}
            </span>
          </div>
          <p className="text-xs text-zinc-400">El slug no se puede cambiar.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-sm font-medium text-zinc-700">
            Descripción <span className="text-zinc-400 font-normal">(opcional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={project.description ?? ''}
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none transition-colors resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="brand_color" className="block text-sm font-medium text-zinc-700">
            Color de marca
          </label>
          <div className="flex items-center gap-3">
            <input
              id="brand_color"
              name="brand_color"
              type="color"
              defaultValue={project.brand_color}
              className="h-9 w-16 cursor-pointer rounded border border-zinc-200 bg-zinc-50 p-1"
            />
          </div>
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
