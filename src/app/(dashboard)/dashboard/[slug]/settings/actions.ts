'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateProject(slug: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const brand_color = formData.get('brand_color') as string

  if (!name?.trim()) return { error: 'El nombre es obligatorio' }

  const { error } = await supabase
    .from('projects')
    .update({
      name: name.trim(),
      description: description?.trim() || null,
      brand_color,
    })
    .eq('slug', slug)
    .eq('user_id', user.id)

  if (error) return { error: 'Error al guardar los cambios' }

  revalidatePath(`/dashboard/${slug}/settings`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteProject(slug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('slug', slug)
    .eq('user_id', user.id)

  if (error) return { error: 'Error al borrar el proyecto' }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
