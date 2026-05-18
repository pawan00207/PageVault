// client/src/pages/manager/books/Books.jsx
import React, { useState, useEffect } from "react";
import { getPendingBooks, getApprovedBooks, getRejectedBooks, approveBook, rejectBook, flagBook } from "../../../services/manager.services";
import Pagination from "../../../components/ui/Pagination";

const Books = ({ type = 'pending' }) => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [actionType, setActionType] = useState("");
  const [actionReason, setActionReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const ITEMS_PER_PAGE = 9;

  const loadBooks = async () => {
    setLoading(true);
    try {
      let response;
      if (type === 'pending') {
        response = await getPendingBooks();
      } else if (type === 'approved') {
        response = await getApprovedBooks();
      } else if (type === 'rejected') {
        response = await getRejectedBooks();
      } else {
        // For flagged, we'll filter from pending or all books
        response = await getPendingBooks();
      }

      if (response.success) {
        setBooks(response.data || []);
      }
    } catch (error) {
      console.error("Error loading books:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = [...books];

    if (searchQuery) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (genreFilter !== "all") {
      filtered = filtered.filter(book => book.genre === genreFilter);
    }

    setFilteredBooks(filtered);
  };

  useEffect(() => {
    loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    filterBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books, searchQuery, genreFilter]);

  // Reset page when type or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [type, searchQuery, genreFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFilteredBooks = filteredBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setPageLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const delay = Math.floor(Math.random() * 800) + 200; // 300-600ms delay
    setTimeout(() => {
      setCurrentPage(page);
      setPageLoading(false);
    }, delay);
  };

  const handleAction = (book, action) => {
    setSelectedBook(book);
    setActionType(action);
    setShowActionModal(true);
    setActionReason("");
  };

  const confirmAction = async () => {
    if (!selectedBook) return;

    try {
      let response;
      if (actionType === 'approve') {
        response = await approveBook(selectedBook._id);
      } else if (actionType === 'reject') {
        response = await rejectBook(selectedBook._id, actionReason);
      } else if (actionType === 'flag') {
        response = await flagBook(selectedBook._id, actionReason);
      }

      if (response.success) {
        setShowActionModal(false);
        loadBooks();
      }
    } catch (error) {
      console.error("Error performing action:", error);
    }
  };

  const genres = [...new Set(books.map(book => book.genre))];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden skeleton-shimmer animate-fade-in">
              {/* Image skeleton */}
              <div className="h-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200"></div>
              {/* Content skeleton */}
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-1/2"></div>
                <div className="flex items-center gap-2">
                  <div className="h-5 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-16"></div>
                  <div className="h-5 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-12"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="h-9 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg flex-1"></div>
                  <div className="h-9 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg flex-1"></div>
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
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        <div>
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredBooks.length} of {books.length} books
        </p>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-book text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No {type} books found</p>
        </div>
      ) : (
        <>
          {/* Skeleton Loading State */}
          {pageLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden skeleton-shimmer animate-fade-in">
                  {/* Image skeleton */}
                  <div className="h-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200"></div>
                  {/* Content skeleton */}
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-1/2"></div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-16"></div>
                      <div className="h-5 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-12"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <div className="h-9 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg flex-1"></div>
                      <div className="h-9 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg flex-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedBooks.map((book) => (
            <div key={book._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 relative">
                {book.image ? (
                  <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fas fa-book text-6xl text-gray-400"></i>
                  </div>
                )}
                <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
                  type === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  type === 'approved' ? 'bg-green-100 text-green-700' :
                  type === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {type}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{book.title}</h3>
                <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">{book.genre}</span>
                  <span className="text-sm font-bold text-purple-600">₹{book.price}</span>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  <p className="flex items-center gap-1">
                    <i className="fas fa-user"></i>
                    {book.publisher?.firstname} {book.publisher?.lastname}
                  </p>
                  <p>{book.publisher?.publishingHouse}</p>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  {type === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(book, 'approve')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg transition-colors"
                      >
                        <i className="fas fa-check mr-1"></i>
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(book, 'reject')}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 rounded-lg transition-colors"
                      >
                        <i className="fas fa-times mr-1"></i>
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(book, 'flag')}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-sm px-3 py-2 rounded-lg transition-colors"
                      >
                        <i className="fas fa-flag"></i>
                      </button>
                    </>
                  )}
                  {type === 'approved' && (
                    <>
                      <button
                        onClick={() => handleAction(book, 'reject')}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 rounded-lg transition-colors"
                      >
                        <i className="fas fa-times mr-1"></i>
                        Revoke
                      </button>
                      <button
                        onClick={() => handleAction(book, 'flag')}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-sm px-3 py-2 rounded-lg transition-colors"
                      >
                        <i className="fas fa-flag"></i>
                      </button>
                    </>
                  )}
                  {type === 'rejected' && (
                    <button
                      onClick={() => handleAction(book, 'approve')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg transition-colors"
                    >
                      <i className="fas fa-check mr-1"></i>
                      Restore & Approve
                    </button>
                  )}
                </div>
              </div>
            </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {filteredBooks.length > ITEMS_PER_PAGE && !pageLoading && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {actionType === 'approve' ? 'Approve Book' :
                 actionType === 'reject' ? 'Reject Book' :
                 'Flag Book'}
              </h3>
              <p className="text-gray-600 mb-4">
                Book: <span className="font-semibold">{selectedBook?.title}</span>
              </p>
              
              {(actionType === 'reject' || actionType === 'flag') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {actionType === 'reject' ? 'Rejection Reason' : 'Flag Remarks'}
                  </label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="Enter reason or remarks..."
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
                    actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                    actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
