'use client'
import { useTransition, useState } from 'react'
import { followProject, unfollowProject } from './actions'

interface FollowButtonProps {
  projectId: string
  slug: string
  initialFollowing: boolean
  initialCount: number
  accentColor: string
}

export default function FollowButton({
  projectId, slug, initialFollowing, initialCount, accentColor,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const next = !following
    setFollowing(next)
    setCount(c => c + (next ? 1 : -1))
    startTransition(async () => {
      try {
        if (next) await followProject(projectId, slug)
        else await unfollowProject(projectId, slug)
      } catch {
        setFollowing(!next)
        setCount(c => c - (next ? 1 : -1))
      }
    })
  }

  const bg = accentColor.startsWith('var(') ? 'var(--accent)' : accentColor

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center rounded-lg overflow-hidden font-semibold text-[13px] transition-all hover:brightness-110 disabled:opacity-60 shrink-0"
      style={{ border: `1px solid ${bg}`, opacity: following ? 0.8 : 1 }}
    >
      <span className="px-3 py-1.5" style={{ background: bg, color: 'var(--accent-fg)' }}>
        {following ? 'Siguiendo' : 'Seguir'}
      </span>
      <span
        className="px-2.5 py-1.5 font-mono text-xs"
        style={{ background: 'var(--bg-elev)', color: bg, borderLeft: `1px solid ${bg}` }}
      >
        {count}
      </span>
    </button>
  )
}
