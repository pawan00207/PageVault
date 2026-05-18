import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getManagerById, 
  approveManager, 
  rejectManager, 
  banManager, 
  reinstateManager 
} from '../../../services/admin.services';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/AlertDialog';

const ManagerOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showReinstateDialog, setShowReinstateDialog] = useState(false);
  
  const [reason, setReason] = useState('');

  const fetchManager = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getManagerById(id);
      setManager(data);
    } catch (err) {
      setError('Failed to load manager details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchManager();
  }, [fetchManager]);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await approveManager(id);
      await fetchManager();
      setShowApproveDialog(false);
      toast.success('Manager approved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve manager');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      setActionLoading(true);
      await rejectManager(id, reason);
      await fetchManager();
      setShowRejectDialog(false);
      setReason('');
      toast.success('Manager rejected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject manager');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBan = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for banning');
      return;
    }
    try {
      setActionLoading(true);
      await banManager(id, reason);
      await fetchManager();
      setShowBanDialog(false);
      setReason('');
      toast.success('Manager banned successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to ban manager');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReinstate = async () => {
    try {
      setActionLoading(true);
      await reinstateManager(id);
      await fetchManager();
      setShowReinstateDialog(false);
      toast.success('Manager reinstated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reinstate manager');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
          <p className="text-gray-600">Loading manager...</p>
        </div>
      </div>
    );
  }

  if (!manager) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-4xl text-red-600 mb-4"></i>
          <p className="text-gray-700 font-medium">Manager not found.</p>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <button
            onClick={() => navigate('/admin/managers')}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
          >
            <i className="fas fa-arrow-left"></i>
            Back
          </button>
        </div>
      </div>
    );
  }

  const isPending = manager.moderation?.status === 'pending';
  const isActive = manager.moderation?.status === 'approved' && manager.account?.status === 'active';
  const isBanned = manager.account?.status === 'banned';
  const lastRejectionReason = (m) => (m?.moderation?.status === 'rejected' ? m?.moderation?.reason : null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back + Status */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/managers')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back to Managers</span>
          </button>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isBanned ? 'bg-red-100 text-red-800' : isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isBanned ? 'Banned' : isActive ? 'Active' : 'Pending'}
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
              {manager.firstname?.charAt(0)}{manager.lastname?.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                {manager.firstname} {manager.lastname}
              </h1>
              <p className="text-purple-100">{manager.email}</p>
              {lastRejectionReason(manager) && !isActive && (
                <p className="text-xs text-red-200 mt-2">Last rejection: {lastRejectionReason(manager)}</p>
              )}
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Account Details */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="fas fa-id-card text-purple-600"></i>
                    Account Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <label className="text-gray-600">Email</label>
                      <p className="text-gray-900 mt-1 break-all">{manager.email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-600">Approved</label>
                        <p className="mt-1 font-medium flex items-center gap-2">
                          {isActive ? <><i className="fas fa-check-circle text-green-600"></i>Yes</> : <><i className="fas fa-clock text-yellow-600"></i>No</>}
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-600">Banned</label>
                        <p className="mt-1 font-medium flex items-center gap-2">
                          {isBanned ? <><i className="fas fa-ban text-red-600"></i>Yes</> : <><i className="fas fa-check text-green-600"></i>No</>}
                        </p>
                      </div>
                    </div>
                    {manager.moderation?.at && (
                      <div>
                        <label className="text-gray-600">Approved At</label>
                        <p className="text-gray-900 mt-1 text-sm">{new Date(manager.moderation.at).toLocaleString()}</p>
                      </div>
                    )}
                    {manager.account?.at && (
                      <div>
                        <label className="text-gray-600">Banned At</label>
                        <p className="text-gray-900 mt-1 text-sm">{new Date(manager.account.at).toLocaleString()}</p>
                      </div>
                    )}
                    {manager.account?.reason && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                        <span className="font-semibold">Ban Reason:</span> {manager.account.reason}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity & Actions */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="fas fa-user-clock text-purple-600"></i>
                    Activity
                  </h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scroll">
                    <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Joined</p>
                        <p className="text-xs text-gray-600">{new Date(manager.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {manager.lastLogin && (
                      <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Last Login</p>
                          <p className="text-xs text-gray-600">{new Date(manager.lastLogin).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {isPending && (
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
            <AlertDialogTitle>Approve Manager</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve <strong>{manager.fullName || `${manager.firstname} ${manager.lastname}`}</strong>? They will be able to access their account and publish books.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={actionLoading} className="bg-green-600 hover:bg-green-700">
              {actionLoading ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Manager</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting <strong>{manager.fullName || `${manager.firstname} ${manager.lastname}`}</strong>:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 mt-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows="4"
            placeholder="Enter rejection reason..."
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReason('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} disabled={actionLoading} className="bg-red-600 hover:bg-red-700">
              {actionLoading ? 'Rejecting...' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban Manager</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for banning <strong>{manager.fullName || `${manager.firstname} ${manager.lastname}`}</strong>:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 mt-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows="4"
            placeholder="Enter ban reason..."
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReason('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBan} disabled={actionLoading} className="bg-red-600 hover:bg-red-700">
              {actionLoading ? 'Banning...' : 'Ban'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showReinstateDialog} onOpenChange={setShowReinstateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reinstate Manager</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reinstate <strong>{manager.fullName || `${manager.firstname} ${manager.lastname}`}</strong>? They will regain access to their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReinstate} disabled={actionLoading} className="bg-green-600 hover:bg-green-700">
              {actionLoading ? 'Reinstating...' : 'Reinstate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManagerOverview;
