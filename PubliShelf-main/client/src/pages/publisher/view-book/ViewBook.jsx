//client/src/pages/publisher/view-book/ViewBook.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { getBook, softDeleteBook, restoreBook } from "../../../services/publisher.services.js";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../components/ui/AlertDialog";

/**
 * Skeleton components used during initial fetch (or page changes).
 * They mirror the structure & spacing of the real UI but use
 * gradient blocks + .skeleton-shimmer animation (defined in index.css).
 */

const SkeletonBreadcrumbTitle = () => (
  <span className="inline-block h-5 w-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
);

const SkeletonImage = () => (
  <div className="w-full max-w-[500px] h-[600px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center mx-auto skeleton-shimmer">
    <div className="w-3/4 h-5/6 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
  </div>
);

const SkeletonInfo = () => (
  <div className="space-y-6">
    <div className="h-8 w-3/4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
    <div className="h-5 w-40 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
    <div className="flex items-center gap-4">
      <div className="h-6 w-40 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
    </div>
    <div className="flex items-center gap-4">
      <div className="h-10 w-32 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
      <div className="h-10 w-32 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
    </div>
  </div>
);

const SkeletonDetails = () => (
  <div className="border-t border-gray-300 pt-6">
    <div className="h-5 w-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded mb-4 skeleton-shimmer" />
    <div className="space-y-3">
      <div className="flex">
        <div className="w-1/3">
          <div className="h-4 w-28 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
        </div>
        <div className="w-2/3">
          <div className="h-4 w-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
        </div>
      </div>
      <div className="flex">
        <div className="w-1/3">
          <div className="h-4 w-28 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
        </div>
        <div className="w-2/3">
          <div className="h-4 w-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
        </div>
      </div>
      <div className="flex">
        <div className="w-1/3">
          <div className="h-4 w-28 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
        </div>
        <div className="w-2/3">
          <div className="h-4 w-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
        </div>
      </div>
    </div>
  </div>
);

const SkeletonReview = () => (
  <div className="border-b border-gray-300 pb-4 last:border-b-0">
    <div className="flex items-center gap-2 mb-2">
      <div className="flex">
        <div className="h-4 w-28 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded mr-3 skeleton-shimmer" />
      </div>
      <div className="h-4 w-36 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
      <div className="h-3 w-20 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded ml-4 skeleton-shimmer" />
    </div>
    <div className="h-4 w-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
  </div>
);

const PublisherViewBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true); // initial fetch loading
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  useEffect(() => {
    fetchBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await getBook(id);
      if (response.success) setBook(response.data);
      else setError(response.message || "Failed to fetch book details");
    } catch (err) {
      setError("Failed to fetch book details");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/publisher/edit-book/${id}`, { state: { book } });
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      setShowDeleteDialog(false);
      await softDeleteBook(id);
      setBook((prev) => prev ? { ...prev, isDeleted: true } : prev);
      toast.success("Book deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete book");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = () => {
    setShowRestoreDialog(true);
  };

  const confirmRestore = async () => {
    try {
      setActionLoading(true);
      setShowRestoreDialog(false);
      await restoreBook(id);
      setBook((prev) => prev ? { ...prev, isDeleted: false } : prev);
      toast.success("Book restored successfully!");
    } catch (err) {
      console.error("Restore error:", err);
      toast.error("Failed to restore book");
    } finally {
      setActionLoading(false);
    }
  };

  // If an error occurred and we're not loading, show error
  if (!loading && error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  // If not loading and no book found
  if (!loading && !book) {
    return <div className="min-h-screen flex items-center justify-center">Book not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-12 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/publisher/dashboard" className="text-gray-700 hover:text-purple-600">
                  <i className="fas fa-home mr-2"></i>
                  Dashboard
                </Link>
              </li>
              <li className="inline-flex items-center">
                <Link to="/publisher/active-books" className="text-gray-700 hover:text-purple-600">
                  <i className="fas fa-chevron-right text-gray-400 mr-2"></i>
                  Active Books
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <i className="fas fa-chevron-right text-gray-400 mr-2"></i>
                  {loading ? (
                    <SkeletonBreadcrumbTitle />
                  ) : (
                    <span className="text-gray-500">{book.title}</span>
                  )}
                </div>
              </li>
            </ol>
          </nav>

          {/* Deleted Badge */}
          {(!loading && book?.isDeleted) && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                <p className="font-medium">
                  This book is currently deleted and not visible to buyers.
                </p>
              </div>
            </div>
          )}

          {/* Product Details */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Image */}
              <div className="space-y-4">
                {loading ? (
                  <SkeletonImage />
                ) : (
                  <div className="w-full max-w-[500px] h-[600px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center mx-auto">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="max-w-full min-h-[90%] max-h-[98%] object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-6">
                {loading ? (
                  <SkeletonInfo />
                ) : (
                  <>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                      <p className="text-xl text-gray-600 mb-4">by {book.author}</p>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`fas fa-star ${i < Math.floor(book.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
                            ></i>
                          ))}
                          <span className="ml-2 text-gray-600">
                            {book.rating?.toFixed(1) || "0.0"} ({book.reviews?.length || 0} reviews)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-6">
                        <span className="text-3xl font-bold text-purple-600">₹{book.price}</span>
                        {book.quantity === 0 ? (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-sm font-semibold px-3 py-1.5 rounded-md border border-red-200">
                            <i className="fas fa-times-circle"></i>
                            Out of Stock
                          </span>
                        ) : book.quantity <= 5 ? (
                          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-sm font-semibold px-3 py-1.5 rounded-md border border-orange-200">
                            <i className="fas fa-exclamation-circle"></i>
                            Low Stock: {book.quantity} left
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-sm font-semibold px-3 py-1.5 rounded-md border border-green-200">
                            <i className="fas fa-check-circle"></i>
                            In Stock: {book.quantity} units
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={handleEdit}
                        className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                        disabled={actionLoading || loading}
                      >
                        <i className="fas fa-edit"></i>
                        Edit Book
                      </button>

                      {book.isDeleted ? (
                        <button
                          onClick={handleRestore}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                          disabled={actionLoading || loading}
                        >
                          <i className="fas fa-undo"></i>
                          Restore Book
                        </button>
                      ) : (
                        <button
                          onClick={handleDelete}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                          disabled={actionLoading || loading}
                        >
                          <i className="fas fa-trash"></i>
                          Delete Book
                        </button>
                      )}
                    </div>

                    {/* Product Details */}
                    {loading ? (
                      <SkeletonDetails />
                    ) : (
                      <div className="border-t border-gray-300 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Details</h3>
                        <dl className="space-y-3">
                          <div className="flex">
                            <dt className="w-1/3 text-gray-600">Genre:</dt>
                            <dd className="w-2/3 text-gray-900 font-medium">{book.genre}</dd>
                          </div>
                          <div className="flex">
                            <dt className="w-1/3 text-gray-600">Condition:</dt>
                            <dd className="w-2/3 text-gray-900 font-medium">{book.condition || 'New'}</dd>
                          </div>
                          <div className="flex">
                            <dt className="w-1/3 text-gray-600">Available Quantity:</dt>
                            <dd className="w-2/3 text-gray-900 font-medium">{book.quantity} units</dd>
                          </div>
                          <div className="flex">
                            <dt className="w-1/3 text-gray-600">Published:</dt>
                            <dd className="w-2/3 text-gray-900 font-medium">
                              {new Date(book.publishedAt).toLocaleDateString()}
                            </dd>
                          </div>
                          <div className="flex">
                            <dt className="w-1/3 text-gray-600">Status:</dt>
                            <dd className="w-2/3">
                              {book.isDeleted ? (
                                <span className="text-red-600 font-semibold">Deleted</span>
                              ) : (
                                <span className="text-green-600 font-semibold">Active</span>
                              )}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    )}

                    {/* Description */}
                    <div className="border-t border-gray-300 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                      {loading ? (
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
                          <div className="h-4 w-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
                          <div className="h-4 w-3/4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer" />
                        </div>
                      ) : (
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                          {book.description || "No description available."}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            {!loading && book.reviews && book.reviews.length > 0 && (
              <div className="border-t border-gray-300 px-8 py-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
                <div className="space-y-4">
                  {book.reviews.map((review, idx) => (
                    <div key={idx} className="border-b border-gray-300 pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`fas fa-star text-sm ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                            ></i>
                          ))}
                        </div>
                        <span className="font-medium text-gray-900">
                          {review.buyer?.firstname} {review.buyer?.lastname}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* If loading, render skeleton reviews section to keep layout stable */}
            {loading && (
              <div className="border-t border-gray-300 px-8 py-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
                <div className="space-y-4">
                  <SkeletonReview />
                  <SkeletonReview />
                  <SkeletonReview />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{book?.title}"? This will soft-delete the book and update buyers' availability/cart.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore "{book?.title}"? This will make it available to buyers again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore} className="bg-green-600 hover:bg-green-700">
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PublisherViewBook;
