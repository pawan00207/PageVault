//client/src/pages/admin/dashboard/components/AnalyticsCards.jsx
import React from "react";

const AnalyticsCards = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900">Total Buyers</h3>
        <p className="text-2xl font-bold text-purple-600 mt-2">
          {analytics?.totalBuyers || 0}
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900">Sold Items</h3>
        <p className="text-2xl font-bold text-purple-600 mt-2">
          {analytics?.totalOrders || 0}
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
        <p className="text-2xl font-bold text-purple-600 mt-2">
          ₹{(analytics?.totalRevenue || 0).toFixed(2)}
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900">Active Auctions</h3>
        <p className="text-2xl font-bold text-purple-600 mt-2">
          {analytics?.activeAuctions || 3}
        </p>
      </div>
    </div>
  );
};

export default AnalyticsCards;