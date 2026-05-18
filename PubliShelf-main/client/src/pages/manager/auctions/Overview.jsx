// client/src/pages/manager/auctions/Overview.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuctionOverview } from "../../../services/manager.services";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "../../../components/ui/AlertDialog";

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpis, setKpis] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, active: 0 });
  const [recent, setRecent] = useState({ approved: [], rejected: [] });
  const [rejectionDialog, setRejectionDialog] = useState({ open: false, reason: '' });

  const loadOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAuctionOverview();
      if (response.success) {
        setKpis(response.data.kpis);
        setRecent(response.data.recent);
      } else {
        setError(response.message || "Failed to load overview");
      }
    } catch (err) {
      console.error("Error loading overview:", err);
      setError("Failed to load overview data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const KPICard = ({ icon, label, value, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-[2px]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')} flex items-center justify-center`}>
          <i className={`fas ${icon} text-xl ${color}`}></i>
        </div>
      </div>
    </div>
  );

  const timeAgo = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const dys = Math.floor(h / 24);
    if (dys < 7) return `${dys}d ago`;
    return d.toLocaleDateString();
  };

  const AuctionCard = ({ auction }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow h-full">
      <div className={`flex gap-6 p-6 h-full w-full ${auction.status === 'approved' ? 'h-[320px]' : 'h-[340px]'}`}>
        {/* Image */}
        <div className="flex-shrink-0">
          <div className="relative">
            {auction.image ? (
              <img
                src={auction.image}
                alt={auction.title}
                className="w-40 h-56 object-cover rounded-lg"
              />
            ) : (
              <div className="w-40 h-56 bg-gray-200 rounded-lg flex items-center justify-center">
                <i className="fas fa-gavel text-4xl text-gray-400"></i>
              </div>
            )}
            {/* Status pill on image */}
            <div className="absolute top-2 right-2">
              <span className={`text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg ${
                auction.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{auction.title}</h3>
          {auction.author && <p className="text-sm text-gray-600 mb-1">by {auction.author}</p>}

          {/* Meta: status chip + time ago */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${auction.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <i className={`fas ${auction.status === 'approved' ? 'fa-check' : 'fa-times'}`}></i>
              {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
            </span>
            <span className="inline-flex items-center gap-1">
              <i className="far fa-clock"></i>
              {timeAgo(auction.updatedAt || auction.createdAt)}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4">
            {auction.genre && (
              <div className="flex items-center gap-2 text-sm">
                <i className="fas fa-tag text-purple-600 w-4"></i>
                <span className="text-gray-600">Genre:</span>
                <span className="font-medium text-gray-900">{auction.genre}</span>
              </div>
            )}
            
            {auction.condition && (
              <div className="flex items-center gap-2 text-sm">
                <i className="fas fa-certificate text-purple-600 w-4"></i>
                <span className="text-gray-600">Condition:</span>
                <span className="font-medium text-gray-900 capitalize">{auction.condition}</span>
              </div>
            )}

            {auction.basePrice !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <i className="fas fa-rupee-sign text-purple-600 w-4"></i>
                <span className="text-gray-600">Base Price:</span>
                <span className="font-bold text-purple-600 text-lg">₹{auction.basePrice}</span>
              </div>
            )}
          </div>

          {/* Timeline */}
          {(auction.auctionStart || auction.auctionEnd) && (
            <div className="border-t border-gray-200 pt-3 space-y-2 mb-4">
              {auction.auctionStart && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <i className="fas fa-clock"></i>
                  <span>Start: {new Date(auction.auctionStart).toLocaleString()}</span>
                </div>
              )}
              {auction.auctionEnd && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <i className="fas fa-flag-checkered"></i>
                  <span>End: {new Date(auction.auctionEnd).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Publisher */}
          {auction.publisher && (
            <div className="text-xs text-gray-500 mb-3">
              Publisher: {auction.publisher?.firstname} {auction.publisher?.lastname}
            </div>
          )}

          {/* Rejection reason button */}
          {auction.status === 'rejected' && auction.rejectionReason && (
            <button
              onClick={() => setRejectionDialog({ open: true, reason: auction.rejectionReason })}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors w-auto self-start"
            >
              <i className="fas fa-info-circle"></i>
              View Reason
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header skeleton */}
        <div className="h-7 w-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer"></div>

        {/* KPI skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 skeleton-shimmer">
              <div className="h-4 w-24 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded mb-3"></div>
              <div className="h-8 w-16 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Recent Activity skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0, 1].map((col) => (
            <div key={col} className="bg-gray-50 rounded-lg p-6">
              <div className="h-6 w-40 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded mb-4 skeleton-shimmer"></div>
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 flex gap-6 skeleton-shimmer">
                    <div className="w-40 h-56 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-3/4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded"></div>
                      <div className="h-4 w-1/3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded"></div>
                      <div className="h-4 w-1/2 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded"></div>
                      <div className="h-4 w-2/3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
        <p className="text-red-600 text-lg">{error}</p>
        <button
          onClick={loadOverview}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Auctions Activity</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard icon="fa-gavel" label="Total Auctions" value={kpis.total} color="text-blue-600" />
        <KPICard icon="fa-clock" label="Pending" value={kpis.pending} color="text-yellow-600" />
        <KPICard icon="fa-check" label="Approved" value={kpis.approved} color="text-green-600" />
        <KPICard icon="fa-times" label="Rejected" value={kpis.rejected} color="text-red-600" />
        <KPICard icon="fa-fire" label="Active Now" value={kpis.active} color="text-orange-600" />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Approved */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-check-circle text-green-600"></i>
              Recently Approved
            </h3>
            <Link
              to="/manager/auctions/approved"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View all →
            </Link>
          </div>
          {recent.approved.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-inbox text-4xl text-gray-300 mb-2"></i>
              <p className="text-gray-500 text-sm">No approved auctions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recent.approved.map((auction) => (
                <AuctionCard auction={auction} key={auction._id} />
              ))}
            </div>
          )}
        </div>

        {/* Recently Rejected */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-times-circle text-red-600"></i>
              Recently Rejected
            </h3>
            <Link
              to="/manager/auctions/rejected"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View all →
            </Link>
          </div>
          {recent.rejected.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-inbox text-4xl text-gray-300 mb-2"></i>
              <p className="text-gray-500 text-sm">No rejected auctions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recent.rejected.map((auction) => (
                <AuctionCard auction={auction} key={auction._id} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rejection Reason Dialog */}
      <AlertDialog open={rejectionDialog.open} onOpenChange={(open) => setRejectionDialog({ open, reason: rejectionDialog.reason })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <i className="fas fa-exclamation-circle text-red-600 mr-2"></i>
              Rejection Reason
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-gray-800 text-sm leading-relaxed">{rejectionDialog.reason}</p>
            </div>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectionDialog({ open: false, reason: '' })}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Overview;
