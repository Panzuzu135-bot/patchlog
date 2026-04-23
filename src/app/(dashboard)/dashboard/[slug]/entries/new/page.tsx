import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import EntryForm from './EntryForm'

export default async function NewEntryPage({
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
    .select('id, name')
    .eq('slug', slug)
    .eq('user_id', user.id)
    .single()

  if (!project) notFound()

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
          Nueva entrada — {project.name}
        </h1>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="text-base font-semibold text-zinc-900">Detalles de la entrada</h2>
        </div>
        <div className="px-6 py-5">
          <EntryForm slug={slug} />
        </div>
      </div>
    </div>
  )
}
