const AuctionItemDetailSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 animate-fade-in">
      
      <div className="space-y-4">
        <div className="w-[70%] h-[500px] mx-auto bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded-xl skeleton-shimmer" />
      </div>

      <div className="space-y-5">
        <div className="space-y-3">
          <div className="h-7 w-3/4 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
          <div className="h-5 w-1/2 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
          <div className="h-4 w-1/3 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
          <div className="h-4 w-1/4 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
        </div>

        <div className="h-6 w-2/3 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />

        <div className="border-y border-gray-300 py-3 space-y-3">
          <div className="h-8 w-1/3 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
          <div className="h-6 w-1/4 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
        </div>
  
        <div className="space-y-3">
          <div className="h-5 w-1/4 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
          <div className="h-4 w-full bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
          <div className="h-4 w-5/6 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
        </div>

        <div className="h-12 w-full bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded-lg skeleton-shimmer" />
      </div>

    </div>
  </div>
);

export default AuctionItemDetailSkeleton;
