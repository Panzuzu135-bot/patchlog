'use client'
import { useState, useTransition } from 'react'
import ImportGitHubModal, { type GitHubRepo } from './ImportGitHubModal'
import { importProjectFromGitHub } from './actions'

export default function ImportGitHubButton() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleImport(repo: GitHubRepo) {
    setError(null)
    startTransition(async () => {
      const result = await importProjectFromGitHub(repo.full_name)
      if (result?.error) {
        setError(result.error)
      }
      // Si success, el server action hace redirect() automáticamente
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="inline-flex items-center font-medium text-[13px] px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'var(--bg-elev)', color: 'var(--fg)', border: '1px solid var(--border)' }}
      >
        {isPending ? 'Importando...' : 'Importar desde GitHub'}
      </button>
      {error && (
        <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{error}</p>
      )}
      <ImportGitHubModal
        open={open}
        onClose={() => setOpen(false)}
        onImport={handleImport}
      />
    </>
  )
}
