import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllManagers, banManager, reinstateManager } from '../../../services/admin.services';
import { toast } from 'sonner';
import Pagination from '../../../components/ui/Pagination';
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

const Managers = ({ type = 'pending' }) => {
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showReinstateDialog, setShowReinstateDialog] = useState(false);
  const [showBannedReasonDialog, setShowBannedReasonDialog] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const ITEMS_PER_PAGE = 6; // 3 rows × 2 per row

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const data = await getAllManagers();
      setManagers(data);
    } catch (err) {
      console.error('Failed to load managers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, [type]);

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

  // Schema compatibility helpers
  const approvedAt = (m) => m?.moderation?.at;
  const bannedAt = (m) => m?.account?.at;
  const bannedReason = (m) => m?.account?.reason;

  const getFilteredManagers = () => {
    switch (type) {
      case 'pending':
        return managers.filter(m => m.moderation?.status === 'pending');
      case 'active':
        return managers.filter(m => m.moderation?.status === 'approved' && m.account?.status === 'active');
      case 'banned':
        return managers.filter(m => m.account?.status === 'banned');
      default:
        return managers;
    }
  };

  const filteredManagers = getFilteredManagers();

  // Reset to page 1 when type changes
  useEffect(() => {
    setCurrentPage(1);
  }, [type]);

  // Pagination logic
  const totalPages = Math.ceil(filteredManagers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedManagers = filteredManagers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setPageLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Random delay between 300-600ms to simulate API fetch
    const delay = Math.floor(Math.random() * 300) + 300;
    
    setTimeout(() => {
      setCurrentPage(page);
      setPageLoading(false);
    }, delay);
  };

  const handleBan = async () => {
    if (!banReason.trim() || !selectedManager) return;
    setActionLoading(true);
    try {
      await banManager(selectedManager._id, banReason);
      await fetchManagers();
      setShowBanDialog(false);
      setBanReason('');
      setSelectedManager(null);
      toast.success('Manager banned successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to ban manager');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReinstate = async () => {
    if (!selectedManager) return;
    setActionLoading(true);
    try {
      await reinstateManager(selectedManager._id);
      await fetchManagers();
      setShowReinstateDialog(false);
      setSelectedManager(null);
      toast.success('Manager reinstated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reinstate manager');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
          <p className="text-gray-600">Loading managers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredManagers.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-users text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No {type} managers found</p>
        </div>
      ) : (
        <>
          {/* Loading Overlay */}
          {pageLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
                <p className="text-gray-600">Loading page...</p>
              </div>
            </div>
          )}

          <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 ${pageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
            {paginatedManagers.map((manager) => {
                const isPending = manager.moderation?.status === 'pending';
                const isActive = manager.moderation?.status === 'approved' && manager.account?.status === 'active';
                const isBanned = manager.account?.status === 'banned';
                
                return (
                  <div key={manager._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <div className={`flex gap-6 p-6 h-full w-full ${isActive ? 'h-[320px]' : 'h-[340px]'}`}>
                      {/* Avatar block (like image) */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <div className="w-40 h-56 bg-purple-50 rounded-lg flex items-center justify-center">
                            <span className="text-4xl font-bold text-purple-600">
                              {manager.firstname?.charAt(0)}{manager.lastname?.charAt(0)}
                            </span>
                          </div>
                          {/* Status pill on avatar */}
                          <div className="absolute top-2 right-2">
                            <span className={`text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg ${
                              isActive ? 'bg-green-500' : isBanned ? 'bg-red-500' : 'bg-yellow-500'
                            }`}>
                              {isActive ? 'Active' : isBanned ? 'Banned' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">
                          {manager.firstname} {manager.lastname}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1 truncate flex items-center gap-2">
                          <i className="fas fa-envelope text-xs text-gray-400"></i>
                          {manager.email}
                        </p>

                        {/* Meta: status chip + time ago */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-green-100 text-green-700' : isBanned ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            <i className={`fas ${isActive ? 'fa-check' : isBanned ? 'fa-ban' : 'fa-clock'}`}></i>
                            {isActive ? 'Active' : isBanned ? 'Banned' : 'Pending'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <i className="far fa-clock"></i>
                            {isActive ? timeAgo(approvedAt(manager)) :
                             isBanned ? timeAgo(bannedAt(manager)) :
                             timeAgo(manager.createdAt)}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <i className="fas fa-user text-purple-600 w-4"></i>
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium text-gray-900 truncate">{manager.email}</span>
                          </div>
                          {manager.lastLogin && (
                            <div className="flex items-center gap-2 text-sm">
                              <i className="fas fa-clock text-purple-600 w-4"></i>
                              <span className="text-gray-600">Last login:</span>
                              <span className="font-medium text-gray-900">{timeAgo(manager.lastLogin)}</span>
                            </div>
                          )}
                        </div>

                        {/* Banned reason button similar to auction rejected */}
                        {isBanned && bannedReason(manager) && (
                          <button
                            onClick={() => {
                              setSelectedManager(manager);
                              setShowBannedReasonDialog(true);
                            }}
                            className="mt-1 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors w-auto self-start"
                          >
                            <i className="fas fa-info-circle"></i>
                            Banned Reason
                          </button>
                        )}

                        {/* Actions */}
                        <div className="mt-auto pt-4 flex items-center gap-3">
                          {isPending && (
                            <button
                              onClick={() => navigate(`/admin/managers/${manager._id}`)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium shadow-sm"
                            >
                              <i className="fas fa-eye"></i>
                              Get Overview
                            </button>
                          )}
                          {isActive && (
                            <button
                              onClick={() => {
                                setSelectedManager(manager);
                                setShowBanDialog(true);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-sm"
                            >
                              <i className="fas fa-ban"></i>
                              Ban
                            </button>
                          )}
                          {isBanned && (
                            <button
                              onClick={() => {
                                setSelectedManager(manager);
                                setShowReinstateDialog(true);
                              }}
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
                );
              })}
          </div>

          {/* Pagination */}
          {filteredManagers.length > ITEMS_PER_PAGE && !pageLoading && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Ban Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban Manager</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for banning this manager. They will not be able to access their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Enter ban reason (required)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 min-h-[100px]"
              disabled={actionLoading}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading} onClick={() => setBanReason('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBan}
              disabled={actionLoading || !banReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>Banning...
                </>
              ) : (
                'Ban Manager'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reinstate Dialog */}
      <AlertDialog open={showReinstateDialog} onOpenChange={setShowReinstateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reinstate Manager</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reinstate this manager? They will regain access to their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReinstate}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>Reinstating...
                </>
              ) : (
                'Reinstate'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Banned Reason Dialog */}
      <AlertDialog open={showBannedReasonDialog} onOpenChange={setShowBannedReasonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <i className="fas fa-ban text-red-600 mr-2"></i>
              Banned Reason
            </AlertDialogTitle>
            <AlertDialogDescription>
              This manager was banned for the following reason:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900">
            <p className="font-semibold mb-2">Reason:</p>
            <p>{selectedManager && bannedReason(selectedManager)}</p>
            {selectedManager && bannedAt(selectedManager) && (
              <p className="text-sm text-red-600 mt-3">
                <i className="far fa-calendar-alt mr-1"></i>
                Banned on {new Date(bannedAt(selectedManager)).toLocaleDateString()}
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Managers;
