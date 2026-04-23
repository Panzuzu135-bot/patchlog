export default function Loading() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-40 rounded-md bg-zinc-200 animate-pulse" />
        <div className="h-9 w-36 rounded-md bg-zinc-200 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-lg border border-zinc-200 bg-white overflow-hidden"
          >
            <div className="h-2 w-full bg-zinc-200 animate-pulse" />
            <div className="flex flex-col gap-2 p-5">
              <div className="h-4 w-3/4 rounded bg-zinc-200 animate-pulse" />
              <div className="h-3 w-1/3 rounded bg-zinc-100 animate-pulse" />
              <div className="mt-1 h-3 w-full rounded bg-zinc-100 animate-pulse" />
              <div className="mt-3 h-3 w-1/2 rounded bg-zinc-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
