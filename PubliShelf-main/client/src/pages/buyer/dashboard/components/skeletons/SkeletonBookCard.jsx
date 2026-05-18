const SkeletonBookCard = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 skeleton-shimmer animate-fade-in">
    <div className="relative w-full h-64 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
    <div className="p-3 space-y-2">
      <div className="h-4 w-3/4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
      <div className="h-3 w-1/2 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
      <div className="flex flex-col gap-1 mt-1">
        <div className="h-3 w-20 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
        <div className="h-4 w-16 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
      </div>
    </div>
  </div>
);

export default SkeletonBookCard;