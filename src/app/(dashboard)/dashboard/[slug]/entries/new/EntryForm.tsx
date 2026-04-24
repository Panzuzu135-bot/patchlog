'use client'
import { useState } from 'react'
import { createEntry } from '../actions'

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

type Props = { slug: string }

export default function EntryForm({ slug }: Props) {
  const [content, setContent] = useState('')
  const [type, setType] = useState('feature')
  const [version, setVersion] = useState('')
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [pending, setPending] = useState(false)
  const [publishMode, setPublishMode] = useState(false)
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-0">
      {/* Action bar */}
      <div className="flex items-center justify-between mb-6">
        <p className="font-mono text-xs" style={{ color: 'var(--fg-faint)' }}>
          {slug} / nueva entrada
        </p>
        <div className="flex items-center gap-2">
          <a
            href={`/dashboard/${slug}`}
            className="text-[13px] font-medium px-2.5 py-1.5 rounded-lg hover:opacity-80"
            style={{ color: 'var(--fg-muted)' }}
          >
            Cancelar
          </a>
          <button
            type="submit"
            disabled={pending}
            onClick={() => setPublishMode(false)}
            className="inline-flex font-medium text-[13px] px-3 py-1.5 rounded-lg disabled:opacity-50"
            style={{ background: 'var(--bg-elev)', color: 'var(--fg)', border: '1px solid var(--border)' }}
          >
            Guardar borrador
          </button>
          <button
            type="submit"
            disabled={pending}
            onClick={() => setPublishMode(true)}
            className="inline-flex font-semibold text-[13px] px-3 py-1.5 rounded-lg hover:brightness-110 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            Publicar
          </button>
        </div>
      </div>

      <h1 className="text-[28px] font-bold tracking-tight mb-6">Nueva entrada de changelog</h1>

      {/* Hidden fields */}
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="published" value={publishMode ? 'on' : 'off'} />

      <div className="flex gap-6">
        {/* Main editor */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <input
            name="title"
            type="text"
            required
            placeholder="Título de la entrada..."
            className="w-full text-[22px] font-bold tracking-tight bg-transparent outline-none placeholder:opacity-25"
            style={{ color: 'var(--fg)', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}
          />

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px]">
              <span style={{ color: 'var(--fg-faint)' }}>[ </span>
              <span style={{ color: typeColor[type] }}>{type}</span>
              <span style={{ color: 'var(--fg-faint)' }}> ]</span>
            </span>
            <span
              className="font-mono text-[11px] px-1.5 py-[2px] rounded-[4px]"
              style={{ color: 'var(--fg-subtle)', border: '1px solid var(--border)', background: 'var(--bg-elev)' }}
            >
              {version || 'v?.?.?'}
            </span>
            <button
              type="button"
              onClick={() => setTab(tab === 'write' ? 'preview' : 'write')}
              className="font-mono text-[11px] transition-opacity hover:opacity-70"
              style={{ color: 'var(--fg-faint)' }}
            >
              {tab === 'write' ? 'preview' : 'escribir'}
            </button>
          </div>

          <div className="relative">
            <span
              className="absolute top-3 right-3 font-mono text-[10px] uppercase tracking-wider"
              style={{ color: 'var(--fg-faint)' }}
            >
              markdown
            </span>
            {tab === 'write' ? (
              <textarea
                name="content"
                required
                rows={18}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="## ¿Qué cambió?"
                className="w-full rounded-xl p-4 pr-24 font-mono text-sm resize-none outline-none leading-relaxed"
                style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', color: 'var(--fg)' }}
              />
            ) : (
              <>
                <input type="hidden" name="content" value={content} />
                <div
                  className="w-full min-h-[320px] rounded-xl p-4 pr-24 font-mono text-sm whitespace-pre-wrap"
                  style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', color: 'var(--fg)' }}
                >
                  {content || <span style={{ color: 'var(--fg-faint)' }}>Sin contenido aún.</span>}
                </div>
              </>
            )}
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--t-fix)' }}>{error}</p>}
        </div>

        {/* Aside */}
        <aside className="w-[220px] shrink-0 flex flex-col gap-5 pt-[60px]">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--fg-muted)' }}>Versión</label>
            <input
              name="version"
              type="text"
              placeholder="v1.0.0"
              value={version}
              onChange={e => setVersion(e.target.value)}
              className="w-full rounded-lg px-3 py-2 font-mono text-sm outline-none"
              style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', color: 'var(--fg)' }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--fg-muted)' }}>Tipo</label>
            <div className="flex flex-col gap-1.5">
              {ENTRY_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-left transition-colors"
                  style={{
                    background: type === t.value ? 'var(--bg-elev-2)' : 'var(--bg-elev)',
                    border: `1px solid ${type === t.value ? typeColor[t.value] : 'var(--border)'}`,
                    color: type === t.value ? typeColor[t.value] : 'var(--fg-muted)',
                  }}
                >
                  <span className="w-2 h-2 rounded-[2px] shrink-0" style={{ background: typeColor[t.value] }} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </form>
  )
}
