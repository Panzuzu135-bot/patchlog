'use client'
import { createContext, useContext, useState } from 'react'
import TopNav from './TopNav'
import SidebarNav from './SidebarNav'

type Project = { id: string; name: string; slug: string; brand_color: string | null; entryCount: number }
type Profile = { full_name: string | null; avatar_url: string | null }

type DrawerContextType = { open: boolean; toggle: () => void; close: () => void }
export const DrawerContext = createContext<DrawerContextType>({
  open: false,
  toggle: () => {},
  close: () => {},
})
export function useDrawer() { return useContext(DrawerContext) }

export default function DashboardShell({
  projects,
  feedCount,
  profile,
  userInitial,
  children,
}: {
  projects: Project[]
  feedCount: number
  profile: Profile | null
  userInitial: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen(v => !v)
  const close = () => setOpen(false)

  return (
    <DrawerContext.Provider value={{ open, toggle, close }}>
      <div className="flex flex-col h-screen" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
        <TopNav projects={projects} />
        <div className="flex flex-1 min-h-0">
          <SidebarNav
            projects={projects}
            feedCount={feedCount}
            profile={profile}
            userInitial={userInitial}
          />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </DrawerContext.Provider>
  )
}
