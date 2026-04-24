import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type EntryType = 'feature' | 'fix' | 'improvement' | 'breaking' | 'security'

const mockEntries: { id: string; type: EntryType; version: string; title: string; ago: string }[] = [
  { id: 'e1', type: 'feature',     version: 'v2.1.0', title: 'Sistema de partidas multijugador',     ago: 'hace 2d'   },
  { id: 'e2', type: 'improvement', version: 'v2.0.3', title: 'Reducido tiempo de compilación en 40%', ago: 'hace 9d'  },
  { id: 'e3', type: 'fix',         version: 'v2.0.2', title: 'Crash al cargar mapas > 256MB',         ago: 'hace 2sem' },
  { id: 'e4', type: 'breaking',    version: 'v2.0.0', title: 'Nueva API de materiales',               ago: 'hace 4sem' },
]

const typeColor: Record<EntryType, string> = {
  feature:     'oklch(0.82 0.17 155)',
  fix:         'oklch(0.72 0.19 28)',
  improvement: 'oklch(0.76 0.15 240)',
  breaking:    'oklch(0.78 0.17 50)',
  security:    'oklch(0.75 0.15 310)',
}

const steps = [
  { num: '01', title: 'Crea un proyecto',      desc: 'Registra tu proyecto y obtén una página pública en segundos. Slug, color, descripción.',                          glyph: '$ patchlog new nova-engine'  },
  { num: '02', title: 'Publica tu changelog',  desc: 'Escribe entradas markdown con versión y tipo — feature, fix, improvement, breaking, security.',                   glyph: '✓ v2.1.0 published'          },
  { num: '03', title: 'Tus seguidores al día', desc: 'Cada publicación aparece en el feed personal de quien te sigue. Sin emails. Sin apps.',                           glyph: '→ 284 followers notified'    },
]

const features = [
  { icon: 'md',  title: 'Markdown nativo',     desc: 'Escribe como en GitHub. Code blocks, listas, enlaces.'                          },
  { icon: 'v',   title: 'Versionado estricto', desc: 'Cada entrada lleva versión. Historial ordenado por defecto.'                    },
  { icon: 'rss', title: 'RSS y JSON feed',     desc: 'Integra patchlog en cualquier reader. Webhooks opcionales.'                     },
  { icon: '◎',   title: 'Privados o públicos', desc: 'Controla quién ve cada changelog desde los ajustes del proyecto.'               },
]

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>

      {/* Nav */}
      <header
        className="h-[52px] flex items-center px-5 gap-4 shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
      >
        <div className="flex items-center gap-2.5 font-mono font-semibold text-sm tracking-tight">
          <span
            className="w-[22px] h-[22px] grid place-items-center rounded-[6px] font-mono text-xs font-bold"
            style={{ border: '1px solid var(--border-strong)', background: 'var(--bg-elev)', color: 'var(--accent)' }}
          >~</span>
          <span>patchlog<span className="font-normal" style={{ color: 'var(--fg-faint)' }}>/v1</span></span>
        </div>
        <div className="flex-1" />
        <Link
          href="/login"
          className="text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: 'var(--fg-muted)' }}
        >
          Iniciar sesión
        </Link>
      </header>

      <main className="flex-1">

        {/* Hero */}
        <section className="max-w-[1120px] mx-auto px-10 py-20">
          <div className="grid gap-14 items-center" style={{ gridTemplateColumns: '1.1fr 1fr' }}>

            {/* Left column */}
            <div>
              <span
                className="inline-flex items-center gap-2 font-mono text-xs px-[10px] py-[5px] rounded-full"
                style={{ color: 'var(--fg-muted)', border: '1px solid var(--border)', background: 'var(--bg-elev)' }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full block shrink-0"
                  style={{ background: 'var(--accent)', boxShadow: '0 0 0 3px color-mix(in oklch, var(--accent) 25%, transparent)' }}
                />
                Changelogs para desarrolladores
              </span>

              <h1
                className="mt-6 mb-5 font-semibold leading-[1.02]"
                style={{ fontSize: 'clamp(40px, 5.2vw, 64px)', letterSpacing: '-0.035em' }}
              >
                Publica tu progreso.<br />
                Que nadie se pierda una{' '}
                <em
                  className="not-italic font-mono font-medium"
                  style={{ color: 'var(--accent)', letterSpacing: '-0.02em' }}
                >release</em>.
              </h1>

              <p
                className="text-[17px] leading-[1.55] max-w-[480px] mb-8"
                style={{ color: 'var(--fg-muted)' }}
              >
                Patchlog es el lugar donde los desarrolladores publican changelogs versionados y sus seguidores los reciben en un feed personal. Sin widgets. Sin ruido.
              </p>

              <div className="flex gap-2.5 items-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 font-semibold text-[13px] px-[14px] py-2 rounded-lg transition-all hover:brightness-110"
                  style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: '1px solid var(--accent)' }}
                >
                  Empieza gratis
                  <span className="font-mono text-[11px] opacity-70">↗</span>
                </Link>
                <Link
                  href="/login"
                  className="text-[13px] font-medium px-[10px] py-2 rounded-lg transition-colors hover:opacity-80"
                  style={{ color: 'var(--fg-muted)' }}
                >
                  Ver ejemplo →
                </Link>
              </div>

              <div className="mt-8 flex gap-6 font-mono text-xs" style={{ color: 'var(--fg-faint)' }}>
                <span><strong className="font-medium" style={{ color: 'var(--fg-muted)' }}>1.2k</strong> proyectos</span>
                <span><strong className="font-medium" style={{ color: 'var(--fg-muted)' }}>9.4k</strong> entradas</span>
                <span><strong className="font-medium" style={{ color: 'var(--fg-muted)' }}>free</strong> para empezar</span>
              </div>
            </div>

            {/* Right column: preview mockup */}
            <div
              className="rounded-[14px] overflow-hidden relative"
              style={{
                background: 'var(--bg-elev)',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 60px -20px rgba(0,0,0,0.6)',
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 0% 0%, color-mix(in oklch, var(--accent) 8%, transparent), transparent 50%)' }}
              />
              {/* Browser chrome */}
              <div
                className="flex items-center gap-2.5 px-4 py-3.5 font-mono text-xs relative"
                style={{ borderBottom: '1px solid var(--border)', color: 'var(--fg-subtle)' }}
              >
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--border-strong)' }} />
                  ))}
                </div>
                <span
                  className="ml-1 px-2.5 py-[3px] rounded-full"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
                >
                  patchlog.dev/nova-engine
                </span>
              </div>
              {/* Preview body */}
              <div className="p-5 relative">
                <div className="flex items-center gap-3 pb-4 mb-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div
                    className="w-10 h-10 rounded-lg grid place-items-center font-mono font-bold text-base shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent), color-mix(in oklch, var(--accent) 60%, var(--fg-muted)))',
                      color: 'var(--accent-fg)',
                    }}
                  >NE</div>
                  <div>
                    <p className="text-sm font-semibold m-0">Nova Engine</p>
                    <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--fg-subtle)' }}>Motor de videojuegos indie</p>
                  </div>
                  <span className="ml-auto font-mono text-[11px]" style={{ color: 'var(--fg-faint)' }}>284 siguen</span>
                </div>
                <ul className="list-none p-0 m-0">
                  {mockEntries.map((e, i) => (
                    <li
                      key={e.id}
                      className="grid items-center gap-3 py-3 text-[13px]"
                      style={{
                        gridTemplateColumns: '16px 90px 52px 1fr auto',
                        ...(i < mockEntries.length - 1 ? { borderBottom: '1px dashed var(--border)' } : {}),
                      }}
                    >
                      <span className="font-mono text-[10px]" style={{ color: 'var(--fg-faint)' }}>●</span>
                      <span className="font-mono text-[11px]" style={{ color: typeColor[e.type] }}>{e.type}</span>
                      <span
                        className="font-mono text-[11px] px-1.5 py-[2px] rounded-[4px]"
                        style={{ color: 'var(--fg-subtle)', border: '1px solid var(--border)', background: 'var(--bg-elev)' }}
                      >{e.version}</span>
                      <span className="font-medium truncate" style={{ color: 'var(--fg)' }}>{e.title}</span>
                      <span className="font-mono text-[11px]" style={{ color: 'var(--fg-faint)' }}>{e.ago}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </section>

        {/* How it works */}
        <section
          className="max-w-[1120px] mx-auto px-10 py-[72px]"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="font-mono text-xs mb-3 tracking-[0.02em] m-0" style={{ color: 'var(--accent)' }}>
            {'// cómo funciona'}
          </p>
          <h2
            className="text-[32px] leading-[1.1] font-semibold mb-12 max-w-[720px]"
            style={{ letterSpacing: '-0.025em' }}
          >
            Tres pasos. Cero fricción.
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {steps.map(s => (
              <div
                key={s.num}
                className="p-6 rounded-xl"
                style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-full h-[84px] rounded-lg mb-5 grid place-items-center font-mono text-xs"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-subtle)' }}
                >
                  {s.glyph}
                </div>
                <div className="font-mono text-[11px] mb-4" style={{ color: 'var(--fg-faint)' }}>{s.num}</div>
                <h3 className="text-[17px] font-semibold mb-2 mt-0" style={{ letterSpacing: '-0.01em' }}>{s.title}</h3>
                <p className="text-sm leading-[1.5] m-0" style={{ color: 'var(--fg-muted)' }}>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div
            className="grid grid-cols-4 gap-8 mt-16 py-12"
            style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
          >
            {features.map(f => (
              <div key={f.title}>
                <div
                  className="w-7 h-7 rounded-[6px] grid place-items-center font-mono text-sm font-semibold mb-4"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                >
                  {f.icon}
                </div>
                <h4 className="text-sm font-semibold mb-1.5 mt-0">{f.title}</h4>
                <p className="text-[13px] leading-[1.55] m-0" style={{ color: 'var(--fg-muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-[1120px] mx-auto px-10 pt-[72px] pb-[100px]">
          <div
            className="p-12 rounded-2xl flex items-center justify-between gap-10"
            style={{
              border: '1px solid var(--border)',
              background: 'radial-gradient(circle at 85% 20%, color-mix(in oklch, var(--accent) 10%, transparent), transparent 50%), var(--bg-elev)',
            }}
          >
            <h2
              className="text-[32px] font-semibold max-w-[520px] m-0"
              style={{ letterSpacing: '-0.025em', lineHeight: '1.15' }}
            >
              Empieza a publicar el progreso de tu proyecto.
            </h2>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 font-semibold text-[13px] px-[14px] py-2 rounded-lg transition-all hover:brightness-110 shrink-0"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: '1px solid var(--accent)' }}
            >
              Crear cuenta gratis
              <span className="font-mono text-[11px] opacity-70">↗</span>
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer
        className="max-w-[1120px] mx-auto w-full px-10 py-6 flex justify-between font-mono text-xs"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--fg-faint)' }}
      >
        <span>© 2026 patchlog</span>
        <span>v1.0.0 · build 2026.04.24</span>
      </footer>

    </div>
  )
}
