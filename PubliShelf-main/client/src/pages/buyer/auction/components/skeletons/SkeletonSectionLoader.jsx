//client/src/pages/buyer/auction/components/skeletons/SkeletonSectionLoader.jsx
import React from "react";
import SkeletonAuctionCard from "./SkeletonAuctionCard";

const SkeletonSectionLoader = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <SkeletonAuctionCard key={i} />
    ))}
  </div>
);

export default SkeletonSectionLoader;