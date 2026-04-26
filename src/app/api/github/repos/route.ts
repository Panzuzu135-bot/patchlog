import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.provider_token) {
    return NextResponse.json({ error: 'No GitHub token' }, { status: 401 })
  }

  const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=pushed', {
    headers: {
      Authorization: `Bearer ${session.provider_token}`,
      Accept: 'application/vnd.github+json',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'GitHub API error' }, { status: res.status })
  }

  const repos = await res.json()
  return NextResponse.json(repos.map((r: any) => ({
    id: r.id,
    full_name: r.full_name,
    name: r.name,
    description: r.description,
    language: r.language,
    pushed_at: r.pushed_at,
    private: r.private,
  })))
}
