//client/src/pages/buyer/dashboard/components/AuctionCountdownCard.jsx
import React, { useState, useEffect } from "react";

const AuctionCountdownCard = ({ auction, onClick }) => {
  const now = new Date();
  const isUpcoming = new Date(auction.auctionStart) > now;
  const isEnded = new Date(auction.auctionEnd) < now;
  
  // Use auctionStart for upcoming, auctionEnd for live
  const targetTime = isUpcoming ? auction.auctionStart : auction.auctionEnd;
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  return (
    <div
      onClick={onClick}
      className="group relative bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-purple-100 hover:border-purple-300 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #8b5cf6 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="relative flex gap-4">
        {/* Book Image */}
        <div className="flex-shrink-0">
          <div className="w-24 h-32 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
            <img
              src={auction.image}
              alt={auction.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Status Badge */}
          <div className="flex items-center gap-2 mb-2">
            {isEnded ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                <i className="fas fa-flag-checkered" />
                Ended
              </span>
            ) : isUpcoming ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                <i className="fas fa-clock" />
                Opening Soon
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold animate-pulse">
                <i className="fas fa-gavel" />
                Live Now
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-purple-700 transition-colors">
            {auction.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">by {auction.author}</p>

          {/* Countdown or Ended Time */}
          {isEnded ? (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Ended on</p>
              <p className="text-sm font-semibold text-gray-700">
                {new Date(auction.auctionEnd).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 mb-3">
              {['Days', 'Hours', 'Mins', 'Secs'].map((label, idx) => (
                <div key={label} className="text-center">
                  <div className="bg-white rounded-lg shadow-sm p-2 border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600 tabular-nums">
                      {String(timeLeft[idx]).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Price & Action */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {isUpcoming ? 'Starting Bid' : 'Current Bid'}
              </p>
              <p className="text-lg font-bold text-purple-700">
                ₹{(auction.currentPrice || auction.basePrice || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <button className="p-2 hover:bg-purple-100 rounded-full transition-colors">
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to calculate time left
const calculateTimeLeft = (targetTime) => {
  const now = new Date();
  const target = new Date(targetTime);
  const diff = target - now;

  if (diff <= 0) return [0, 0, 0, 0];

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  return [days, hours, mins, secs];
};

export default AuctionCountdownCard;
