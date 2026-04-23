import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: projects }, { data: profile }] = await Promise.all([
    supabase.from('projects').select('name, slug').order('created_at', { ascending: true }),
    supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
  ])

  return (
    <div className="flex h-screen bg-zinc-50">
      <aside className="w-60 shrink-0 flex flex-col border-r border-zinc-200 bg-white">
        <div className="px-4 py-4 border-b border-zinc-200">
          <Link href="/dashboard" className="text-base font-bold text-zinc-900 hover:text-zinc-700">
            Patchlog
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <p className="px-2 pt-3 pb-1 text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Proyectos
          </p>
          {projects?.map((project) => (
            <Link
              key={project.slug}
              href={`/dashboard/${project.slug}`}
              className="flex items-center rounded-md px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              {project.name}
            </Link>
          ))}
          {projects?.length === 0 && (
            <p className="px-2 py-1.5 text-sm text-zinc-400 italic">Sin proyectos</p>
          )}
          <Link
            href="/dashboard/new"
            className="flex items-center rounded-md px-2 py-1.5 text-sm text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
          >
            + Nuevo proyecto
          </Link>
        </nav>

        <div className="p-2 border-t border-zinc-200 space-y-0.5">
          <Link
            href="/settings"
            className="flex items-center rounded-md px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            Ajustes
          </Link>
          <form action="/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full text-left rounded-md px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

        {profile && (
          <div className="px-3 py-3 border-t border-zinc-200 flex items-center gap-2">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name ?? ''}
                className="h-7 w-7 rounded-full"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-600">
                {(profile.full_name ?? user.email ?? '?')[0].toUpperCase()}
              </div>
            )}
            <span className="text-sm text-zinc-700 truncate">
              {profile.full_name ?? user.email}
            </span>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
