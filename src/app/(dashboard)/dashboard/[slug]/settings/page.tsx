import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import GeneralForm from './GeneralForm'
import DeleteZone from './DeleteZone'

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, slug, description, brand_color')
    .eq('slug', slug)
    .eq('user_id', user.id)
    .single()

  if (!project) notFound()

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link
          href={`/dashboard/${slug}`}
          className="text-sm transition-colors"
          style={{ color: 'var(--fg-muted)' }}
        >
          ← Volver al proyecto
        </Link>
        <h1 className="mt-3 text-2xl font-bold" style={{ color: 'var(--fg)' }}>
          Ajustes — {project.name}
        </h1>
      </div>

      <div className="space-y-8">
        <GeneralForm project={project} />
        <DeleteZone slug={project.slug} />
      </div>
    </div>
  )
}
