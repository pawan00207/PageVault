//client/src/pages/publisher/dashboard/PublisherDashboard_Old.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getDashboard, softDeleteBook, restoreBook } from "../../../services/publisher.services.js";
import { logout } from "../../../services/auth.services.js";
import { clearAuth } from "../../../store/slices/authSlice";
import { useDispatch } from "react-redux";
import { clearUser } from "../../../store/slices/userSlice";
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

const PublisherDashboard_Old = () => {
  const [data, setData] = useState({
    publisher: { firstname: "", lastname: "", status: "approved" },
    analytics: { booksSold: 0, totalRevenue: 0, mostSoldBook: null, topGenres: [] },
    books: [],
    deletedBooks: [],
    auctions: [],
    activities: [],
    availableBooks: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredBookId, setHoveredBookId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await getDashboard();
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to fetch dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    dispatch(clearAuth());
    dispatch(clearUser());
    setShowLogoutDialog(false);
    navigate("/auth/login");
  };

  const handleEditClick = (book, e) => {
    e?.stopPropagation();
    navigate(`/publisher/edit-book/${book._id}`, { state: { book } });
  };

  const handleDeleteClick = async (book, e) => {
    e?.stopPropagation();
    const confirm = window.confirm(
      `Are you sure you want to delete "${book.title}"? This will soft-delete the book and update buyers' availability/cart.`
    );
    if (!confirm) return;
    try {
      setActionLoading(true);
      await softDeleteBook(book._id);
      setData(prevData => {
        const updatedDeletedBooks = [...(prevData.deletedBooks || []), { ...book, isDeleted: true }]
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        
        return {
          ...prevData,
          books: prevData.books.filter(b => b._id !== book._id),
          deletedBooks: updatedDeletedBooks
        };
      });
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete book");
      await fetchDashboard();
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreClick = async (book, e) => {
    e?.stopPropagation(); // Prevent card click
    const confirm = window.confirm(
      `Are you sure you want to restore "${book.title}"? This will make it available to buyers again.`
    );
    if (!confirm) return;
    try {
      setActionLoading(true);
      await restoreBook(book._id);  
      setData(prevData => {
        const updatedBooks = [...prevData.books, { ...book, isDeleted: false }]
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        
        return {
          ...prevData,
          books: updatedBooks,
          deletedBooks: prevData.deletedBooks.filter(b => b._id !== book._id)
        };
      });
    } catch (err) {
      console.error("Restore error:", err);
      alert("Failed to restore book");
      // Revert on error
      await fetchDashboard();
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewBook = (bookId) => {
    navigate(`/publisher/view-book/${bookId}`);
  };

  if (loading)
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
    );

  return (
    <div className="bg-gray-50">
      {/* Navbar */}
      <nav className="fixed w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/publisher/dashboard" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
                  PubliShelf
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {data.publisher.firstname} {data.publisher.lastname}
              </span>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r hover:bg-gradient-to-l from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:-translate-y-[2px] transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Publisher Dashboard</h1>

          {/* Approval Status */}
          {data.publisher.status !== "approved" && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-lg">
              <p className="font-medium">
                Approval Status:{" "}
                {data.publisher.status.charAt(0).toUpperCase() + data.publisher.status.slice(1)}
              </p>
              <p>
                Your account is{" "}
                {data.publisher.status === "pending"
                  ? "awaiting approval. You can publish books, but they will be reviewed before listing."
                  : "rejected. Please contact support@publishelf.com."}
              </p>
            </div>
          )}

          {/* Analytics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900">Books Sold</h3>
              <p className="text-2xl font-bold text-purple-600 mt-2">{data.analytics.booksSold}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                ₹{data.analytics.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900">Most Sold Book</h3>
              <p className="text-lg font-bold text-purple-600 mt-2">
                {data.analytics.mostSoldBook ? data.analytics.mostSoldBook.title : "None"}
              </p>
              <p className="text-sm text-gray-600">
                {data.analytics.mostSoldBook ? `${data.analytics.mostSoldBook.count} sold` : ""}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Genres</h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                {data.analytics.topGenres.map((genre) => (
                  <li key={genre.genre}>
                    {genre.genre}: {genre.count} sold
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link
              to="/publisher/publish-book"
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center space-x-4 text-white">
                <div className="bg-purple-500 p-3 rounded-lg">
                  <i className="fas fa-book text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Publish New Book</h3>
                  <p className="text-purple-200">List your book for sale</p>
                </div>
              </div>
            </Link>
            <Link
              to="/publisher/sell-antique"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center space-x-4 text-white">
                <div className="bg-indigo-500 p-3 rounded-lg">
                  <i className="fas fa-gavel text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Sell Antique Book</h3>
                  <p className="text-indigo-200">Start an auction</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Publications */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Publications</h2>
            {data.books.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.books.map((book) => (
                  <div
                    key={book._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden relative transform transition-transform duration-300 hover:scale-[1.0125] hover:shadow-lg"
                    onMouseEnter={() => setHoveredBookId(book._id)}
                    onMouseLeave={() => setHoveredBookId(null)}
                  >
                    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-[300px] object-contain bg-white p-2"
                      />
                      
                      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm transition-opacity duration-200 cursor-pointer ${
                          hoveredBookId === book._id ? "opacity-100" : "opacity-0 pointer-events-none" }`}
                          onClick={() => handleViewBook(book._id)}>
                        <button
                          title="Edit"
                          onClick={(e) => handleEditClick(book, e)}
                          className="text-base flex items-center gap-2 bg-white text-purple-600 rounded-lg px-5 py-2.5 shadow-lg hover:bg-purple-50 hover:scale-105 focus:outline-none transition-all duration-200"
                        >
                          <i className="fas fa-edit"></i>
                          <span className="font-medium select-none">Edit Book</span>
                        </button>
                        <button
                          title="Delete"
                          onClick={(e) => handleDeleteClick(book, e)}
                          className="text-base flex items-center gap-2 bg-white text-red-600 rounded-lg px-5 py-2.5 shadow-lg hover:bg-red-50 hover:scale-105 focus:outline-none transition-all duration-200"
                          disabled={actionLoading}
                        >
                          <i className="fas fa-trash"></i>
                          <span className="font-medium select-none">Delete Book</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 cursor-pointer" onClick={() => handleViewBook(book._id)}> 
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl font-bold text-purple-600">₹{book.price}</span>
                        </div>
                        <div>
                          {book.quantity === 0 ? (
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-red-200">
                              <i className="fas fa-times-circle"></i>
                              Out of Stock
                            </span>
                          ) : book.quantity <= 5 ? (
                            <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-orange-200">
                              <i className="fas fa-exclamation-circle"></i>
                              {book.quantity} left
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-green-200">
                              <i className="fas fa-check-circle"></i>
                              {book.quantity} units
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold mb-1 line-clamp-1" title={book.title}>
                        {book.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                      
                      {/* Info grid */}
                      <div className="flex justify-between mt-3 pt-3 px-2 border-t border-gray-200">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <i className="fas fa-tag text-purple-500"></i>
                          <span className="font-medium">{book.genre}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <i className="fas fa-calendar text-green-500"></i>
                          <span className="font-medium">{new Date(book.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No recent publications found.</p>
            )}
          </div>

          {/* Deleted Books */}
          {data.deletedBooks && data.deletedBooks.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Deleted Books</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.deletedBooks.map((book) => (
                  <div
                    key={book._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden relative transform transition-transform duration-300 hover:scale-[1.0125] hover:shadow-lg opacity-75"
                    onMouseEnter={() => setHoveredBookId(book._id)}
                    onMouseLeave={() => setHoveredBookId(null)}
                  >
                    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-[300px] object-contain bg-white p-2 grayscale"
                      />
                      
                      {/* Deleted Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-lg">
                          <i className="fas fa-trash"></i>
                          Deleted
                        </span>
                      </div>
                      
                      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
                          hoveredBookId === book._id ? "opacity-100" : "opacity-0 pointer-events-none" }`}>
                        <button
                          title="Restore"
                          onClick={(e) => handleRestoreClick(book, e)}
                          className="text-base flex items-center gap-2 bg-white text-green-600 rounded-lg px-5 py-2.5 shadow-lg hover:bg-green-50 hover:scale-105 focus:outline-none transition-all duration-200"
                          disabled={actionLoading}
                        >
                          <i className="fas fa-undo"></i>
                          <span className="font-medium select-none">Restore Book</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 cursor-pointer" onClick={() => handleViewBook(book._id)}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl font-bold text-gray-500">₹{book.price}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-red-200">
                          <i className="fas fa-ban"></i>
                          Unavailable
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold mb-1 line-clamp-1 text-gray-700" title={book.title}>
                        {book.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-2">by {book.author}</p>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center text-amber-400">
                          <i className="fas fa-star text-xs"></i>
                          <span className="ml-1 text-sm font-semibold text-gray-700">
                            {book.rating ? book.rating.toFixed(1) : '0.0'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({book.reviewCount || 0} reviews)
                        </span>
                      </div>
                      
                      {/* Info grid */}
                      <div className="flex justify-between mt-3 pt-3 px-2 border-t border-gray-200">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <i className="fas fa-tag text-gray-400"></i>
                          <span className="font-medium">{book.genre}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <i className="fas fa-calendar text-gray-400"></i>
                          <span className="font-medium">{new Date(book.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Auctions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Auctions</h2>
            {data.auctions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Base Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Bid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.auctions.map((auction) => (
                      <tr key={auction._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {auction.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{auction.basePrice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{auction.currentPrice || auction.basePrice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(auction.auctionStart).toLocaleString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(auction.auctionEnd).toLocaleString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No active auctions.</p>
            )}
          </div>

          {/* Recent Buyer Interactions */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Recent Buyer Interactions
            </h2>
            {data.activities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.activities.map((activity, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {activity.action}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(activity.timestamp).toLocaleString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No recent buyer interactions.</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
                PubliShelf
              </span>
              <p className="text-sm mt-2">© 2025 PubliShelf. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="/terms" className="text-gray-300 hover:text-purple-400 text-sm">
                Terms and Conditions
              </a>
              <a href="/privacy" className="text-gray-300 hover:text-purple-400 text-sm">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to login again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="bg-red-600 hover:bg-red-700">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PublisherDashboard_Old;