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
  projectId,
  slug,
  initialFollowing,
  initialCount,
  accentColor,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const nextFollowing = !following
    setFollowing(nextFollowing)
    setCount((c) => c + (nextFollowing ? 1 : -1))

    startTransition(async () => {
      try {
        if (nextFollowing) {
          await followProject(projectId, slug)
        } else {
          await unfollowProject(projectId, slug)
        }
      } catch {
        setFollowing(!nextFollowing)
        setCount((c) => c - (nextFollowing ? 1 : -1))
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-400">
        {count} {count === 1 ? 'seguidor' : 'seguidores'}
      </span>
      <button
        onClick={handleClick}
        disabled={isPending}
        className="rounded-md px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{
          backgroundColor: accentColor,
          opacity: following ? 0.75 : undefined,
        }}
      >
        {following ? 'Siguiendo' : 'Seguir'}
      </button>
    </div>
  )
}
