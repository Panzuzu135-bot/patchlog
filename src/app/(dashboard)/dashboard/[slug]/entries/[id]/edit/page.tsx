import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import EntryEditForm from './EntryEditForm'

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entry } = await supabase
    .from('changelog_entries')
    .select('id, title, content, version, type, published, project_id, projects!inner(user_id, name)')
    .eq('id', id)
    .single()

  if (!entry) notFound()

  const projects = entry.projects as unknown as { user_id: string; name: string } | { user_id: string; name: string }[]
  const project = Array.isArray(projects) ? projects[0] : projects

  if (project.user_id !== user.id) notFound()

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link
          href={`/dashboard/${slug}`}
          className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          ← Volver al proyecto
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-zinc-900">
          Editar entrada — {project.name}
        </h1>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="text-base font-semibold text-zinc-900">Detalles de la entrada</h2>
        </div>
        <div className="px-6 py-5">
          <EntryEditForm
            entry={{
              id: entry.id,
              title: entry.title,
              content: entry.content,
              version: entry.version,
              type: entry.type,
              published: entry.published,
            }}
            slug={slug}
          />
        </div>
      </div>
    </div>
  )
}
