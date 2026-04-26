'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { createProject } from './actions'
import { toSlug } from '@/lib/slug'

const initialState: { error?: string } = {}

export default function NewProjectPage() {
  const [state, formAction, pending] = useActionState(createProject, initialState)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setName(value)
    if (!slugEdited) {
      setSlug(toSlug(value))
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
    setSlug(value)
    setSlugEdited(true)
  }

  const slugInvalid = slug.length > 0 && !/^[a-z0-9-]+$/.test(slug)
  const canSubmit = name.trim().length > 0 && slug.trim().length > 0 && !slugInvalid && !pending

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm transition-colors"
          style={{ color: 'var(--fg-muted)' }}
        >
          ← Volver
        </Link>
        <span style={{ color: 'var(--fg-faint)' }}>/</span>
        <h1 className="text-xl font-bold" style={{ color: 'var(--fg)' }}>Nuevo proyecto</h1>
      </div>

      <div className="max-w-lg">
        <form action={formAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
              Nombre <span className="font-normal" style={{ color: 'var(--fg-subtle)' }}>(requerido)</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="Mi proyecto"
              className="appearance-none rounded-md border px-3 py-2 text-sm outline-none transition-colors"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-elev-2)',
                color: 'var(--fg)',
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="slug" className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
              Slug <span className="font-normal" style={{ color: 'var(--fg-subtle)' }}>(requerido)</span>
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              value={slug}
              onChange={handleSlugChange}
              placeholder="mi-proyecto"
              className="appearance-none rounded-md border px-3 py-2 text-sm outline-none transition-colors"
              style={{
                borderColor: slugInvalid ? 'oklch(0.5 0.15 15)' : 'var(--border)',
                background: 'var(--bg-elev-2)',
                color: 'var(--fg)',
              }}
            />
            {slugInvalid && (
              <p className="text-xs text-red-400">Solo minúsculas, números y guiones</p>
            )}
            <p className="text-xs" style={{ color: 'var(--fg-subtle)' }}>
              URL pública: patchlog.io/<strong style={{ color: 'var(--fg-muted)' }}>{slug || 'mi-proyecto'}</strong>
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
              Descripción <span className="font-normal" style={{ color: 'var(--fg-subtle)' }}>(opcional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Breve descripción del proyecto"
              className="appearance-none rounded-md border px-3 py-2 text-sm outline-none transition-colors resize-none"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-elev-2)',
                color: 'var(--fg)',
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="brand_color" className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
              Color de marca <span className="font-normal" style={{ color: 'var(--fg-subtle)' }}>(opcional)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="brand_color"
                name="brand_color"
                type="color"
                defaultValue="#6366f1"
                className="h-9 w-14 cursor-pointer rounded-md border p-1 outline-none transition-colors"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-elev-2)' }}
              />
              <span className="text-xs" style={{ color: 'var(--fg-subtle)' }}>Color de acento del proyecto</span>
            </div>
          </div>

          {state?.error && (
            <p className="rounded-md border px-3 py-2 text-sm text-red-400"
              style={{ borderColor: 'oklch(0.45 0.1 15 / 0.5)', background: 'oklch(0.2 0.05 15 / 0.3)' }}>
              {state.error}
            </p>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-md px-5 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--fg)', color: 'var(--bg)' }}
            >
              {pending ? 'Creando...' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
