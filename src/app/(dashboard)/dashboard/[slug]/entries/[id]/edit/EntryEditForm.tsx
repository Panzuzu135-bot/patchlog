'use client'
import { useState } from 'react'
import { updateEntry } from '../../actions'

const ENTRY_TYPES = [
  { value: 'feature', label: 'feature' },
  { value: 'fix', label: 'fix' },
  { value: 'improvement', label: 'improvement' },
  { value: 'breaking', label: 'breaking' },
  { value: 'security', label: 'security' },
] as const

const typeColor: Record<string, string> = {
  feature: 'var(--t-feature)',
  fix: 'var(--t-fix)',
  improvement: 'var(--t-improvement)',
  breaking: 'var(--t-breaking)',
  security: 'var(--t-security)',
}

type Entry = {
  id: string
  title: string
  content: string
  version: string | null
  type: 'feature' | 'fix' | 'improvement' | 'breaking' | 'security'
  published: boolean
}

type Props = {
  entry: Entry
  slug: string
}

export default function EntryEditForm({ entry, slug }: Props) {
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [content, setContent] = useState(entry.content)
  const [type, setType] = useState(entry.type)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const boundAction = updateEntry.bind(null, entry.id, slug)

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
          Título <span className="font-normal" style={{ color: 'var(--fg-faint)' }}>*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={entry.title}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
          style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', color: 'var(--fg)' }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
            Contenido <span className="font-normal" style={{ color: 'var(--fg-faint)' }}>*</span>
          </label>
          <div className="flex rounded-lg overflow-hidden text-xs" style={{ border: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setTab('write')}
              className="px-3 py-1 transition-colors"
              style={{
                background: tab === 'write' ? 'var(--fg)' : 'var(--bg-elev)',
                color: tab === 'write' ? 'var(--bg)' : 'var(--fg-muted)',
              }}
            >
              Escribir
            </button>
            <button
              type="button"
              onClick={() => setTab('preview')}
              className="px-3 py-1 transition-colors"
              style={{
                background: tab === 'preview' ? 'var(--fg)' : 'var(--bg-elev)',
                color: tab === 'preview' ? 'var(--bg)' : 'var(--fg-muted)',
              }}
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
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="## ¿Qué cambió?"
            className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors resize-none font-mono leading-relaxed"
            style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', color: 'var(--fg)' }}
          />
        ) : (
          <>
            <input type="hidden" name="content" value={content} />
            <div
              className="w-full min-h-[260px] rounded-lg px-3 py-2 text-sm font-mono whitespace-pre-wrap"
              style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', color: 'var(--fg)' }}
            >
              {content || <span style={{ color: 'var(--fg-faint)' }}>Sin contenido aún.</span>}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="version" className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
            Versión <span className="font-normal" style={{ color: 'var(--fg-faint)' }}>(opcional)</span>
          </label>
          <input
            id="version"
            name="version"
            type="text"
            placeholder="v1.0.0"
            defaultValue={entry.version ?? ''}
            className="w-full rounded-lg px-3 py-2 font-mono text-sm outline-none min-h-[44px]"
            style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', color: 'var(--fg)' }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="type" className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
            Tipo
          </label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={e => setType(e.target.value as typeof type)}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none min-h-[44px]"
            style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', color: typeColor[type] }}
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
          defaultChecked={entry.published}
          className="w-4 h-4 rounded"
          style={{ accentColor: 'var(--accent)' }}
        />
        <label htmlFor="published" className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          Publicar ahora
        </label>
      </div>

      {error && <p className="text-sm" style={{ color: 'var(--t-fix)' }}>{error}</p>}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 hover:brightness-110"
          style={{ background: 'var(--fg)', color: 'var(--bg)' }}
        >
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
