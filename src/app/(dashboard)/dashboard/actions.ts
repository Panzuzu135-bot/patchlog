'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function importProjectFromGitHub(repoFullName: string) {
  if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repoFullName)) {
    return { error: 'Nombre de repositorio inválido' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.provider_token) {
    return { error: 'No se encontró el token de GitHub. Cierra sesión y vuelve a entrar.' }
  }

  // Obtener info del repo vía GitHub API
  const res = await fetch(`https://api.github.com/repos/${repoFullName}`, {
    headers: {
      Authorization: `Bearer ${session.provider_token}`,
      Accept: 'application/vnd.github+json',
    },
    cache: 'no-store',
  })
  if (!res.ok) return { error: 'No se pudo obtener el repositorio de GitHub' }
  const repo = await res.json()

  // Derivar slug y gestionar conflictos
  const baseSlug = toSlug(repo.name)
  if (!baseSlug) return { error: 'El nombre del repositorio no es válido como slug' }

  let slug = baseSlug
  let suffix = 2
  while (suffix <= 20) {
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
      .eq('slug', slug)
      .maybeSingle()
    if (!existing) break
    slug = `${baseSlug}-${suffix++}`
  }
  if (suffix > 20) return { error: 'Ya tienes demasiados proyectos con ese nombre. Renombra el repositorio antes de importar.' }

  const { error } = await supabase.from('projects').insert({
    name: repo.name,
    slug,
    description: repo.description ?? null,
    user_id: user.id,
    brand_color: '#6366f1',
  })

  if (error) return { error: 'Error al crear el proyecto' }

  revalidatePath('/dashboard')
  redirect(`/dashboard/${slug}`)
}
