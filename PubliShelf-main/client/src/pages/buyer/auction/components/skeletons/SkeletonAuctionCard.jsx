//client/src/pages/buyer/auction/components/skeletons/SkeletonAuctionCard.jsx
import React from "react";

const SkeletonAuctionCard = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden skeleton-shimmer animate-fade-in">
    <div className="w-full h-[260px] bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300" />

    <div className="px-4 py-3 space-y-3">
      <div className="h-4 w-3/4 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded" />
      <div className="h-3 w-1/2 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded" />

      <div className="mt-3 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded" />
          <div className="h-5 w-24 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded" />
        </div>

        <div className="space-y-2 text-right">
          <div className="h-3 w-16 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded" />
          <div className="h-5 w-20 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded" />
        </div>
      </div>

      <div className="h-10 w-full bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded-lg" />
    </div>
  </div>
);

export default SkeletonAuctionCard;