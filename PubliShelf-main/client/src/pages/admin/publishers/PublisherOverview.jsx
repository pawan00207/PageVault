import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublisherAnalytics } from '../../../services/admin.services';
import { toast } from 'sonner';
import { Line } from 'react-chartjs-2';

const PublisherOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchPublisherData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPublisherAnalytics(id);
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load publisher details');
      toast.error('Failed to load publisher details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPublisherData();
  }, [fetchPublisherData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
          <p className="text-gray-600">Loading publisher analytics...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.publisher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-4xl text-red-600 mb-4"></i>
          <p className="text-gray-700 font-medium">Publisher not found.</p>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <button
            onClick={() => navigate('/admin/publishers')}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Publishers
          </button>
        </div>
      </div>
    );
  }

  const { publisher, books, antiqueBooks, revenue, recentOrders, topSellingBooks, genreBreakdown } = data;

  const isBanned = publisher.account?.status === 'banned';
  const isPending = publisher.moderation?.status === 'pending';
  const isActive = publisher.moderation?.status === 'approved' && publisher.account?.status !== 'banned';

  // Chart data for revenue
  const revenueChartData = {
    labels: revenue.monthlyData?.map(d => d.month) || [],
    datasets: [
      {
        label: 'Revenue',
        data: revenue.monthlyData?.map(d => d.revenue) || [],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button + Status */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/publishers')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 font-medium"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back to Publishers</span>
          </button>
          <div className="flex items-center gap-3">
            {isBanned ? (
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                <i className="fas fa-ban mr-2"></i>Banned
              </span>
            ) : isPending ? (
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                <i className="fas fa-clock mr-2"></i>Pending
              </span>
            ) : (
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                <i className="fas fa-check-circle mr-2"></i>Active
              </span>
            )}
          </div>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center text-white text-3xl font-bold">
                {publisher.firstname?.charAt(0)}{publisher.lastname?.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {publisher.fullName}
                </h1>
                <p className="text-purple-100 text-lg">{publisher.publishingHouse}</p>
                <p className="text-purple-200 text-sm mt-1">{publisher.email}</p>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-gray-50">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-100 rounded-lg p-2">
                  <i className="fas fa-rupee-sign text-purple-600 text-lg"></i>
                </div>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue.total)}</p>
              <p className="text-xs text-gray-500 mt-1">{revenue.orderCount} orders</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 rounded-lg p-2">
                  <i className="fas fa-book text-blue-600 text-lg"></i>
                </div>
                <p className="text-sm text-gray-600">Books Published</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{books.total}</p>
              <p className="text-xs text-gray-500 mt-1">{books.active.length} active</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 rounded-lg p-2">
                  <i className="fas fa-shopping-cart text-green-600 text-lg"></i>
                </div>
                <p className="text-sm text-gray-600">Books Sold</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{revenue.booksSold}</p>
              <p className="text-xs text-gray-500 mt-1">Total copies</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-amber-100 rounded-lg p-2">
                  <i className="fas fa-gavel text-amber-600 text-lg"></i>
                </div>
                <p className="text-sm text-gray-600">Antique Books</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{antiqueBooks.total}</p>
              <p className="text-xs text-gray-500 mt-1">{antiqueBooks.approved.length} approved</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'books', 'auctions', 'orders'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Revenue Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-chart-line text-purple-600"></i>
                  Revenue Trend (Last 6 Months)
                </h3>
                <div style={{ height: '300px' }}>
                  <Line data={revenueChartData} options={chartOptions} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Selling Books */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-star text-amber-500"></i>
                    Top Selling Books
                  </h3>
                  {topSellingBooks && topSellingBooks.length > 0 ? (
                    <div className="space-y-3">
                      {topSellingBooks.slice(0, 5).map((book, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{book.title}</p>
                            <p className="text-xs text-gray-500">{book.totalSold} copies sold</p>
                          </div>
                          <p className="font-semibold text-purple-600">{formatCurrency(book.revenue)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No sales data yet</p>
                  )}
                </div>

                {/* Genre Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-layer-group text-blue-500"></i>
                    Genre Distribution
                  </h3>
                  {genreBreakdown && genreBreakdown.length > 0 ? (
                    <div className="space-y-3">
                      {genreBreakdown.map((genre, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-gray-900 text-sm">{genre.genre}</p>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {genre.count} books
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No books published yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Books Tab */}
          {activeTab === 'books' && (
            <div className="space-y-6">
              {/* Active Books */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-book text-green-600"></i>
                  Active Books ({books.active.length})
                </h3>
                {books.active.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Genre</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Published</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {books.active.map((book) => (
                          <tr key={book._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{book.title}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{book.author}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{book.genre || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(book.price)}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                book.quantity > 10 ? 'bg-green-100 text-green-800' : 
                                book.quantity > 0 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {book.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(book.publishedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No active books</p>
                )}
              </div>

              {/* Deleted Books */}
              {books.deleted.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-trash text-red-600"></i>
                    Deleted Books ({books.deleted.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Genre</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {books.deleted.map((book) => (
                          <tr key={book._id} className="hover:bg-gray-50 opacity-60">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{book.title}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{book.author}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{book.genre || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(book.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Auctions Tab */}
          {activeTab === 'auctions' && (
            <div className="space-y-6">
              {/* Approved Auctions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-check-circle text-green-600"></i>
                  Approved Auctions ({antiqueBooks.approved.length})
                </h3>
                {antiqueBooks.approved.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {antiqueBooks.approved.map((auction) => (
                      <div key={auction._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-semibold text-gray-900 mb-2">{auction.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{auction.author}</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Condition:</span>
                            <span className="font-medium text-gray-900">{auction.condition}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Base Price:</span>
                            <span className="font-semibold text-purple-600">{formatCurrency(auction.basePrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Current Price:</span>
                            <span className="font-semibold text-green-600">{formatCurrency(auction.currentPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Start:</span>
                            <span className="text-gray-900">{formatDate(auction.auctionStart)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">End:</span>
                            <span className="text-gray-900">{formatDate(auction.auctionEnd)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No approved auctions</p>
                )}
              </div>

              {/* Pending Auctions */}
              {antiqueBooks.pending.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-clock text-yellow-600"></i>
                    Pending Auctions ({antiqueBooks.pending.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {antiqueBooks.pending.map((auction) => (
                      <div key={auction._id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{auction.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{auction.author}</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Condition:</span>
                            <span className="font-medium text-gray-900">{auction.condition}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Base Price:</span>
                            <span className="font-semibold text-purple-600">{formatCurrency(auction.basePrice)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejected Auctions */}
              {antiqueBooks.rejected.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-times-circle text-red-600"></i>
                    Rejected Auctions ({antiqueBooks.rejected.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {antiqueBooks.rejected.map((auction) => (
                      <div key={auction._id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{auction.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{auction.author}</p>
                        {auction.rejectionReason && (
                          <div className="bg-white border border-red-200 rounded p-2 mb-3">
                            <p className="text-xs text-red-700"><strong>Reason:</strong> {auction.rejectionReason}</p>
                          </div>
                        )}
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Condition:</span>
                            <span className="font-medium text-gray-900">{auction.condition}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Base Price:</span>
                            <span className="font-semibold text-purple-600">{formatCurrency(auction.basePrice)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fas fa-shopping-cart text-purple-600"></i>
                Recent Orders ({recentOrders?.length || 0})
              </h3>
              {recentOrders && recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {order.buyer?.firstname} {order.buyer?.lastname}
                          </p>
                          <p className="text-sm text-gray-500">{order.buyer?.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">{formatCurrency(order.total)}</p>
                          <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm bg-gray-50 rounded p-2">
                            <span className="text-gray-900">{item.title}</span>
                            <span className="text-gray-600">
                              {item.quantity} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.lineTotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        <i className="far fa-calendar mr-1"></i>
                        {formatDate(order.orderDate)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No orders yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublisherOverview;
