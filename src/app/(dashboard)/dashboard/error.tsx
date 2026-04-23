'use client'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">Algo salió mal</h1>
      <p className="text-sm text-zinc-500 mb-6 max-w-sm">
        {error.message || 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.'}
      </p>
      <button
        onClick={() => unstable_retry()}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
      >
        Reintentar
      </button>
    </div>
  )
}
