// client/src/pages/publisher/auctions/Auctions.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../../../services/publisher.services";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "../../../components/ui/AlertDialog";
import Pagination from "../../../components/Pagination";

/* --------------------- Skeleton Card --------------------- */
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden skeleton-shimmer animate-fade-in">
    <div className="w-full h-56 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <div className="space-y-2">
          <div className="h-4 w-16 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
          <div className="h-3 w-20 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
        </div>
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
      </div>
    </div>
  </div>
);
/* --------------------------------------------------------- */

const Auctions = () => {
  const [user, setUser] = useState({ firstname: "", lastname: "" });
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("approved");
  const [rejectionDialog, setRejectionDialog] = useState({ open: false, reason: "" });

  // pagination
  const pageSize = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    loadAuctions();
  }, []);

  // reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, auctions]);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const response = await getDashboard();
      if (response.success) {
        setUser(response.data.publisher);
        setAuctions(response.data.auctions || []);
      }
    } catch (err) {
      console.error("Failed to load auctions:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAuctionStatus = (auction) => {
    const now = new Date();
    const start = new Date(auction.auctionStart);
    const end = new Date(auction.auctionEnd);

    if (now < start) return { status: "upcoming", label: "Upcoming", color: "blue" };
    if (now > end) return { status: "ended", label: "Ended", color: "gray" };
    return { status: "active", label: "Active", color: "green" };
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const filteredAuctions = auctions.filter((a) => (a.status || "approved") === activeTab);

  const counts = auctions.reduce(
    (acc, a) => {
      const status = a.status || "approved";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { approved: 0, pending: 0, rejected: 0 }
  );

  const totalPages = Math.max(1, Math.ceil(filteredAuctions.length / pageSize));
  const clampedPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIdx = (clampedPage - 1) * pageSize;
  const displayedAuctions = filteredAuctions.slice(startIdx, startIdx + pageSize);

  const handlePageChange = (newPage) => {
    const pageNumber = Math.min(Math.max(1, Number(newPage)), totalPages);
    if (pageNumber === currentPage) return;

    setPageLoading(true);

    setTimeout(() => {
      setCurrentPage(pageNumber);
      setPageLoading(false);

      const container = document.querySelector(".max-w-7xl");
      if (container) container.scrollIntoView({ behavior: "smooth", block: "start" });
    }, Math.random() * (900 - 300 + 1) + 300);
  };

  /* -------------------- INITIAL SKELETON -------------------- */
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Antique Book Auctions</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  /* ---------------------------------------------------------- */

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Antique Book Auctions</h1>
            <p className="text-gray-600 mt-1">{auctions.length} total submissions</p>
          </div>
          <Link
            to="/publisher/sell-antique"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <i className="fas fa-plus" />
            Create New Auction
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 bg-white rounded-t-xl px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { key: "approved", label: `Approved (${counts.approved})`, icon: "fa-check" },
              { key: "pending", label: `Pending (${counts.pending})`, icon: "fa-clock" },
              { key: "rejected", label: `Rejected (${counts.rejected})`, icon: "fa-times" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-4 pt-4 font-medium flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <i className={`fas ${tab.icon}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {filteredAuctions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pageLoading
                ? /* ---------------- PAGE SKELETONS ---------------- */
                  [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
                : /* ---------------- REAL AUCTIONS ---------------- */
                  displayedAuctions.map((auction) => {
                    const auctionStatus = getAuctionStatus(auction);

                    return (
                      <div
                        key={auction._id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="flex gap-6 p-6">
                          {/* IMAGE */}
                          <div className="flex-shrink-0 relative">
                            <img
                              src={auction.image}
                              alt={auction.title}
                              className="w-40 h-56 object-cover rounded-lg"
                            />
                            <span
                              className={`absolute top-2 right-2 bg-${auctionStatus.color}-500 text-white text-xs font-semibold px-3 py-1 rounded-full`}
                            >
                              {auctionStatus.label}
                            </span>
                          </div>

                          {/* INFO */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900">{auction.title}</h3>
                            <p className="text-sm text-gray-600 mb-3">by {auction.author}</p>

                            {/* Status */}
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                auction.status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : auction.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {auction.status || "approved"}
                            </span>

                            {/* Details */}
                            <div className="space-y-2 mt-3">
                              <div className="flex items-center gap-2 text-sm">
                                <i className="fas fa-tag text-purple-600 w-4" />
                                <span className="text-gray-600">Genre:</span>
                                <span className="font-medium text-gray-900">{auction.genre}</span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <i className="fas fa-certificate text-purple-600 w-4" />
                                <span className="text-gray-600">Condition:</span>
                                <span className="font-medium text-gray-900 capitalize">
                                  {auction.condition}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <i className="fas fa-rupee-sign text-purple-600 w-4" />
                                <span className="text-gray-600">Base Price:</span>
                                <span className="font-bold text-purple-600 text-lg">
                                  ₹{auction.basePrice}
                                </span>
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="border-t border-gray-200 pt-3 mt-3 space-y-2 text-xs text-gray-600">
                              <div className="flex items-center gap-2">
                                <i className="fas fa-clock" />
                                Start: {formatDate(auction.auctionStart)}
                              </div>
                              <div className="flex items-center gap-2">
                                <i className="fas fa-flag-checkered" />
                                End: {formatDate(auction.auctionEnd)}
                              </div>
                            </div>

                            {/* Rejection reason */}
                            {auction.status === "rejected" && auction.rejectionReason && (
                              <button
                                onClick={() =>
                                  setRejectionDialog({
                                    open: true,
                                    reason: auction.rejectionReason,
                                  })
                                }
                                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg flex items-center gap-2"
                              >
                                <i className="fas fa-info-circle" />
                                View Reason
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={clampedPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="text-center py-16">
            <i className="fas fa-gavel text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No {activeTab} antique books
            </h3>
            <p className="text-gray-500 mb-6">
              Submit an antique book for verification to get started
            </p>
          </div>
        )}
      </div>

      {/* Rejection Dialog */}
      <AlertDialog
        open={rejectionDialog.open}
        onOpenChange={(open) => setRejectionDialog({ open, reason: rejectionDialog.reason })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <i className="fas fa-exclamation-circle text-red-600 mr-2" />
              Rejection Reason
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-gray-800 text-sm leading-relaxed">
                {rejectionDialog.reason}
              </p>
            </div>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectionDialog({ open: false, reason: "" })}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Auctions;
