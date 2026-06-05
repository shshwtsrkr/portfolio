export default function AdminLoading() {
  return (
    <div className="space-y-8">
      <div className="h-9 w-52 animate-pulse rounded-lg bg-white/10" />
      <div className="grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="card-glass min-h-32 animate-pulse">
            <div className="h-1.5 w-12 rounded-full bg-white/15" />
            <div className="mt-8 h-10 w-16 rounded bg-white/10" />
            <div className="mt-3 h-4 w-28 rounded bg-white/10" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((item) => (
          <div key={item} className="card-glass animate-pulse">
            <div className="h-5 w-36 rounded bg-white/10" />
            <div className="mt-3 h-4 w-72 max-w-full rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  )
}
