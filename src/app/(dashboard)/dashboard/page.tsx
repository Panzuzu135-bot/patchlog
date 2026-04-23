import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, slug, description, brand_color, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: true })

  const counts: Record<string, number> = {}
  if (projects && projects.length > 0) {
    await Promise.all(
      projects.map(async (project) => {
        const { count } = await supabase
          .from('changelog_entries')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id)
          .eq('published', true)
        counts[project.id] = count ?? 0
      })
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Mis proyectos</h1>
        <Link
          href="/dashboard/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          Nuevo proyecto
        </Link>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/${project.slug}`}
              className="group flex flex-col rounded-lg border border-zinc-200 bg-white overflow-hidden hover:border-zinc-300 hover:shadow-sm transition-all"
            >
              <div className="h-2 w-full" style={{ backgroundColor: project.brand_color }} />
              <div className="flex flex-col gap-1 p-5">
                <span className="font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors">
                  {project.name}
                </span>
                <span className="text-sm text-zinc-400">/{project.slug}</span>
                {project.description && (
                  <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{project.description}</p>
                )}
                <span className="mt-3 text-xs text-zinc-400">
                  {counts[project.id] === 1
                    ? '1 entrada publicada'
                    : `${counts[project.id] ?? 0} entradas publicadas`}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-white py-20 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-1">
            Todavía no tienes proyectos
          </h2>
          <p className="text-sm text-zinc-500 mb-6 max-w-xs">
            Crea tu primer proyecto y empieza a publicar tu changelog
          </p>
          <Link
            href="/dashboard/new"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            Crear mi primer proyecto
          </Link>
        </div>
      )}
    </div>
  )
}
