import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signInWithGitHub } from './actions'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <div className="w-full max-w-[420px] px-8 flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-[28px] font-bold tracking-tight mb-3">Bienvenido de vuelta</h2>
          <p className="text-[15px] leading-[1.55]" style={{ color: 'var(--fg-muted)' }}>
            Autentícate con GitHub para gestionar tus proyectos y seguir a otros desarrolladores.
          </p>
        </div>

        <form action={signInWithGitHub}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl text-[14px] font-semibold transition-all hover:brightness-110"
            style={{ background: 'var(--bg-elev-2)', color: 'var(--fg)', border: '1px solid var(--border-strong)' }}
          >
            <GitHubIcon />
            Continuar con GitHub
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="font-mono text-xs" style={{ color: 'var(--fg-faint)' }}>sin passwords. sin emails.</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        <p className="text-[13px] text-center leading-[1.5]" style={{ color: 'var(--fg-muted)' }}>
          Sólo usamos tu perfil público de GitHub para crear tu cuenta.
        </p>

        <p className="font-mono text-xs text-center" style={{ color: 'var(--fg-faint)' }}>
          términos · privacidad · v1.0.0
        </p>
      </div>
    </div>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}
