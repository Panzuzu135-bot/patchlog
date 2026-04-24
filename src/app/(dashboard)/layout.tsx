import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TopNav from './TopNav'
import SidebarNav from './SidebarNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: projects }, { data: profile }, { data: follows }] = await Promise.all([
    supabase.from('projects').select('id, name, slug, brand_color').eq('user_id', user.id).order('created_at', { ascending: true }),
    supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
    supabase.from('follows').select('project_id').eq('user_id', user.id),
  ])

  const entryCounts: Record<string, number> = {}
  if (projects && projects.length > 0) {
    const results = await Promise.all(
      projects.map(p =>
        supabase.from('changelog_entries').select('*', { count: 'exact', head: true }).eq('project_id', p.id)
      )
    )
    projects.forEach((p, i) => { entryCounts[p.id] = results[i].count ?? 0 })
  }

  let feedCount = 0
  if (follows && follows.length > 0) {
    const ids = follows.map(f => f.project_id)
    const { count } = await supabase
      .from('changelog_entries')
      .select('*', { count: 'exact', head: true })
      .in('project_id', ids)
      .eq('published', true)
    feedCount = count ?? 0
  }

  const projectsWithCounts = (projects ?? []).map(p => ({ ...p, entryCount: entryCounts[p.id] ?? 0 }))
  const userInitial = (profile?.full_name ?? user.email ?? '?')[0].toUpperCase()

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <TopNav projects={projectsWithCounts} />
      <div className="flex flex-1 min-h-0">
        <SidebarNav
          projects={projectsWithCounts}
          feedCount={feedCount}
          profile={profile}
          userInitial={userInitial}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
