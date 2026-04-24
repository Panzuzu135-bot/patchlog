'use client'
import { useTransition } from 'react'
import { togglePublish, deleteEntry } from './actions'

type Props = { entryId: string; slug: string; published: boolean }

export default function EntryActions({ entryId, slug, published }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => { await togglePublish(entryId, published, slug) })
  }

  function handleDelete() {
    if (!confirm('¿Borrar esta entrada? Esta acción no se puede deshacer.')) return
    startTransition(async () => { await deleteEntry(entryId, slug) })
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="text-[11px] font-medium disabled:opacity-50 transition-opacity hover:opacity-70"
        style={{ color: 'var(--fg-faint)' }}
      >
        {published ? 'Despublicar' : 'Publicar'}
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-[11px] font-medium disabled:opacity-50 transition-opacity hover:opacity-70"
        style={{ color: 'var(--fg-faint)' }}
      >
        Borrar
      </button>
    </div>
  )
}
