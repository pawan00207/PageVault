// client/src/pages/manager/auctions/Auctions.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingAuctions, getApprovedAuctions, getRejectedAuctions } from "../../../services/manager.services";
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

const Auctions = ({ type = 'pending' }) => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionDialog, setRejectionDialog] = useState({ open: false, reason: '' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const ITEMS_PER_PAGE = 6; // 3 rows × 2 cols

  const loadAuctions = async () => {
    setLoading(true);
    try {
      let response;
      if (type === 'pending') {
        response = await getPendingAuctions();
      } else if (type === 'approved') {
        response = await getApprovedAuctions();
      } else if (type === 'rejected') {
        response = await getRejectedAuctions();
      }

      if (response.success) {
        setAuctions(response.data || []);
      }
    } catch (error) {
      console.error("Error loading auctions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuctions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [type]);

  // Pagination logic
  const totalPages = Math.ceil(auctions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAuctions = auctions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setPageLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const delay = Math.floor(Math.random() * 800) + 200; // 300-600ms delay
    setTimeout(() => {
      setCurrentPage(page);
      setPageLoading(false);
    }, delay);
  };

  const norm = (a) => ({
    id: a._id,
    image: a.image || a.itemImage,
    title: a.title || a.itemName,
    author: a.author,
    genre: a.genre || a.category,
    condition: a.condition,
    basePrice: a.basePrice || a.startingBid,
    description: a.description,
    auctionStart: a.auctionStart,
    auctionEnd: a.auctionEnd,
    publisher: a.publisher,
    status: a.status || type,
    rejectionReason: a.rejectionReason,
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[380px] skeleton-shimmer animate-fade-in">
              <div className="flex gap-6 p-6 h-full">
                {/* Image skeleton */}
                <div className="flex-shrink-0">
                  <div className="w-40 h-56 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg"></div>
                </div>
                {/* Content skeleton */}
                <div className="flex-1 min-w-0 flex flex-col space-y-3">
                  <div className="h-6 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-1/2"></div>
                  <div className="flex items-center gap-3">
                    <div className="h-5 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-full w-20"></div>
                    <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-16"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-5/6"></div>
                    <div className="h-6 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="h-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-2/3"></div>
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
      {auctions.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-gavel text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No {type} auctions found</p>
        </div>
      ) : (
        <>
          {/* Skeleton Loading State */}
          {pageLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[380px] skeleton-shimmer animate-fade-in">
                  <div className="flex gap-6 p-6 h-full">
                    <div className="flex-shrink-0">
                      <div className="w-40 h-56 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg"></div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col space-y-3">
                      <div className="h-6 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-1/2"></div>
                      <div className="flex items-center gap-3">
                        <div className="h-5 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-full w-20"></div>
                        <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-16"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-5/6"></div>
                        <div className="h-6 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="h-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-2/3"></div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paginatedAuctions.map((raw) => {
            const auction = norm(raw);
            return (
              <div
                key={auction.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow h-full"
              >
                <div className="flex gap-6 p-6 h-full">
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
                          auction.status === 'approved' ? 'bg-green-500' : 
                          auction.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                          {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{auction.title}</h3>
                    {auction.author && <p className="text-sm text-gray-600 mb-3">by {auction.author}</p>}
                    
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

                    {/* Rejection reason button for rejected */}
                    {auction.status === 'rejected' && auction.rejectionReason && (
                      <button
                        onClick={() => setRejectionDialog({ open: true, reason: auction.rejectionReason })}
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors w-auto self-start"
                      >
                        <i className="fas fa-info-circle"></i>
                        View Reason
                      </button>
                    )}

                    {/* Actions for pending */}
                    {type === 'pending' && (
                      <div className="mt-auto pt-4">
                        <button
                          onClick={() => navigate(`/manager/auctions/${auction.id}/overview`)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2.5 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-eye"></i>
                          View Overview
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
            })}
            </div>
          )}

          {/* Pagination */}
          {auctions.length > ITEMS_PER_PAGE && !pageLoading && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
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

export default Auctions;
