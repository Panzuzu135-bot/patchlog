'use client'

import Link from 'next/link'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">No se pudo cargar el proyecto</h1>
      <p className="text-sm text-zinc-500 mb-6 max-w-sm">
        {error.message || 'Ha ocurrido un error al cargar este proyecto. Por favor, inténtalo de nuevo.'}
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => unstable_retry()}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          Reintentar
        </button>
        <Link
          href="/dashboard"
          className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          ← Volver al dashboard
        </Link>
      </div>
    </div>
  )
}
