const SkeletonHeroCarousel = () => (
  <div className="relative w-full h-[500px] bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-900 rounded-2xl overflow-hidden shadow-2xl skeleton-shimmer animate-fade-in">
    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
    <div className="relative h-full flex items-center px-6 md:px-16">
      <div className="flex-1 max-w-2xl space-y-5">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20">
          <div className="h-4 w-4 rounded-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
          <div className="h-3 w-32 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-10 w-3/4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
          <div className="h-6 w-1/3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-5/6 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
          <div className="h-4 w-2/3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-6">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
            <div className="h-7 w-32 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
          </div>
          <div className="h-11 w-40 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg" />
        </div>
      </div>
      <div className="hidden lg:flex flex-shrink-0 ml-12">
        <div className="relative w-64 h-96">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-indigo-400/30 rounded-lg blur-2xl" />
          <div className="relative w-full h-full rounded-lg border-4 border-white/10 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
        </div>
      </div>
    </div>
  </div>
);

export default SkeletonHeroCarousel;