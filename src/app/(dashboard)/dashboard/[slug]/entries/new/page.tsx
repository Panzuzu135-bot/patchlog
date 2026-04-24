import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EntryForm from './EntryForm'

export default async function NewEntryPage({ params }: { params: Promise<{ slug: string }> }) {
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
    <div className="p-8">
      <EntryForm slug={slug} />
    </div>
  )
}
