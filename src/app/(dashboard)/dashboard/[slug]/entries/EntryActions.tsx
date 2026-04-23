'use client'
import { useTransition } from 'react'
import { togglePublish, deleteEntry } from './actions'

type Props = {
  entryId: string
  slug: string
  published: boolean
}

export default function EntryActions({ entryId, slug, published }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      await togglePublish(entryId, published, slug)
    })
  }

  function handleDelete() {
    if (!confirm('¿Borrar esta entrada? Esta acción no se puede deshacer.')) return
    startTransition(async () => {
      await deleteEntry(entryId, slug)
    })
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="text-xs text-zinc-500 hover:text-zinc-900 disabled:opacity-50 transition-colors"
      >
        {published ? 'Despublicar' : 'Publicar'}
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs text-zinc-500 hover:text-zinc-900 disabled:opacity-50 transition-colors"
      >
        Borrar
      </button>
    </div>
  )
}
