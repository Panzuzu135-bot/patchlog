'use client'
import { useState } from 'react'
import { createEntry } from '../actions'

const ENTRY_TYPES = [
  { value: 'feature', label: 'Feature' },
  { value: 'fix', label: 'Fix' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'breaking', label: 'Breaking' },
  { value: 'security', label: 'Security' },
] as const

type Props = {
  slug: string
}

export default function EntryForm({ slug }: Props) {
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [content, setContent] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const boundAction = createEntry.bind(null, slug)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await boundAction(formData)
    if (result?.error) {
      setError(result.error)
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <label htmlFor="title" className="block text-sm font-medium text-zinc-700">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Añade soporte para exportar en PDF"
          className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-zinc-700">
            Contenido <span className="text-red-500">*</span>
          </label>
          <div className="flex rounded-md border border-zinc-200 overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setTab('write')}
              className={`px-3 py-1 transition-colors ${tab === 'write' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'}`}
            >
              Escribir
            </button>
            <button
              type="button"
              onClick={() => setTab('preview')}
              className={`px-3 py-1 transition-colors ${tab === 'preview' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'}`}
            >
              Preview
            </button>
          </div>
        </div>

        {tab === 'write' ? (
          <textarea
            id="content"
            name="content"
            required
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe los cambios en Markdown…"
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none transition-colors resize-none font-mono"
          />
        ) : (
          <>
            <input type="hidden" name="content" value={content} />
            <div className="w-full min-h-[232px] rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 whitespace-pre-wrap">
              {content || <span className="text-zinc-400">Sin contenido aún.</span>}
            </div>
            <p className="text-xs text-zinc-400">Preview básico — el markdown se renderizará en la vista pública.</p>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="version" className="block text-sm font-medium text-zinc-700">
            Versión <span className="text-zinc-400 font-normal">(opcional)</span>
          </label>
          <input
            id="version"
            name="version"
            type="text"
            placeholder="v2.1.0"
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="type" className="block text-sm font-medium text-zinc-700">
            Tipo
          </label>
          <select
            id="type"
            name="type"
            defaultValue="feature"
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:bg-white focus:outline-none transition-colors"
          >
            {ENTRY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="published"
          name="published"
          type="checkbox"
          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
        />
        <label htmlFor="published" className="text-sm text-zinc-700">
          Publicar ahora
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Creando…' : 'Crear entrada'}
        </button>
      </div>
    </form>
  )
}
