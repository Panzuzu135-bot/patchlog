'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createProject(_prevState: { error?: string }, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string | null
  const brand_color = formData.get('brand_color') as string || '#6366f1'

  if (!name?.trim() || !slug?.trim()) {
    return { error: 'Nombre y slug son obligatorios' }
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: 'El slug solo puede contener letras minúsculas, números y guiones' }
  }

  const colorRegex = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/
  if (brand_color && !colorRegex.test(brand_color)) {
    return { error: 'Color de marca inválido' }
  }

  const { error } = await supabase.from('projects').insert({
    name: name.trim(),
    slug: slug.trim(),
    description: description?.trim() || null,
    brand_color,
    user_id: user.id,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Este slug ya está en uso. Elige otro.' }
    }
    return { error: 'Error al crear el proyecto. Inténtalo de nuevo.' }
  }

  revalidatePath('/dashboard')
  redirect(`/dashboard/${slug}`)
}
