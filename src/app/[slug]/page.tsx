import { notFound } from 'next/navigation'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import FollowButton from './FollowButton'

type EntryType = Database['public']['Enums']['entry_type']

const BADGE: Record<EntryType, { label: string; classes: string }> = {
  feature:     { label: 'Feature',      classes: 'bg-green-100 text-green-800' },
  fix:         { label: 'Fix',          classes: 'bg-red-100 text-red-800' },
  improvement: { label: 'Improvement',  classes: 'bg-blue-100 text-blue-800' },
  breaking:    { label: 'Breaking',     classes: 'bg-orange-100 text-orange-800' },
  security:    { label: 'Security',     classes: 'bg-purple-100 text-purple-800' },
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
  const minutes = diff / 60_000
  const hours = minutes / 60
  const days = hours / 24
  if (Math.abs(days) >= 30) return rtf.format(-Math.round(days / 30), 'month')
  if (Math.abs(days) >= 1) return rtf.format(-Math.round(days), 'day')
  if (Math.abs(hours) >= 1) return rtf.format(-Math.round(hours), 'hour')
  return rtf.format(-Math.round(minutes), 'minute')
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: project } = await supabase
    .from('projects')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!project) return { title: 'Patchlog' }
  return {
    title: `${project.name} — Patchlog`,
    description: project.description ?? undefined,
  }
}

export default async function ProjectChangelogPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, slug, description, brand_color, user_id')
    .eq('slug', slug)
    .single()

  if (!project) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: profile },
    { data: entries },
    { count: followerCount },
    { data: existingFollow },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', project.user_id)
      .single(),
    supabase
      .from('changelog_entries')
      .select('id, title, type, version, content, published_at')
      .eq('project_id', project.id)
      .eq('published', true)
      .order('published_at', { ascending: false }),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project.id),
    user
      ? supabase.from('follows').select('id').eq('user_id', user.id).eq('project_id', project.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const isFollowing = !!existingFollow

  const accentColor = project.brand_color ?? '#6366f1'
  const displayName = profile?.full_name ?? null
  const avatarInitial = (displayName ?? slug)[0].toUpperCase()

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div
            className="border-l-4 pl-4"
            style={{ borderColor: accentColor }}
          >
            <h1 className="text-2xl font-bold text-zinc-900">{project.name}</h1>
            {project.description && (
              <p className="mt-1 text-zinc-500 text-sm">{project.description}</p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName ?? ''}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-600">
                  {avatarInitial}
                </div>
              )}
              <div className="text-sm text-zinc-600">
                {displayName && <span className="font-medium text-zinc-800">{displayName}</span>}
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
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {(!entries || entries.length === 0) && (
          <p className="text-center text-zinc-400 py-16 text-sm">
            Aún no hay entradas publicadas.
          </p>
        )}
        {entries?.map((entry) => {
          const badge = BADGE[entry.type]
          const html = DOMPurify.sanitize(marked.parse(entry.content, { async: false }))

          return (
            <article
              key={entry.id}
              className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.classes}`}
                >
                  {badge.label}
                </span>
                {entry.version && (
                  <span className="text-xs font-mono text-zinc-400">{entry.version}</span>
                )}
                {entry.published_at && (
                  <span className="text-xs text-zinc-400 ml-auto">
                    {relativeTime(entry.published_at)}
                  </span>
                )}
              </div>

              <h2 className="text-base font-bold text-zinc-900 mb-3">{entry.title}</h2>

              <div
                className="prose prose-sm prose-zinc max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </article>
          )
        })}
      </main>
    </div>
  )
}
