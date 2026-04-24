import { notFound } from 'next/navigation'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import FollowButton from './FollowButton'
import Link from 'next/link'

type EntryType = Database['public']['Enums']['entry_type']

const typeColor: Record<string, string> = {
  feature: 'var(--t-feature)',
  fix: 'var(--t-fix)',
  improvement: 'var(--t-improvement)',
  breaking: 'var(--t-breaking)',
  security: 'var(--t-security)',
}

function relTime(dateStr: string): string {
  const days = (Date.now() - new Date(dateStr).getTime()) / 86400000
  if (days < 1) return 'hoy'
  if (days < 2) return 'ayer'
  if (days < 7) return `hace ${Math.round(days)}d`
  if (days < 30) return `hace ${Math.round(days / 7)}sem`
  return `hace ${Math.round(days / 30)}mes`
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: project } = await supabase.from('projects').select('name, description').eq('slug', slug).single()
  if (!project) return { title: 'Patchlog' }
  return { title: `${project.name} — Patchlog`, description: project.description ?? undefined }
}

export default async function ProjectChangelogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, slug, description, brand_color, user_id')
    .eq('slug', slug)
    .single()

  if (!project) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: entries }, { count: followerCount }, { data: existingFollow }] = await Promise.all([
    supabase
      .from('changelog_entries')
      .select('id, title, type, version, content, published_at')
      .eq('project_id', project.id)
      .eq('published', true)
      .order('published_at', { ascending: false }),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('project_id', project.id),
    user
      ? supabase.from('follows').select('id').eq('user_id', user.id).eq('project_id', project.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const isFollowing = !!existingFollow
  const accentColor = project.brand_color ?? 'var(--accent)'
  const initials = project.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
  const lastEntry = entries?.[0]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      {/* Nav */}
      <header
        className="h-[52px] flex items-center px-5 gap-4 shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
      >
        <div className="flex items-center gap-2.5 font-mono font-semibold text-sm tracking-tight">
          <span
            className="w-[22px] h-[22px] grid place-items-center rounded-[6px] text-xs font-bold"
            style={{ border: '1px solid var(--border-strong)', background: 'var(--bg-elev)', color: 'var(--accent)' }}
          >~</span>
          <Link href="/" className="hover:opacity-80">
            <span style={{ color: 'var(--fg)' }}>patchlog</span>
            <span className="font-normal" style={{ color: 'var(--fg-faint)' }}>/v1</span>
          </Link>
        </div>
        <div className="flex-1" />
        {user ? (
          <Link href="/dashboard" className="text-[13px] font-medium px-2.5 py-1.5 rounded-lg" style={{ color: 'var(--fg-muted)' }}>
            Dashboard
          </Link>
        ) : (
          <Link href="/login" className="text-[13px] font-medium px-2.5 py-1.5 rounded-lg" style={{ color: 'var(--fg-muted)' }}>
            Iniciar sesión
          </Link>
        )}
      </header>

      <main className="flex-1 max-w-[800px] mx-auto w-full px-8 py-10">
        {/* Project header */}
        <div className="flex items-start gap-5 pb-8 mb-8" style={{ borderBottom: '1px solid var(--border)' }}>
          <div
            className="w-[72px] h-[72px] rounded-[14px] grid place-items-center font-mono font-bold text-2xl shrink-0"
            style={{ background: accentColor, color: 'var(--accent-fg)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[28px] font-bold tracking-tight mb-1">{project.name}</h1>
            {project.description && (
              <p className="text-sm mb-3" style={{ color: 'var(--fg-muted)' }}>{project.description}</p>
            )}
            <div className="flex items-center gap-4 font-mono text-[12px]" style={{ color: 'var(--fg-faint)' }}>
              <span>{entries?.length ?? 0} entradas</span>
              <span>{followerCount ?? 0} siguen</span>
              {lastEntry?.published_at && <span>Última: {relTime(lastEntry.published_at)}</span>}
              <a href="#" className="hover:opacity-80" style={{ color: 'var(--accent)' }}>RSS</a>
            </div>
          </div>
          <FollowButton
            projectId={project.id}
            slug={slug}
            initialFollowing={isFollowing}
            initialCount={followerCount ?? 0}
            accentColor={accentColor}
          />
        </div>

        {/* Timeline */}
        {(!entries || entries.length === 0) ? (
          <p className="text-sm text-center py-16" style={{ color: 'var(--fg-faint)' }}>
            Aún no hay entradas publicadas.
          </p>
        ) : (
          <div className="relative">
            <div
              className="absolute left-[7px] top-2 bottom-0 w-px"
              style={{ background: 'var(--border)' }}
            />
            <div className="flex flex-col gap-10">
              {entries.map(entry => {
                const html = DOMPurify.sanitize(marked.parse(entry.content ?? '', { async: false }) as string)
                return (
                  <article key={entry.id} className="pl-8 relative">
                    <div
                      className="absolute left-0 top-[2px] w-[15px] h-[15px] rounded-full grid place-items-center"
                      style={{ border: `2px solid ${accentColor}`, background: 'var(--bg)' }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-[11px]">
                        <span style={{ color: 'var(--fg-faint)' }}>[ </span>
                        <span style={{ color: typeColor[entry.type as EntryType] }}>{entry.type}</span>
                        <span style={{ color: 'var(--fg-faint)' }}> ]</span>
                      </span>
                      {entry.version && (
                        <span
                          className="font-mono text-[11px] px-1.5 py-[2px] rounded-[4px]"
                          style={{ color: 'var(--fg-subtle)', border: '1px solid var(--border)', background: 'var(--bg-elev)' }}
                        >
                          {entry.version}
                        </span>
                      )}
                      {entry.published_at && (
                        <span className="font-mono text-[11px] ml-auto" style={{ color: 'var(--fg-faint)' }}>
                          {relTime(entry.published_at)}
                        </span>
                      )}
                    </div>
                    <h2 className="text-[18px] font-bold tracking-tight mb-3">{entry.title}</h2>
                    <div
                      className="prose prose-sm max-w-none text-sm leading-relaxed"
                      style={{ color: 'var(--fg-muted)' }}
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  </article>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
