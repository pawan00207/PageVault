const SkeletonActivityFeed = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden skeleton-shimmer animate-fade-in">
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
      <div className="space-y-2">
        <div className="h-4 w-40 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
        <div className="h-3 w-56 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
      </div>
    </div>
    <div className="divide-y divide-gray-100">
      {[1, 2, 3, 4].map((idx) => (
        <div key={idx} className="px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-3 w-32 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
              <div className="h-3 w-44 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
              <div className="flex items-center gap-3">
                <div className="h-2 w-16 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
                <div className="h-2 w-2 rounded-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
                <div className="h-3 w-20 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="h-4 w-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="bg-gray-50 px-6 py-3 flex items-center justify-center gap-2 text-sm">
      <div className="h-3 w-40 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
    </div>
  </div>
);

export default SkeletonActivityFeed