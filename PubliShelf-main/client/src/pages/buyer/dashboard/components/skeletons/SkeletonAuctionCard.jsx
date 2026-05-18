const SkeletonAuctionCard = () => (
  <div className="group relative bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 shadow-md border border-purple-100 overflow-hidden skeleton-shimmer animate-fade-in">
    <div className="relative flex gap-4">
      <div className="flex-shrink-0">
        <div className="w-24 h-32 rounded-lg bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        <div className="h-5 w-24 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-full" />
        <div className="h-4 w-3/4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center space-y-2">
              <div className="bg-white rounded-lg shadow-sm p-2 border border-purple-100">
                <div className="h-7 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
              </div>
              <div className="h-3 w-10 mx-auto bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="space-y-1">
            <div className="h-3 w-20 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
            <div className="h-5 w-28 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
        </div>
      </div>
    </div>
  </div>
);

export default SkeletonAuctionCard;