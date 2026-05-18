import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBuyersWithAnalytics } from '../../../services/admin.services';
import { toast } from 'sonner';

const Buyers = () => {
  const navigate = useNavigate();
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('spending');

  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = async () => {
    try {
      setLoading(true);
      const response = await getAllBuyersWithAnalytics();
      setBuyers(response.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load buyers');
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

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter and sort buyers
  const filteredBuyers = buyers
    .filter(buyer => {
      const matchesSearch = 
        buyer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.email?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'spending') {
        return (b.stats?.totalSpent || 0) - (a.stats?.totalSpent || 0);
      } else if (sortBy === 'orders') {
        return (b.stats?.totalOrders || 0) - (a.stats?.totalOrders || 0);
      } else if (sortBy === 'books') {
        return (b.stats?.booksPurchased || 0) - (a.stats?.booksPurchased || 0);
      } else if (sortBy === 'name') {
        return (a.fullName || '').localeCompare(b.fullName || '');
      } else if (sortBy === 'date') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
          <p className="text-gray-600">Loading buyers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Buyer Analytics</h1>
        <p className="text-gray-600 mt-2">Monitor all buyer activities and purchases</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 rounded-lg p-3">
              <i className="fas fa-users text-purple-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Buyers</p>
              <p className="text-2xl font-bold text-gray-900">{buyers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-lg p-3">
              <i className="fas fa-rupee-sign text-green-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spending</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(buyers.reduce((sum, b) => sum + (b.stats?.totalSpent || 0), 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-3">
              <i className="fas fa-shopping-cart text-blue-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {buyers.reduce((sum, b) => sum + (b.stats?.totalOrders || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 rounded-lg p-3">
              <i className="fas fa-book text-amber-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Books Purchased</p>
              <p className="text-2xl font-bold text-gray-900">
                {buyers.reduce((sum, b) => sum + (b.stats?.booksPurchased || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search buyers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="spending">Sort by Spending</option>
            <option value="orders">Sort by Orders</option>
            <option value="books">Sort by Books Purchased</option>
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Join Date</option>
          </select>
        </div>
      </div>

      {/* Buyers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buyer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Books Purchased
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recent Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBuyers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <i className="fas fa-inbox text-4xl mb-3 opacity-50"></i>
                    <p>No buyers found</p>
                  </td>
                </tr>
              ) : (
                filteredBuyers.map((buyer) => (
                  <tr key={buyer._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{buyer.fullName}</p>
                        <p className="text-xs text-gray-500">{buyer.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          <i className="far fa-calendar mr-1"></i>
                          Joined {formatDate(buyer.createdAt)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-purple-600">{formatCurrency(buyer.stats?.totalSpent)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {buyer.stats?.totalOrders || 0}
                        </span>
                        <span className="text-xs text-gray-500">orders</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {buyer.stats?.booksPurchased || 0}
                        </span>
                        <span className="text-xs text-gray-500">books</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          {formatDate(buyer.stats?.recentOrderDate)}
                        </p>
                        {buyer.stats?.recentOrderStatus && (
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            buyer.stats.recentOrderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                            buyer.stats.recentOrderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            buyer.stats.recentOrderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {buyer.stats.recentOrderStatus}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/buyers/${buyer._id}`)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <i className="fas fa-eye"></i>
                        View Details
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

export default Buyers;
