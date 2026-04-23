import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const initial = (profile?.full_name ?? user.email ?? '?')[0].toUpperCase()

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Perfil</h1>
      </div>

      <div className="space-y-8">
        <div className="rounded-lg border border-zinc-200 bg-white">
          <div className="px-6 py-4 border-b border-zinc-200">
            <h2 className="text-base font-semibold text-zinc-900">Avatar</h2>
          </div>
          <div className="px-6 py-5 flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name ?? ''}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-zinc-200 flex items-center justify-center text-xl font-semibold text-zinc-600">
                {initial}
              </div>
            )}
            <p className="text-sm text-zinc-500">
              El avatar se sincroniza automáticamente desde GitHub
            </p>
          </div>
        </div>

        <ProfileForm full_name={profile?.full_name ?? null} />
      </div>
    </div>
  )
}
