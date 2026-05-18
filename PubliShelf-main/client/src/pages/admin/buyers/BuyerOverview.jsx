import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBuyerAnalytics } from '../../../services/admin.services';
import { Line } from 'react-chartjs-2';
import { toast } from 'sonner';

const BuyerOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchBuyerData();
  }, [id]);

  const fetchBuyerData = async () => {
    try {
      setLoading(true);
      const response = await getBuyerAnalytics(id);
      setBuyer(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load buyer data');
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
          <p className="text-gray-600">Loading buyer analytics...</p>
        </div>
      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-4xl text-red-600 mb-4"></i>
          <p className="text-gray-600">Buyer not found</p>
          <button
            onClick={() => navigate('/admin/buyers')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Back to Buyers
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const spendingChartData = {
    labels: buyer.spending?.monthlyData?.map(m => m.month) || [],
    datasets: [
      {
        label: 'Monthly Spending',
        data: buyer.spending?.monthlyData?.map(m => m.total) || [],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
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
      },
      tooltip: {
        callbacks: {
          label: (context) => `Spent: ${formatCurrency(context.parsed.y)}`
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
            onClick={() => navigate('/admin/buyers')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i className="fas fa-arrow-left text-gray-600"></i>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{buyer.fullName}</h1>
            <p className="text-gray-600 mt-1">{buyer.email}</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 rounded-lg p-3">
              <i className="fas fa-rupee-sign text-purple-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(buyer.stats?.totalSpent)}</p>
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
              <p className="text-2xl font-bold text-gray-900">{buyer.stats?.totalOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-lg p-3">
              <i className="fas fa-chart-line text-green-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(buyer.stats?.avgOrderValue)}</p>
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
              <p className="text-2xl font-bold text-gray-900">{buyer.stats?.totalBooksPurchased || 0}</p>
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
              Orders ({buyer.orders?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'insights'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Insights
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Trend (Last 6 Months)</h3>
                <div style={{ height: '300px' }}>
                  {buyer.spending?.monthlyData && buyer.spending.monthlyData.length > 0 ? (
                    <Line data={spendingChartData} options={chartOptions} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <i className="fas fa-chart-line text-4xl mb-3 opacity-50"></i>
                        <p>No spending data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Account Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-medium text-gray-900">{formatDate(buyer.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone</span>
                      <span className="font-medium text-gray-900">{buyer.phoneNumber || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email Verified</span>
                      <span className={`font-medium ${buyer.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {buyer.isVerified ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Purchase Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Spent</span>
                      <span className="font-medium text-gray-900">{formatCurrency(buyer.stats?.totalSpent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Order</span>
                      <span className="font-medium text-gray-900">{formatCurrency(buyer.stats?.avgOrderValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Orders</span>
                      <span className="font-medium text-gray-900">{buyer.stats?.totalOrders || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              {buyer.orders && buyer.orders.length > 0 ? (
                <div className="space-y-4">
                  {buyer.orders.map((order) => (
                    <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">Order #{order._id.slice(-8)}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            <i className="far fa-calendar mr-1"></i>
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">{formatCurrency(order.totalAmount)}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <p className="text-sm text-gray-600 mb-2">Items:</p>
                        <div className="space-y-1">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-700">
                                {item.book?.title || 'Unknown Book'} × {item.quantity}
                              </span>
                              <span className="text-gray-900 font-medium">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {order.paymentMethod && (
                        <div className="border-t border-gray-200 mt-3 pt-3">
                          <p className="text-xs text-gray-600">
                            <i className="fas fa-credit-card mr-1"></i>
                            Payment: {order.paymentMethod} • {order.paymentStatus}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <i className="fas fa-shopping-cart text-4xl mb-3 opacity-50"></i>
                  <p>No orders yet</p>
                </div>
              )}
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* Genre Preferences */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Genre Preferences</h4>
                {buyer.insights?.genreBreakdown && buyer.insights.genreBreakdown.length > 0 ? (
                  <div className="space-y-2">
                    {buyer.insights.genreBreakdown.map((genre, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{genre._id}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ 
                                width: `${(genre.count / buyer.stats?.totalBooksPurchased) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-12 text-right">{genre.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No genre data available</p>
                )}
              </div>

              {/* Favorite Publishers */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Favorite Publishers</h4>
                {buyer.insights?.favoritePublishers && buyer.insights.favoritePublishers.length > 0 ? (
                  <div className="space-y-2">
                    {buyer.insights.favoritePublishers.slice(0, 5).map((pub, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{pub.publisherName}</span>
                        <span className="font-medium text-gray-900">{pub.count} books</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No publisher data available</p>
                )}
              </div>

              {/* Most Purchased Books */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Most Purchased Books</h4>
                {buyer.insights?.mostPurchasedBooks && buyer.insights.mostPurchasedBooks.length > 0 ? (
                  <div className="space-y-3">
                    {buyer.insights.mostPurchasedBooks.slice(0, 5).map((book, idx) => (
                      <div key={idx} className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{book.title}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            by {book.author} • {book.genre}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-purple-600 ml-3">{book.count}×</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No book data available</p>
                )}
              </div>

              {/* Payment & Order Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Payment Methods</h4>
                  {buyer.insights?.paymentMethods && buyer.insights.paymentMethods.length > 0 ? (
                    <div className="space-y-2">
                      {buyer.insights.paymentMethods.map((pm, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 capitalize">{pm._id}</span>
                          <span className="font-medium text-gray-900">{pm.count} times</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No payment data available</p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Status Breakdown</h4>
                  {buyer.insights?.orderStatuses && buyer.insights.orderStatuses.length > 0 ? (
                    <div className="space-y-2">
                      {buyer.insights.orderStatuses.map((status, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 capitalize">{status._id}</span>
                          <span className="font-medium text-gray-900">{status.count} orders</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No status data available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerOverview;
