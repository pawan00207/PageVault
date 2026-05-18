//client/src/pages/buyer/dashboard/components/AuctionActivityFeed.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuctionActivityFeed = ({ recentBids = [] }) => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Transform recentBids into activity feed items
    const feedItems = recentBids.slice(0, 5).map((bid, idx) => ({
      id: bid._id || idx,
      type: 'bid',
      user: bid.bidder ? `${bid.bidder.firstname} ${bid.bidder.lastname}` : 'Anonymous',
      action: 'placed a bid on',
      bookTitle: bid.bookTitle || 'Antique Book',
      amount: bid.bidAmount,
      time: bid.bidTime,
      auctionId: bid.auctionId,
      avatar: bid.bidder ? `https://ui-avatars.com/api/?name=${encodeURIComponent(bid.bidder.firstname + ' ' + bid.bidder.lastname)}&background=random&color=fff` : null
    }));

    setActivities(feedItems);
  }, [recentBids]);

  const getTimeAgo = (time) => {
    const now = new Date();
    const past = new Date(time);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <i className="fas fa-gavel text-6xl text-gray-300 mb-4" />
        <p className="text-gray-500">No recent auction activity</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-white font-bold text-lg">Live Auction Activity</h3>
              <p className="text-purple-100 text-sm">Recent bids from the community</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/buyer/auction-page')}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            View All
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-100">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            onClick={() => activity.auctionId && navigate(`/buyer/auction-ongoing/${activity.auctionId}`)}
            className="px-6 py-4 hover:bg-purple-50 transition-colors cursor-pointer group animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={activity.avatar || 'https://ui-avatars.com/api/?name=User&background=random'}
                    alt={activity.user}
                    className="w-12 h-12 rounded-full ring-2 ring-purple-100 group-hover:ring-purple-300 transition-all"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{activity.user}</span>
                  <span className="text-gray-500 text-sm">{activity.action}</span>
                </div>
                <p className="text-sm text-gray-700 font-medium truncate">"{activity.bookTitle}"</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">{getTimeAgo(activity.time)}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <span className="text-xs font-semibold text-purple-600">
                    ₹{activity.amount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Indicator */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fas fa-arrow-right text-purple-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 flex items-center justify-center gap-2 text-sm text-gray-600">
        <i className="fas fa-users" />
        <span>{activities.length} recent activities</span>
      </div>
    </div>
  );
};

export default AuctionActivityFeed;
