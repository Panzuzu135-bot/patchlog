import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  const mockEntries = [
    { type: 'feature', color: 'bg-emerald-500', label: 'feature', version: 'v2.1', title: 'Sistema de partidas multijugador', ago: 'hace 2 días' },
    { type: 'improvement', color: 'bg-indigo-500', label: 'improvement', version: 'v2.0', title: 'Mejora de rendimiento del motor', ago: 'hace 1 semana' },
    { type: 'fix', color: 'bg-rose-500', label: 'fix', version: 'v1.9', title: 'Corrección crash al cargar mapas', ago: 'hace 2 semanas' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Nav */}
      <header className="border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold text-lg tracking-tight text-white">Patchlog</span>
          <Link
            href="/login"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            El lugar donde tus seguidores siguen<br className="hidden sm:block" /> el progreso de tu proyecto
          </h1>
          <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">
            Publica changelogs versionados para cada versión de tu proyecto. Tus seguidores los leen en su feed personal y nunca se pierden una novedad.
          </p>
          <div className="mt-10">
            <Link
              href="/login"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-3 rounded-lg transition-colors text-sm"
            >
              Empieza gratis
            </Link>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="border-t border-zinc-800 bg-zinc-900/50">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <h2 className="text-2xl font-bold text-center text-white mb-14">Cómo funciona</h2>
            <ol className="grid sm:grid-cols-3 gap-10">
              {[
                { step: '1', title: 'Crea un proyecto', desc: 'Registra tu proyecto en Patchlog y obtén tu página pública en segundos.' },
                { step: '2', title: 'Publica tu changelog', desc: 'Escribe entradas con versión y tipo — feature, fix, mejora — para cada cambio que hagas.' },
                { step: '3', title: 'Tus seguidores al día', desc: 'Quien te siga verá tus actualizaciones en su feed personal nada más las publiques.' },
              ].map(({ step, title, desc }) => (
                <li key={step} className="flex flex-col items-start">
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-sm mb-4">
                    {step}
                  </span>
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Demo visual */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold text-center text-white mb-10">Así se ve tu proyecto</h2>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-zinc-700" />
              <div>
                <p className="text-sm font-semibold text-white">Nova Engine</p>
                <p className="text-xs text-zinc-500">Motor de videojuegos indie</p>
              </div>
            </div>
            <ul className="divide-y divide-zinc-800">
              {mockEntries.map((entry) => (
                <li key={entry.version} className="flex items-center gap-4 px-6 py-4">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${entry.color}`} />
                  <span className="text-xs font-medium text-zinc-400 w-24 shrink-0">{entry.label}</span>
                  <span className="text-xs font-mono text-zinc-500 w-10 shrink-0">{entry.version}</span>
                  <span className="text-sm text-zinc-200 flex-1">{entry.title}</span>
                  <span className="text-xs text-zinc-500 shrink-0">{entry.ago}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA final */}
        <section className="border-t border-zinc-800 bg-zinc-900/50">
          <div className="max-w-5xl mx-auto px-6 py-24 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Empieza a publicar tu progreso hoy
            </h2>
            <Link
              href="/login"
              className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-3 rounded-lg transition-colors text-sm"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center">
          <p className="text-xs text-zinc-600">© 2026 Patchlog</p>
        </div>
      </footer>
    </div>
  )
}
