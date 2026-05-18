// client/src/pages/manager/publishers/Publishers.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPendingPublishers, getActivePublishers, getBannedPublishers, approvePublisher, banPublisher, reinstatePublisher } from "../../../services/manager.services";
import Pagination from "../../../components/ui/Pagination";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "../../../components/ui/AlertDialog";

const Publishers = ({ type = 'pending' }) => {
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedPublisher, setSelectedPublisher] = useState(null);
  const [actionType, setActionType] = useState("");
  const [actionReason, setActionReason] = useState("");
  const [banReasonDialog, setBanReasonDialog] = useState({ open: false, reason: "" });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const ITEMS_PER_PAGE = 6; // 3 rows × 2 cols

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

  // Schema compatibility helpers (new moderation/account vs legacy flags)
  const approvedAt = (p) => p?.moderation?.at || p?.verifiedAt || p?.updatedAt || p?.createdAt;
  const bannedAt = (p) => p?.account?.at || p?.bannedAt || p?.updatedAt || p?.createdAt;
  const bannedReason = (p) => p?.account?.reason || p?.banReason;

  const loadPublishers = async () => {
    setLoading(true);
    try {
      let response;
      if (type === 'pending') {
        response = await getPendingPublishers();
      } else if (type === 'active') {
        response = await getActivePublishers();
      } else if (type === 'banned') {
        response = await getBannedPublishers();
      }

      if (response.success) {
        setPublishers(response.data || []);
      }
    } catch (error) {
      console.error("Error loading publishers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublishers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // Reset page when type changes
  useEffect(() => {
    setCurrentPage(1);
  }, [type]);

  // Pagination logic
  const totalPages = Math.ceil(publishers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPublishers = publishers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setPageLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const delay = Math.floor(Math.random() * 800) + 200; // 300-600ms delay
    setTimeout(() => {
      setCurrentPage(page);
      setPageLoading(false);
    }, delay);
  };

  const handleAction = (publisher, action) => {
    setSelectedPublisher(publisher);
    setActionType(action);
    setShowActionModal(true);
    setActionReason("");
  };

  const confirmAction = async () => {
    if (!selectedPublisher) return;

    try {
      let response;
      if (actionType === 'approve') {
        response = await approvePublisher(selectedPublisher._id);
      } else if (actionType === 'ban') {
        response = await banPublisher(selectedPublisher._id, actionReason);
      } else if (actionType === 'reinstate') {
        response = await reinstatePublisher(selectedPublisher._id);
      }

      if (response.success) {
        setShowActionModal(false);
        loadPublishers();
      }
    } catch (error) {
      console.error("Error performing action:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[340px] skeleton-shimmer animate-fade-in">
              <div className="flex gap-6 p-6 h-full">
                {/* Avatar skeleton */}
                <div className="flex-shrink-0">
                  <div className="w-40 h-56 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg"></div>
                </div>
                {/* Content skeleton */}
                <div className="flex-1 min-w-0 flex flex-col space-y-3">
                  <div className="h-6 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-full"></div>
                  <div className="flex items-center gap-3">
                    <div className="h-5 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-full w-20"></div>
                    <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-16"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="mt-auto flex gap-2 pt-2">
                    <div className="h-9 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg flex-1"></div>
                    <div className="h-9 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg flex-1"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {publishers.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-users text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No {type} publishers found</p>
        </div>
      ) : (
        <>
          {/* Skeleton Loading State for Pagination */}
          {pageLoading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[340px] skeleton-shimmer animate-fade-in">
                  <div className="flex gap-6 p-6 h-full">
                    <div className="flex-shrink-0">
                      <div className="w-40 h-56 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg"></div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col space-y-3">
                      <div className="h-6 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-full"></div>
                      <div className="flex items-center gap-3">
                        <div className="h-5 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-full w-20"></div>
                        <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-16"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="mt-auto flex gap-2 pt-2">
                        <div className="h-9 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg flex-1"></div>
                        <div className="h-9 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg flex-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {paginatedPublishers.map((publisher) => (
            <div key={publisher._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow h-full">
              <div className={`flex gap-6 p-6 h-full w-full ${type === 'active' ? 'h-[320px]' : 'h-[340px]'}`}>
                {/* Avatar block (like image) */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-40 h-56 bg-purple-50 rounded-lg flex items-center justify-center">
                      <span className="text-4xl font-bold text-purple-600">
                        {publisher.firstname?.charAt(0)}{publisher.lastname?.charAt(0)}
                      </span>
                    </div>
                    {/* Status pill on avatar */}
                    <div className="absolute top-2 right-2">
                      <span className={`text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg ${
                        type === 'active' ? 'bg-green-500' : type === 'banned' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}>
                        {type === 'active' ? 'Verified' : type === 'banned' ? 'Banned' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">
                    {publisher.firstname} {publisher.lastname}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1 truncate flex items-center gap-2">
                    <i className="fas fa-envelope text-xs text-gray-400"></i>
                    {publisher.email}
                  </p>

                  {/* Meta: status chip + time ago */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                      type === 'active' ? 'bg-green-100 text-green-700' : type === 'banned' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      <i className={`fas ${type === 'active' ? 'fa-check' : type === 'banned' ? 'fa-ban' : 'fa-clock'}`}></i>
                      {type === 'active' ? 'Verified' : type === 'banned' ? 'Banned' : 'Pending'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <i className="far fa-clock"></i>
                      {type === 'active' ? timeAgo(approvedAt(publisher)) :
                       type === 'banned' ? timeAgo(bannedAt(publisher)) :
                       timeAgo(publisher.createdAt)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    {publisher.publishingHouse && (
                      <div className="flex items-center gap-2 text-sm">
                        <i className="fas fa-building text-purple-600 w-4"></i>
                        <span className="text-gray-600">Publishing House:</span>
                        <span className="font-medium text-gray-900 truncate">{publisher.publishingHouse}</span>
                      </div>
                    )}
                    {type !== 'pending' && (
                      <div className="flex items-center gap-2 text-sm">
                        <i className="fas fa-book text-purple-600 w-4"></i>
                        <span className="text-gray-600">Books:</span>
                        <span className="font-medium text-gray-900">{publisher.books?.length || 0}</span>
                      </div>
                    )}
                  </div>

                  {/* Banned reason button similar to auction rejected */}
                  {type === 'banned' && bannedReason(publisher) && (
                    <button
                      onClick={() => setBanReasonDialog({ open: true, reason: bannedReason(publisher) })}
                      className="mt-1 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors w-auto self-start"
                    >
                      <i className="fas fa-info-circle"></i>
                      Banned Reason
                    </button>
                  )}

                  {/* Actions */}
                  <div className="mt-auto pt-4 flex items-center gap-3">
                    {type === 'pending' && (
                      <Link
                        to={`/manager/publishers/${publisher._id}/overview`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium shadow-sm"
                      >
                        <i className="fas fa-eye"></i>
                        Get Overview
                      </Link>
                    )}
                    {type === 'active' && (
                      <button
                        onClick={() => handleAction(publisher, 'ban')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-sm"
                      >
                        <i className="fas fa-ban"></i>
                        Ban
                      </button>
                    )}
                    {type === 'banned' && (
                      <button
                        onClick={() => handleAction(publisher, 'reinstate')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium shadow-sm"
                      >
                        <i className="fas fa-undo"></i>
                        Reinstate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {publishers.length > ITEMS_PER_PAGE && !pageLoading && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {actionType === 'approve' ? 'Approve Publisher' :
                 actionType === 'ban' ? 'Ban Publisher' :
                 'Reinstate Publisher'}
              </h3>
              <p className="text-gray-600 mb-4">
                Publisher: <span className="font-semibold">
                  {selectedPublisher?.firstname} {selectedPublisher?.lastname}
                </span>
              </p>
              
              {actionType === 'ban' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ban Reason</label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="Enter reason for ban..."
                  ></textarea>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                    actionType === 'ban' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banned Reason Dialog */}
      <AlertDialog open={banReasonDialog.open} onOpenChange={(open) => setBanReasonDialog({ open, reason: banReasonDialog.reason })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <i className="fas fa-ban text-red-600 mr-2"></i>
              Banned Reason
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-gray-800 text-sm leading-relaxed">{banReasonDialog.reason}</p>
            </div>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBanReasonDialog({ open: false, reason: "" })}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Publishers;
