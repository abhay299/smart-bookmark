export function SkeletonCard() {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-gray-700 rounded-lg" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-700 rounded w-1/2" />
        </div>
        <div className="w-8 h-8 bg-gray-700 rounded" />
      </div>
    </div>
  )
}
