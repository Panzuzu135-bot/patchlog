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
          className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          ← Volver
        </Link>
        <span className="text-zinc-300">/</span>
        <h1 className="text-xl font-bold text-zinc-900">Nuevo proyecto</h1>
      </div>

      <div className="max-w-lg">
        <form action={formAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-zinc-700">
              Nombre <span className="text-zinc-400 font-normal">(requerido)</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="Mi proyecto"
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="slug" className="text-sm font-medium text-zinc-700">
              Slug <span className="text-zinc-400 font-normal">(requerido)</span>
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              value={slug}
              onChange={handleSlugChange}
              placeholder="mi-proyecto"
              className={`rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:ring-2 transition-colors ${
                slugInvalid
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-zinc-200 focus:border-zinc-400 focus:ring-zinc-200'
              }`}
            />
            {slugInvalid && (
              <p className="text-xs text-red-500">Solo minúsculas, números y guiones</p>
            )}
            <p className="text-xs text-zinc-500">
              URL pública: patchlog.io/<strong className="text-zinc-700">{slug || 'mi-proyecto'}</strong>
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-zinc-700">
              Descripción <span className="text-zinc-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Breve descripción del proyecto"
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 transition-colors resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="brand_color" className="text-sm font-medium text-zinc-700">
              Color de marca <span className="text-zinc-400 font-normal">(opcional)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="brand_color"
                name="brand_color"
                type="color"
                defaultValue="#6366f1"
                className="h-9 w-14 cursor-pointer rounded-md border border-zinc-200 bg-white p-1 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 transition-colors"
              />
              <span className="text-xs text-zinc-500">Color de acento del proyecto</span>
            </div>
          </div>

          {state?.error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.error}
            </p>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {pending ? 'Creando...' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
