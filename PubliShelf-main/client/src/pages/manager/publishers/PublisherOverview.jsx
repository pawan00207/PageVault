// client/src/pages/manager/publishers/PublisherOverview.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublisherById, approvePublisher, rejectPublisher } from "../../../services/manager.services";
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

const PublisherOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [publisher, setPublisher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Schema compatibility helpers
  const isVerified = (p) => p?.moderation?.status === 'approved' || p?.isVerified === true;
  const isBanned = (p) => p?.account?.status === 'banned' || p?.banned === true;
  const approvedAt = (p) => p?.moderation?.at || p?.verifiedAt;
  const bannedAt = (p) => p?.account?.at || p?.bannedAt;
  const banReason = (p) => p?.account?.reason || p?.banReason;
  const lastRejectionReason = (p) => (p?.moderation?.status === 'rejected' ? p?.moderation?.reason : null) || p?.rejectionReason;

  const loadDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getPublisherById(id);
      if (res.success) {
        setPublisher(res.data);
      } else {
        setError(res.message || "Failed to load publisher details");
      }
    } catch (e) {
      console.error("Error loading publisher details:", e);
      setError("Unexpected error fetching details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await approvePublisher(id);
      if (res.success) {
        setShowApproveDialog(false);
        navigate('/manager/publishers/active', { state: { message: 'Publisher approved successfully' } });
      } else {
        setError(res.message || 'Failed to approve publisher');
      }
    } catch (e) {
      console.error('Approve error:', e);
      setError('Unexpected error approving publisher');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await rejectPublisher(id, rejectReason);
      if (res.success) {
        setShowRejectDialog(false);
        navigate('/manager/publishers/pending', { state: { message: 'Publisher rejected successfully' } });
      } else {
        setError(res.message || 'Failed to reject publisher');
      }
    } catch (e) {
      console.error('Reject error:', e);
      setError('Unexpected error rejecting publisher');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden skeleton-shimmer animate-fade-in">
            <div className="p-8 space-y-6">
              {/* Header skeleton */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-8 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-1/3"></div>
                </div>
              </div>
              {/* Info skeleton */}
              <div className="space-y-4 pt-6">
                <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-4/5"></div>
              </div>
              {/* Stats skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg"></div>
                ))}
              </div>
              {/* Actions skeleton */}
              <div className="flex gap-3 pt-6">
                <div className="h-10 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg flex-1"></div>
                <div className="h-10 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg flex-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!publisher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-4xl text-red-600 mb-4"></i>
          <p className="text-gray-700 font-medium">Publisher not found.</p>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <button
            onClick={() => navigate('/manager/publishers/pending')}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
          >
            <i className="fas fa-arrow-left"></i>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back + Status */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate('/manager/publishers/pending')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Back to Publishers</span>
            </button>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                isBanned(publisher) ? 'bg-red-100 text-red-800' : isVerified(publisher) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isBanned(publisher) ? 'Banned' : isVerified(publisher) ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              <i className="fas fa-exclamation-triangle mr-2"></i>{error}
            </div>
          )}

          {/* Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 flex items-center gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center text-white text-3xl font-bold">
                {publisher.firstname?.charAt(0)}{publisher.lastname?.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {publisher.firstname} {publisher.lastname}
                </h1>
                <p className="text-purple-100">{publisher.email}</p>
                <p className="text-white/90 font-medium flex items-center gap-2 mt-1">
                  <i className="fas fa-building"></i>{publisher.publishingHouse}
                </p>
                {lastRejectionReason(publisher) && !isVerified(publisher) && (
                  <p className="text-xs text-red-200 mt-2">Last rejection: {lastRejectionReason(publisher)}</p>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Business Details */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <i className="fas fa-id-card text-purple-600"></i>
                      Business Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <label className="text-gray-600">Publishing House</label>
                        <p className="text-gray-900 font-medium mt-1">{publisher.publishingHouse || '—'}</p>
                      </div>
                      <div>
                        <label className="text-gray-600">Email</label>
                        <p className="text-gray-900 mt-1 break-all">{publisher.email}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-gray-600">Verified</label>
                          <p className="mt-1 font-medium flex items-center gap-2">
                            {isVerified(publisher) ? <><i className="fas fa-check-circle text-green-600"></i>Yes</> : <><i className="fas fa-clock text-yellow-600"></i>No</>}
                          </p>
                        </div>
                        <div>
                          <label className="text-gray-600">Banned</label>
                          <p className="mt-1 font-medium flex items-center gap-2">
                              {isBanned(publisher) ? <><i className="fas fa-ban text-red-600"></i>Yes</> : <><i className="fas fa-check text-green-600"></i>No</>}
                          </p>
                        </div>
                      </div>
                        {approvedAt(publisher) && (
                        <div>
                          <label className="text-gray-600">Verified At</label>
                            <p className="text-gray-900 mt-1 text-sm">{new Date(approvedAt(publisher)).toLocaleString()}</p>
                        </div>
                      )}
                        {bannedAt(publisher) && (
                        <div>
                          <label className="text-gray-600">Banned At</label>
                            <p className="text-gray-900 mt-1 text-sm">{new Date(bannedAt(publisher)).toLocaleString()}</p>
                        </div>
                      )}
                        {banReason(publisher) && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                            <span className="font-semibold">Ban Reason:</span> {banReason(publisher)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Books */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <i className="fas fa-book text-purple-600"></i>
                      Books ({publisher.books?.length || 0})
                    </h3>
                    <div className="space-y-2 max-h-72 overflow-y-auto custom-scroll">
                      {(publisher.books || []).map(book => (
                        <div key={book._id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 hover:border-purple-300 transition-colors">
                          <div>
                            <p className="font-medium text-gray-900 text-sm truncate max-w-[220px]">{book.title}</p>
                            <p className="text-xs text-gray-600">{book.author}</p>
                          </div>
                          <span className="text-xs text-gray-500">₹{book.price}</span>
                        </div>
                      ))}
                      {(publisher.books || []).length === 0 && (
                        <p className="text-gray-500 text-sm">No books listed.</p>
                      )}
                    </div>
                  </div>
                  {!isVerified(publisher) && !isBanned(publisher) && (
                    <div className="flex justify-end gap-4 pt-2">
                      <button
                        onClick={() => setShowRejectDialog(true)}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
                      >
                        <i className="fas fa-times-circle"></i>
                        Reject
                      </button>
                      <button
                        onClick={() => setShowApproveDialog(true)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
                      >
                        <i className="fas fa-check-circle"></i>
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approve Dialog */}
        <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve Publisher</AlertDialogTitle>
              <AlertDialogDescription>
                This will verify the publisher and allow them to log in and use the platform.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionLoading ? (<><i className="fas fa-spinner fa-spin mr-2"></i>Approving...</>) : 'Approve'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reject Dialog */}
        <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Publisher</AlertDialogTitle>
              <AlertDialogDescription>
                Provide a clear reason. The publisher will need to reapply or correct their details.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason (required)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 min-h-[100px]"
                disabled={actionLoading}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? (<><i className="fas fa-spinner fa-spin mr-2"></i>Rejecting...</>) : 'Reject'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
};

export default PublisherOverview;
