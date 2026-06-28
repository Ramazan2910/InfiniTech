export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-card bg-surface shadow-card overflow-hidden">
      <div className="h-40 bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-12 rounded-chip bg-gray-100" />
          <div className="h-5 w-20 rounded-chip bg-gray-100" />
        </div>
        <div className="h-4 w-3/4 rounded bg-gray-100" />
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-2/3 rounded bg-gray-100" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-6 w-16 rounded bg-gray-100" />
          <div className="h-8 w-24 rounded-btn bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-card bg-surface p-4 shadow-card">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-card bg-gray-100 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-gray-100" />
              <div className="h-3 w-2/3 rounded bg-gray-100" />
            </div>
            <div className="h-5 w-20 rounded-chip bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
