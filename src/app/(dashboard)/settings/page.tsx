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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>Perfil</h1>
      </div>

      <div className="space-y-8">
        <div className="rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-elev)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-base font-semibold" style={{ color: 'var(--fg)' }}>Avatar</h2>
          </div>
          <div className="px-6 py-5 flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name ?? ''}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-semibold" style={{ background: 'var(--bg-elev-2)', color: 'var(--fg-muted)' }}>
                {initial}
              </div>
            )}
            <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
              El avatar se sincroniza automáticamente desde GitHub
            </p>
          </div>
        </div>

        <ProfileForm full_name={profile?.full_name ?? null} />
      </div>
    </div>
  )
}
