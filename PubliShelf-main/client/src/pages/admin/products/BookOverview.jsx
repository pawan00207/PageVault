import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookAnalytics } from '../../../services/admin.services';
import { Line } from 'react-chartjs-2';
import { toast } from 'sonner';

const BookOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchBookData();
  }, [id]);

  const fetchBookData = async () => {
    try {
      setLoading(true);
      const response = await getBookAnalytics(id);
      setBook(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load book data');
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
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
          <p className="text-gray-600">Loading book analytics...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-4xl text-red-600 mb-4"></i>
          <p className="text-gray-600">Book not found</p>
          <button
            onClick={() => navigate('/admin/products/books')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Back to Books
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const salesChartData = {
    labels: book.salesTrend?.map(m => m.month) || [],
    datasets: [
      {
        label: 'Units Sold',
        data: book.salesTrend?.map(m => m.sales) || [],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const revenueChartData = {
    labels: book.salesTrend?.map(m => m.month) || [],
    datasets: [
      {
        label: 'Revenue',
        data: book.salesTrend?.map(m => m.revenue) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const revenueChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: (context) => `Revenue: ${formatCurrency(context.parsed.y)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value)
        }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/products/books')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i className="fas fa-arrow-left text-gray-600"></i>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{book.book?.title}</h1>
            <p className="text-gray-600 mt-1">by {book.book?.author}</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 rounded-lg p-3">
              <i className="fas fa-shopping-cart text-purple-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sold</p>
              <p className="text-2xl font-bold text-gray-900">{book.stats?.totalSold || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-lg p-3">
              <i className="fas fa-rupee-sign text-green-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(book.stats?.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-3">
              <i className="fas fa-boxes text-blue-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Stock</p>
              <p className="text-2xl font-bold text-gray-900">{book.stats?.currentStock || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 rounded-lg p-3">
              <i className="fas fa-star text-amber-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {book.stats?.rating ? book.stats.rating.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 rounded-lg p-3">
              <i className="fas fa-comment text-indigo-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{book.stats?.reviewCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Order History ({book.orderHistory?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('buyers')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'buyers'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Top Buyers ({book.topBuyers?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'reviews'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Reviews ({book.reviews?.length || 0})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Book Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Book Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Title</span>
                      <span className="font-medium text-gray-900">{book.book?.title || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Author</span>
                      <span className="font-medium text-gray-900">{book.book?.author || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Genre</span>
                      <span className="font-medium text-gray-900">{book.book?.genre || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Publisher</span>
                      <span className="font-medium text-gray-900">{book.book?.publisherName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price</span>
                      <span className="font-medium text-gray-900">{formatCurrency(book.book?.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Added On</span>
                      <span className="font-medium text-gray-900">{formatDate(book.book?.createdAt || book.book?.publishedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Revenue</span>
                      <span className="font-medium text-gray-900">{formatCurrency(book.stats?.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Units Sold</span>
                      <span className="font-medium text-gray-900">{book.stats?.totalSold || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock Status</span>
                      <span className={`font-medium ${book.stats?.currentStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {book.stats?.currentStock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Added On</span>
                      <span className="font-medium text-gray-900">{formatDate(book.book?.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Trend */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend (Last 6 Months)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Units Sold</h4>
                    <div style={{ height: '250px' }}>
                      {book.salesTrend && book.salesTrend.length > 0 ? (
                        <Line data={salesChartData} options={chartOptions} />
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <i className="fas fa-chart-line text-4xl mb-3 opacity-50"></i>
                            <p>No sales data available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Revenue</h4>
                    <div style={{ height: '250px' }}>
                      {book.salesTrend && book.salesTrend.length > 0 ? (
                        <Line data={revenueChartData} options={revenueChartOptions} />
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <i className="fas fa-chart-line text-4xl mb-3 opacity-50"></i>
                            <p>No revenue data available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              {book.orderHistory && book.orderHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Buyer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {book.orderHistory.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              #{order._id?.slice(-8)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{order.buyerName}</p>
                              <p className="text-xs text-gray-500">{order.buyerEmail}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{order.quantity}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(order.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <i className="fas fa-inbox text-4xl mb-3 opacity-50"></i>
                  <p>No order history available</p>
                </div>
              )}
            </div>
          )}

          {/* Top Buyers Tab */}
          {activeTab === 'buyers' && (
            <div>
              {book.topBuyers && book.topBuyers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {book.topBuyers.map((buyer, index) => (
                    <div key={buyer._id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center">
                            <span className="text-purple-600 font-bold">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{buyer.name}</p>
                            <p className="text-sm text-gray-600">{buyer.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-gray-600">Units Purchased</p>
                          <p className="font-semibold text-gray-900">{buyer.totalQuantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Spent</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(buyer.totalSpent)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <i className="fas fa-users text-4xl mb-3 opacity-50"></i>
                  <p>No buyer data available</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              {book.reviews && book.reviews.length > 0 ? (
                <div className="space-y-4">
                  {book.reviews.map((review) => (
                    <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{review.buyerName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`fas fa-star text-sm ${
                                    i < review.rating ? 'text-amber-500' : 'text-gray-300'
                                  }`}
                                ></i>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">{review.rating}/5</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 text-sm">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <i className="fas fa-comment-slash text-4xl mb-3 opacity-50"></i>
                  <p>No reviews available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookOverview;
