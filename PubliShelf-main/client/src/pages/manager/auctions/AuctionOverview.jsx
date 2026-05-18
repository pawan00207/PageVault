// client/src/pages/manager/auctions/AuctionOverview.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuctionById, approveAuction, rejectAuction } from "../../../services/manager.services";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/AlertDialog";

const AuctionOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadAuctionDetails();
  }, [id]);

  const loadAuctionDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAuctionById(id);
      if (response.success) {
        setAuction(response.data);
      } else {
        setError(response.message || "Failed to load auction details");
      }
    } catch (err) {
      setError("Failed to load auction details");
      console.error("Error loading auction:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const response = await approveAuction(id);
      if (response.success) {
        setShowApproveDialog(false);
        navigate("/manager/auctions/pending", { 
          state: { message: "Auction approved successfully" }
        });
      } else {
        alert(response.message || "Failed to approve auction");
      }
    } catch (err) {
      alert("Failed to approve auction");
      console.error("Error approving auction:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setActionLoading(true);
    try {
      const response = await rejectAuction(id, rejectionReason);
      if (response.success) {
        setShowRejectDialog(false);
        navigate("/manager/auctions/pending", {
          state: { message: "Auction rejected successfully" }
        });
      } else {
        alert(response.message || "Failed to reject auction");
      }
    } catch (err) {
      alert("Failed to reject auction");
      console.error("Error rejecting auction:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden skeleton-shimmer animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-8 p-8">
              {/* Image skeleton */}
              <div className="flex-shrink-0">
                <div className="w-full lg:w-80 h-96 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg"></div>
              </div>
              {/* Content skeleton */}
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-3/4"></div>
                <div className="h-5 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-1/2"></div>
                <div className="space-y-3 pt-4">
                  <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-4/5"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="h-24 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg"></div>
                  <div className="h-24 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg"></div>
                </div>
                <div className="flex gap-3 pt-6">
                  <div className="h-10 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg flex-1"></div>
                  <div className="h-10 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg flex-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-6xl text-red-500 mb-4"></i>
          <p className="text-gray-700 text-lg mb-4">{error || "Auction not found"}</p>
          <button
            onClick={() => navigate("/manager/auctions/pending")}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Auctions
          </button>
        </div>
      </div>
    );
  }

  const buildAuthMedia = (a) => {
    if (!a) return [];
    const urls = [];
    if (Array.isArray(a.authenticationImages)) urls.push(...a.authenticationImages);
    if (a.authenticationImage) urls.push(a.authenticationImage);
    if (Array.isArray(a.files)) urls.push(...a.files); // forward-compat for mixed files
    const deduped = Array.from(new Set(urls.filter(Boolean)));
    const getType = (u) => {
      const ext = (u.split('?')[0].split('#')[0].split('.').pop() || '').toLowerCase();
      if (["jpg","jpeg","png","webp","gif","svg","bmp","avif"].includes(ext)) return 'image';
      if (["mp4","webm","ogg","mov","m4v"].includes(ext)) return 'video';
      if (ext === 'pdf') return 'pdf';
      // docx/xls etc treated as generic file
      return 'file';
    };
    return deduped.map((u) => ({ url: u, type: getType(u) }));
  };
  const authMedia = buildAuthMedia(auction);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/manager/auctions/pending")}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back to Auctions</span>
          </button>
          
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              auction.status === 'approved' 
                ? 'bg-green-100 text-green-800' 
                : auction.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-red-100 text-red-800'
            }`}>
              {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Title Section */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">{auction.title}</h1>
            <p className="text-purple-100 text-lg">by {auction.author}</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-8">
              {/* Left Column - Images */}
              <div className="space-y-6">
                {/* Book Image */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="fas fa-book text-purple-600"></i>
                    Book Image
                  </h3>
                  <div className="flex items-center justify-center rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
                    {auction.image ? (
                      <img 
                        src={auction.image} 
                        alt={auction.title} 
                        className="w-[90%] h-auto object-cover bg-gray-50"
                      />
                    ) : (
                      <div className="w-full h-96 flex items-center justify-center bg-gray-100">
                        <i className="fas fa-image text-6xl text-gray-400"></i>
                      </div>
                    )}
                  </div>
                </div>

                {/* Authentication Files (images inline, others open in new tab) */}
                {authMedia.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <i className="fas fa-certificate text-purple-600"></i>
                      Authentication Documents
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {authMedia.map((m, index) => (
                        <div key={m.url + index} className="w-[85%] rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
                          {m.type === 'image' ? (
                            <img
                              src={m.url}
                              alt={`Authentication ${index + 1}`}
                              className="mx-auto p-2 h-52 object-contain bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(`/file-viewer?url=${encodeURIComponent(m.url)}&title=${encodeURIComponent(auction.title)}`, '_blank')}
                            />
                          ) : m.type === 'video' ? (
                            <div className="w-full h-48 bg-black text-white flex items-center justify-center">
                              <button
                                onClick={() => window.open(`/file-viewer?url=${encodeURIComponent(m.url)}&title=${encodeURIComponent(auction.title)}`, '_blank')}
                                className="px-3 py-1 bg-purple-600 rounded text-sm hover:bg-purple-700"
                              >
                                Open Video
                              </button>
                            </div>
                          ) : m.type === 'pdf' ? (
                            <div className="p-2 h-52 bg-red-50 text-red-600 flex items-center justify-center">
                              <button
                                onClick={() => window.open(`/file-viewer?url=${encodeURIComponent(m.url)}&title=${encodeURIComponent(auction.title)}`, '_blank')}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                              >
                                Open PDF
                              </button>
                            </div>
                          ) : (
                            <div className="p-2 w-[90%] h-52 bg-gray-100 text-gray-700 flex items-center justify-center">
                              <button
                                onClick={() => window.open(`/file-viewer?url=${encodeURIComponent(m.url)}&title=${encodeURIComponent(auction.title)}`, '_blank')}
                                className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-800"
                              >
                                Open File
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Click to view full size</p>
                  </div>
                )}
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Publisher Info */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="fas fa-user text-purple-600"></i>
                    Publisher Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">
                        {auction.publisher?.firstname} {auction.publisher?.lastname}
                      </span>
                    </div>
                    {auction.publisher?.publishingHouse && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Publishing House:</span>
                        <span className="font-medium text-gray-900">{auction.publisher.publishingHouse}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">{auction.publisher?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Book Details */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="fas fa-info-circle text-purple-600"></i>
                    Book Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Genre</label>
                      <p className="text-gray-900 mt-1">{auction.genre}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Condition</label>
                      <p className="text-gray-900 mt-1 capitalize">{auction.condition}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="text-gray-900 mt-1 leading-relaxed">{auction.description}</p>
                    </div>
                  </div>
                </div>

                {/* Auction Details */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="fas fa-gavel text-purple-600"></i>
                    Auction Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Base Price</label>
                      <p className="text-2xl font-bold text-purple-600 mt-1">₹{auction.basePrice?.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Start Date</label>
                        <p className="text-gray-900 text-sm mt-1">{formatDate(auction.auctionStart)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">End Date</label>
                        <p className="text-gray-900 text-sm mt-1">{formatDate(auction.auctionEnd)}</p>
                      </div>
                    </div>
                    {auction.currentPrice > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Current Price</label>
                        <p className="text-xl font-bold text-green-600 mt-1">₹{auction.currentPrice?.toLocaleString("en-IN")}</p>
                      </div>
                    )}
                    {auction.biddingHistory && auction.biddingHistory.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Total Bids</label>
                        <p className="text-gray-900 mt-1">{auction.biddingHistory.length} bids placed</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submission Info */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="fas fa-clock text-purple-600"></i>
                    Submission Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted on:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(auction.createdAt || auction.publishedAt)}
                      </span>
                    </div>
                    {auction.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last updated:</span>
                        <span className="font-medium text-gray-900">{formatDate(auction.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rejection Reason (if rejected) */}
                {auction.status === 'rejected' && auction.rejectionReason && (
                  <div className="bg-red-50 rounded-lg p-5 border-2 border-red-200">
                    <h3 className="text-lg font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <i className="fas fa-times-circle"></i>
                      Rejection Reason
                    </h3>
                    <p className="text-red-800">{auction.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons (only for pending auctions) */}
            {auction.status === 'pending' && (
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
                <button
                  onClick={() => setShowRejectDialog(true)}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
                >
                  <i className="fas fa-times-circle"></i>
                  Reject Auction
                </button>
                <button
                  onClick={() => setShowApproveDialog(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
                >
                  <i className="fas fa-check-circle"></i>
                  Approve Auction
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Auction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this auction? The auction will be made visible to buyers and bidding will be enabled during the scheduled time period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleApprove}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Approving...
                </>
              ) : (
                "Approve"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Auction</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this auction. This will be communicated to the publisher.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason (required)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 min-h-[100px]"
              disabled={actionLoading}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Rejecting...
                </>
              ) : (
                "Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AuctionOverview;
