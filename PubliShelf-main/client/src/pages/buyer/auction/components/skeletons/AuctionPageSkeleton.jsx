//client/src/pages/buyer/auction/components/skeletons/AuctionPageSkeleton.jsx
import React from "react";
import SkeletonAuctionCard from "./SkeletonAuctionCard";

const AuctionPageSkeleton = () => (
  <div className="min-h-screen pt-20 pb-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonAuctionCard key={i} />
        ))}
      </div>

    </div>
  </div>
);

export default AuctionPageSkeleton;
