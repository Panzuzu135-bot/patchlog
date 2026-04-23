export default function Loading() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 rounded-md bg-zinc-200 animate-pulse" />
          <div className="h-3 w-64 rounded bg-zinc-100 animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-24 rounded-md bg-zinc-100 animate-pulse" />
          <div className="h-9 w-32 rounded-md bg-zinc-200 animate-pulse" />
        </div>
      </div>

      <div className="flex gap-6 mb-6 border-b border-zinc-200">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="pb-3 h-4 w-16 rounded bg-zinc-100 animate-pulse"
          />
        ))}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
        <ul className="divide-y divide-zinc-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-5 w-16 rounded-full bg-zinc-100 animate-pulse shrink-0" />
                <div className="h-4 w-48 rounded bg-zinc-200 animate-pulse" />
                <div className="h-3 w-12 rounded bg-zinc-100 animate-pulse shrink-0" />
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="h-3 w-16 rounded bg-zinc-100 animate-pulse" />
                <div className="h-3 w-10 rounded bg-zinc-100 animate-pulse" />
                <div className="h-3 w-10 rounded bg-zinc-100 animate-pulse" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
