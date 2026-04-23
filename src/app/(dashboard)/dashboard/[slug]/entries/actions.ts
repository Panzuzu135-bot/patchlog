'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createEntry(slug: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const version = formData.get('version') as string | null
  const type = (formData.get('type') as string) || 'feature'
  const published = formData.get('published') === 'on'

  if (!title?.trim()) return { error: 'El título es obligatorio' }
  if (!content?.trim()) return { error: 'El contenido es obligatorio' }

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('slug', slug)
    .eq('user_id', user.id)
    .single()

  if (!project) return { error: 'Proyecto no encontrado' }

  const { error } = await supabase
    .from('changelog_entries')
    .insert({
      title: title.trim(),
      content: content.trim(),
      version: version?.trim() || null,
      type: type as 'feature' | 'fix' | 'improvement' | 'breaking' | 'security',
      published,
      project_id: project.id,
    })

  if (error) return { error: 'Error al crear la entrada' }

  revalidatePath(`/dashboard/${slug}`)
  redirect(`/dashboard/${slug}`)
}

export async function updateEntry(entryId: string, slug: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const version = formData.get('version') as string | null
  const type = (formData.get('type') as string) || 'feature'
  const published = formData.get('published') === 'on'

  if (!title?.trim()) return { error: 'El título es obligatorio' }
  if (!content?.trim()) return { error: 'El contenido es obligatorio' }

  const { data: entry } = await supabase
    .from('changelog_entries')
    .select('id, project_id, projects!inner(user_id)')
    .eq('id', entryId)
    .single()

  if (!entry) return { error: 'Entrada no encontrada' }

  const projects = entry.projects as unknown as { user_id: string } | { user_id: string }[]
  const owner = Array.isArray(projects) ? projects[0] : projects
  if (owner.user_id !== user.id) return { error: 'No tienes permiso para editar esta entrada' }

  const { error } = await supabase
    .from('changelog_entries')
    .update({
      title: title.trim(),
      content: content.trim(),
      version: version?.trim() || null,
      type: type as 'feature' | 'fix' | 'improvement' | 'breaking' | 'security',
      published,
    })
    .eq('id', entryId)

  if (error) return { error: 'Error al actualizar la entrada' }

  revalidatePath(`/dashboard/${slug}`)
  redirect(`/dashboard/${slug}`)
}

export async function togglePublish(entryId: string, currentPublished: boolean, slug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entry } = await supabase
    .from('changelog_entries')
    .select('id, projects!inner(user_id)')
    .eq('id', entryId)
    .single()

  if (!entry) return { error: 'No encontrado' }

  const projects = entry.projects as unknown as { user_id: string } | { user_id: string }[]
  const owner = Array.isArray(projects) ? projects[0] : projects
  if (owner.user_id !== user.id) return { error: 'No tienes permiso para modificar esta entrada' }

  const { error } = await supabase
    .from('changelog_entries')
    .update({ published: !currentPublished })
    .eq('id', entryId)

  if (error) return { error: 'Error al actualizar la entrada' }

  revalidatePath(`/dashboard/${slug}`)
}

export async function deleteEntry(entryId: string, slug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entry } = await supabase
    .from('changelog_entries')
    .select('id, projects!inner(user_id)')
    .eq('id', entryId)
    .single()

  if (!entry) return { error: 'No encontrado' }

  const projects = entry.projects as unknown as { user_id: string } | { user_id: string }[]
  const owner = Array.isArray(projects) ? projects[0] : projects
  if (owner.user_id !== user.id) return { error: 'No tienes permiso para borrar esta entrada' }

  const { error } = await supabase
    .from('changelog_entries')
    .delete()
    .eq('id', entryId)

  if (error) return { error: 'Error al borrar la entrada' }

  revalidatePath(`/dashboard/${slug}`)
}
