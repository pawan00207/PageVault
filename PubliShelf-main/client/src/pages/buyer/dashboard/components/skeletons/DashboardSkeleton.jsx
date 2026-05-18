//client/src/pages/buyer/dashboard/components/skeletons/DashboardSkeleton.jsx
import React from "react";
import SkeletonHeroCarousel from "./SkeletonHeroCarousel";
import SkeletonAuctionCard from "./SkeletonAuctionCard";
import SkeletonBookCard from "./SkeletonBookCard";
import SkeletonActivityFeed from "./SkeletonActivityFeed";

const DashboardSkeleton = () => (
  <div className="flex flex-col min-h-screen bg-gray-50">

    {/* Hero */}
    <section className="pt-20 pb-8 bg-gradient-to-b from-purple-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SkeletonHeroCarousel />
      </div>
    </section>

    {/* Auctions */}
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="h-6 w-6 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-56 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
              <div className="h-4 w-80 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
            </div>
          </div>
          <div className="h-10 w-40 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg skeleton-shimmer" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <SkeletonAuctionCard key={i} />)}
        </div>

      </div>
    </section>

    {/* Content */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left side */}
        <div className="lg:col-span-2 space-y-12">

          {[1,2,3].map(section => (
            <section key={section}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <div className="h-6 w-6 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
                  </div>
                  <div className="h-6 w-56 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
                </div>

                {/* Toggle skeleton */}
                <div className="inline-flex items-center gap-2 p-1 bg-gray-100 rounded-lg shadow-sm skeleton-shimmer">
                  <div className="h-8 w-20 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-md" />
                  <div className="h-8 w-20 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-md" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <SkeletonBookCard key={idx} />
                ))}
              </div>
            </section>
          ))}

        </div>

        {/* Right side */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <SkeletonActivityFeed />
          </div>
        </div>

      </div>
    </div>

  </div>
);

export default DashboardSkeleton;
