import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBooksWithAnalytics } from '../../../services/admin.services';
import { toast } from 'sonner';

const Books = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('revenue');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await getAllBooksWithAnalytics();
      setBooks(response.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const genres = ['all', ...new Set(books.map(b => b.genre).filter(Boolean))];

  const filteredBooks = books
    .filter(book => {
      const matchesSearch =
        book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.publisherName?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (filterGenre !== 'all' && book.genre !== filterGenre) return false;

      if (filterStatus === 'in-stock' && book.stats?.status !== 'In Stock') return false;
      if (filterStatus === 'out-of-stock' && book.stats?.status !== 'Out of Stock') return false;
      if (filterStatus === 'deleted' && book.stats?.status !== 'Deleted') return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'revenue') return (b.stats?.totalRevenue || 0) - (a.stats?.totalRevenue || 0);
      if (sortBy === 'sold') return (b.stats?.totalSold || 0) - (a.stats?.totalSold || 0);
      if (sortBy === 'rating') return (b.stats?.rating || 0) - (a.stats?.rating || 0);
      if (sortBy === 'price') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
          <p className="text-gray-600">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="w-[14%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Publisher
                </th>
                <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="w-[12%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="w-[18%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="w-[6%] px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <i className="fas fa-inbox text-4xl mb-3 opacity-50"></i>
                    <p>No books found</p>
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book._id} className="hover:bg-gray-50 transition-colors">
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {book.image && (
                          <img
                            src={book.image}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p
                            className="font-medium text-gray-900 truncate"
                            title={book.title}
                          >
                            {book.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            by {book.author}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {book.genre}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 truncate">
                      {book.publisherName}
                    </td>

                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCurrency(book.price)}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {book.stats?.totalSold || 0}
                    </td>

                    <td className="px-6 py-4 font-semibold text-green-600">
                      {formatCurrency(book.stats?.totalRevenue)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <i className="fas fa-star text-yellow-500 text-sm"></i>
                        <span className="text-sm font-medium text-gray-900">
                          {(book.stats?.rating || 0).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({book.stats?.reviewCount || 0})
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          book.stats?.status === 'In Stock'
                            ? 'bg-green-100 text-green-800'
                            : book.stats?.status === 'Out of Stock'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {book.stats?.status}
                        {book.stats?.status === 'In Stock' &&
                          ` (${book.stats.stock})`}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          navigate(`/admin/products/books/${book._id}`)
                        }
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <i className="fas fa-eye"></i>
                        View
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Books;
