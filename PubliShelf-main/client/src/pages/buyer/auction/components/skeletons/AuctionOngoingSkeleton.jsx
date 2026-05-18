import React from "react";

const AuctionOngoingSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">

      {/* Left — Main Image */}
      <div className="space-y-4">
        <div className="w-[70%] h-[500px] mx-auto bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded-xl skeleton-shimmer" />

        {/* Authentication images */}
        <div className="flex space-x-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 w-24 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded-lg skeleton-shimmer"
            />
          ))}
        </div>
      </div>

      {/* Right — Details */}
      <div className="space-y-6">

        {/* Title */}
        <div className="space-y-3">
          <div className="h-7 w-3/4 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
          <div className="h-5 w-1/2 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
          <div className="h-4 w-1/3 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
        </div>

        {/* Countdown / Progress */}
        <div className="space-y-3">
          <div className="h-5 w-1/2 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
          <div className="h-3 w-full bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
        </div>

        {/* Sync Block */}
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="h-5 w-2/3 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
          <div className="h-9 w-full bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
        </div>

        {/* Price Row */}
        <div className="border-y border-gray-300 py-3 space-y-3">
          <div className="h-7 w-1/3 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
          <div className="h-5 w-1/4 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
        </div>

        {/* Bid Input + Button */}
        <div className="space-y-3">
          <div className="h-10 w-full bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded-lg skeleton-shimmer" />
          <div className="h-10 w-full bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded-lg skeleton-shimmer" />
        </div>

        {/* Description */}
        <div className="space-y-3">
          <div className="h-5 w-1/4 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
          <div className="h-4 w-full bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
          <div className="h-4 w-5/6 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
        </div>

      </div>

    </div>

    {/* Bidding History */}
    <div className="p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-900">Bidding History</h3>

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-gray-200 pb-3"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 skeleton-shimmer" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
                <div className="h-3 w-20 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
              </div>
            </div>
            <div className="h-5 w-16 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AuctionOngoingSkeleton;
