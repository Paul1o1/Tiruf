export default function FacilityLoading() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="skeleton h-8 w-64 mb-2" />
        <div className="skeleton h-4 w-40" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
            <div className="skeleton h-4 w-20 mb-3" />
            <div className="skeleton h-8 w-10" />
          </div>
        ))}
      </div>

      {/* Action button skeleton */}
      <div className="skeleton h-12 w-full rounded-xl mb-6" />

      {/* Cards skeleton */}
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
            <div className="flex justify-between mb-3">
              <div>
                <div className="skeleton h-5 w-32 mb-2" />
                <div className="skeleton h-4 w-48" />
              </div>
              <div className="skeleton h-6 w-20" />
            </div>
            <div className="flex gap-4 mb-3">
              <div className="skeleton h-4 w-28" />
              <div className="skeleton h-4 w-24" />
            </div>
            <div className="skeleton h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
