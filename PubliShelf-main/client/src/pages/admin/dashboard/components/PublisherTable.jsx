//client/src/pages/admin/dashboard/components/PublisherTable.jsx
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import { togglePublisherBan, approvePublisher, rejectPublisher } from "../../../../services/admin.services.js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/AlertDialog";

const PublisherTable = ({ publishers, onUpdate }) => {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [selectedPublisher, setSelectedPublisher] = useState(null);

  const handleBan = (publisher) => {
    setSelectedPublisher(publisher);
    setShowBanDialog(true);
  };

  const confirmBan = async () => {
    if (!selectedPublisher) return;

    try {
      setShowBanDialog(false);
      const response = await togglePublisherBan(selectedPublisher._id);
      if (response.success) {
        toast.success(response.message || "Publisher status updated successfully.");
        onUpdate(); // Refresh data
      } else {
        toast.error(response.message || "Failed to update publisher status.");
      }
    } catch (error) {
      console.error("Error updating publisher status:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setSelectedPublisher(null);
    }
  };

  const openApproveModal = (publisher) => {
    setSelectedPublisher(publisher);
    setShowApproveModal(true);
  };

  const openRejectModal = (publisher) => {
    setSelectedPublisher(publisher);
    setShowRejectModal(true);
  };

  const handleApprove = async () => {
    try {
      const response = await approvePublisher(selectedPublisher._id);
      if (response.success) {
        toast.success("Publisher approved successfully.");
        setShowApproveModal(false);
        onUpdate();
      } else {
        toast.error(response.message || "Failed to approve publisher.");
      }
    } catch (error) {
      console.error("Error approving publisher:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleReject = async () => {
    try {
      const response = await rejectPublisher(selectedPublisher._id);
      if (response.success) {
        toast.success("Publisher rejected successfully.");
        setShowRejectModal(false);
        onUpdate();
      } else {
        toast.error(response.message || "Failed to reject publisher.");
      }
    } catch (error) {
      console.error("Error rejecting publisher:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  if (publishers.length === 0) {
    return <p className="text-gray-600 text-sm">No publishers pending approval.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publishing House</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {publishers.map((publisher) => (
            <tr key={publisher._id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {publisher.firstname} {publisher.lastname}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {publisher.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {publisher.publishingHouse}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex gap-2">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Approved
                  </span>
                  {publisher.banned && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Banned
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openApproveModal(publisher)}
                    className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(publisher)}
                    className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleBan(publisher)}
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      publisher.banned
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-300 text-red-800 hover:bg-red-400"
                    }`}
                  >
                    {publisher.banned ? "Unban" : "Ban"} {publisher.publishingHouse}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Approve Publisher</h3>
              <button onClick={() => setShowApproveModal(false)} className="text-gray-600 hover:text-gray-900">
                <FaTimes />
              </button>
            </div>
            <p className="text-gray-600">
              Are you sure you want to approve <strong>{selectedPublisher?.publishingHouse}</strong>?
            </p>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Reject Publisher</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-gray-600 hover:text-gray-900">
                <FaTimes />
              </button>
            </div>
            <p className="text-gray-600">
              Are you sure you want to reject <strong>{selectedPublisher?.publishingHouse}</strong>?
            </p>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban/Unban Confirmation Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedPublisher?.banned ? "Unban Publisher" : "Ban Publisher"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedPublisher?.banned ? (
                <>
                  Are you sure you want to unban <strong>{selectedPublisher?.publishingHouse}</strong>? This will allow them to access the platform again.
                </>
              ) : (
                <>
                  Are you sure you want to ban <strong>{selectedPublisher?.publishingHouse}</strong>? This action will prevent them from accessing the platform.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBan}
              className={selectedPublisher?.banned ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {selectedPublisher?.banned ? "Unban Publisher" : "Ban Publisher"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PublisherTable;