'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function followProject(projectId: string, slug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/${slug}`)

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!project || project.id !== projectId) {
    return { error: 'Proyecto no encontrado' }
  }

  await supabase.from('follows').insert({ user_id: user.id, project_id: projectId })
  revalidatePath(`/${slug}`)
}

export async function unfollowProject(projectId: string, slug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/${slug}`)

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!project || project.id !== projectId) {
    return { error: 'Proyecto no encontrado' }
  }

  await supabase.from('follows').delete().eq('user_id', user.id).eq('project_id', projectId)
  revalidatePath(`/${slug}`)
}
