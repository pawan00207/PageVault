// client/src/pages/publisher/active-books/ActiveBooks.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { getDashboard, softDeleteBook } from "../../../services/publisher.services";

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

import Pagination from "../../../components/Pagination.jsx";

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden skeleton-shimmer animate-fade-in">
    <div className="w-full h-40 md:h-64 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
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

const ActiveBooks = () => {
  const [user, setUser] = useState({ firstname: "", lastname: "" });
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBookId, setHoveredBookId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const navigate = useNavigate();

  const ROWS_PER_PAGE = 8;

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await getDashboard();
      if (response.success) {
        setUser(response.data.publisher);
        setBooks(response.data.books);
      }
    } catch (err) {
      console.error("Failed to load books:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (book, e) => {
    e?.stopPropagation();
    navigate(`/publisher/edit-book/${book._id}`, { state: { book } });
  };

  const handleDeleteClick = (book, e) => {
    e?.stopPropagation();
    setSelectedBook(book);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedBook) return;

    try {
      setActionLoading(true);
      setShowDeleteDialog(false);
      await softDeleteBook(selectedBook._id);
      setBooks(prev => prev.filter(b => b._id !== selectedBook._id));
      toast.success("Book deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete book");
    } finally {
      setActionLoading(false);
      setSelectedBook(null);
    }
  };

  const handleViewBook = (bookId) => {
    navigate(`/publisher/view-book/${bookId}`);
  };

  const handlePageChange = (page) => {
    setPageLoading(true);
    const delay = Math.floor(Math.random() * 600) + 200;
    setTimeout(() => {
      setCurrentPage(page);
      setPageLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, delay);
  };

  // Pagination logic
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentBooks = books.slice(startIndex, endIndex);
  const totalPages = Math.ceil(books.length / ROWS_PER_PAGE);

  // -------------------------------
  // SKELETON FOR INITIAL LOADING
  // -------------------------------
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Active Books</h1>
          <p className="text-gray-600 mt-1">Loading your books...</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {Array.from({ length: ROWS_PER_PAGE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Active Books</h1>
              <p className="text-gray-600 mt-1">{books.length} books in your inventory</p>
            </div>
            <Link
              to="/publisher/publish-book"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Publish New Book
            </Link>
          </div>

          {/* -------------------------------
                PAGE LOADING SKELETON
             ------------------------------- */}
          {pageLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: ROWS_PER_PAGE }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : currentBooks.length > 0 ? (
            /* -------------------------------
                    BOOKS GRID
               ------------------------------- */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentBooks.map((book) => (
                <div
                  key={book._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  onMouseEnter={() => setHoveredBookId(book._id)}
                  onMouseLeave={() => setHoveredBookId(null)}
                >
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-[300px] object-contain bg-white p-2"
                    />

                    {/* Hover Actions */}
                    <div
                      className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg hover:backdrop-blur-xs transition-all duration-200 cursor-pointer ${
                        hoveredBookId === book._id
                          ? "opacity-100"
                          : "opacity-0 pointer-events-none"
                      }`}
                      onClick={() => handleViewBook(book._id)}
                    >
                      <button
                        onClick={(e) => handleEditClick(book, e)}
                        className="flex items-center gap-2 bg-white text-purple-600 rounded-lg px-5 py-2.5 shadow-lg hover:bg-purple-50 hover:scale-105 transition-all duration-200"
                      >
                        <i className="fas fa-edit"></i>
                        <span className="font-medium">Edit Book</span>
                      </button>

                      <button
                        onClick={(e) => handleDeleteClick(book, e)}
                        className="flex items-center gap-2 bg-white text-red-600 rounded-lg px-5 py-2.5 shadow-lg hover:bg-red-50 hover:scale-105 transition-all duration-200"
                        disabled={actionLoading}
                      >
                        <i className="fas fa-trash"></i>
                        <span className="font-medium">Delete Book</span>
                      </button>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-4 cursor-pointer" onClick={() => handleViewBook(book._id)}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-purple-600">₹{book.price}</span>

                      <div>
                        {book.quantity === 0 ? (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-red-200">
                            <i className="fas fa-times-circle"></i>
                            Out of Stock
                          </span>
                        ) : book.quantity <= 5 ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-amber-200">
                            <i className="fas fa-exclamation-triangle"></i>
                            Low Stock: {book.quantity}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-green-200">
                            <i className="fas fa-check-circle"></i>
                            Stock: {book.quantity}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">
                      {book.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-2">by {book.author}</p>

                    <div className="flex items-center gap-2">
                      <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                        {book.genre}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* NO BOOKS EMPTY STATE */
            <div className="text-center py-16">
              <i className="fas fa-book text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No active books</h3>
              <p className="text-gray-500 mb-6">Start by publishing your first book</p>

              <Link
                to="/publisher/publish-book"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <i className="fas fa-plus"></i>
                Publish New Book
              </Link>
            </div>
          )}

          {/* Pagination */}
          {books.length > ROWS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedBook?.title}"?
              This will soft-delete the book and update buyers' availability/cart.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ActiveBooks;
