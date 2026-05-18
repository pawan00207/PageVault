import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllAntiqueBooksWithAnalytics } from '../../../services/admin.services';
import { toast } from 'sonner';

const AntiqueBooks = () => {
  const navigate = useNavigate();
  const [antiqueBooks, setAntiqueBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('currentPrice');

  useEffect(() => {
    fetchAntiqueBooks();
  }, []);

  const fetchAntiqueBooks = async () => {
    try {
      setLoading(true);
      const response = await getAllAntiqueBooksWithAnalytics();
      setAntiqueBooks(response.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load antique books');
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

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      ended: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    };

    const statusIcons = {
      pending: 'fa-clock',
      scheduled: 'fa-calendar-check',
      ongoing: 'fa-gavel',
      ended: 'fa-flag-checkered',
      rejected: 'fa-times-circle'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        <i className={`fas ${statusIcons[status] || 'fa-question'} mr-1`}></i>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  const summaryStats = antiqueBooks.reduce((acc, book) => {
    acc.totalBooks++;
    acc.totalBids += book.stats?.totalBids || 0;
    if (book.auction?.status === 'ongoing') acc.ongoingAuctions++;
    if (book.auction?.status === 'ended') acc.endedAuctions++;
    return acc;
  }, { totalBooks: 0, totalBids: 0, ongoingAuctions: 0, endedAuctions: 0 });

  const filteredAntiqueBooks = antiqueBooks
    .filter(book => {
      const matchesSearch =
        book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.publisherName?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (filterStatus === 'all') return true;
      return book.auction?.status === filterStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'currentPrice') return (b.auction?.currentPrice || 0) - (a.auction?.currentPrice || 0);
      if (sortBy === 'totalBids') return (b.stats?.totalBids || 0) - (a.stats?.totalBids || 0);
      if (sortBy === 'status') return (a.auction?.status || '').localeCompare(b.auction?.status || '');
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
          <p className="text-gray-600">Loading antique books...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 rounded-lg p-3">
              <i className="fas fa-scroll text-2xl text-purple-600"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Antique Books</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalBooks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-lg p-3">
              <i className="fas fa-gavel text-2xl text-green-600"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Bids</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalBids}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-3">
              <i className="fas fa-play-circle text-2xl text-blue-600"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Ongoing Auctions</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.ongoingAuctions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 rounded-lg p-3">
              <i className="fas fa-flag-checkered text-2xl text-gray-600"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Ended Auctions</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.endedAuctions}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book Details
                </th>
                <th className="w-[12%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Publisher
                </th>
                <th className="w-[13%] px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Price
                </th>
                <th className="w-[15%] px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="w-[14%] px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bids
                </th>
                <th className="w-[14%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="w-[6%] px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAntiqueBooks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <i className="fas fa-inbox text-4xl mb-3 opacity-50"></i>
                    <p>No antique books found</p>
                  </td>
                </tr>
              ) : (
                filteredAntiqueBooks.map((book) => (
                  <tr key={book._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate" title={book.title}>
                          {book.title}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          by {book.author}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900 truncate">
                      {book.publisherName}
                    </td>

                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {formatCurrency(book.auction?.basePrice)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-purple-600">
                        {formatCurrency(book.auction?.currentPrice)}
                      </p>
                      {book.auction?.currentPrice && book.auction?.basePrice && (
                        <p className="text-xs text-green-600">
                          +{(((book.auction.currentPrice - book.auction.basePrice) / book.auction.basePrice) * 100).toFixed(1)}%
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <p className="font-medium text-gray-900">
                        {book.stats?.totalBids || 0}
                      </p>
                      <p className="text-xs text-gray-500">
                        {book.stats?.uniqueBidders || 0} bidders
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(book.auction?.status)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/products/antique-books/${book._id}`)}
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

export default AntiqueBooks;
