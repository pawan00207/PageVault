import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getPlatformAnalytics } from '../../../services/admin.services';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.user);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getPlatformAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center py-12">
          <i className="fas fa-exclamation-circle text-4xl text-purple-600 mb-4"></i>
          <p className="text-gray-600">{error}</p>
          <button onClick={fetchAnalytics} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(analytics?.revenue?.total),
      icon: 'fa-rupee-sign',
      color: 'purple',
      subtitle: `${analytics?.orders || 0} orders`,
      trend: '+12.5%'
    },
    {
      title: 'This Month',
      value: formatCurrency(analytics?.revenue?.month),
      icon: 'fa-calendar-alt',
      color: 'indigo',
      subtitle: 'Monthly revenue',
      trend: '+8.2%'
    },
    {
      title: 'Average Order',
      value: formatCurrency(analytics?.revenue?.averageOrderValue),
      icon: 'fa-chart-line',
      color: 'blue',
      subtitle: 'Order value',
      trend: '+5.1%'
    },
    {
      title: 'Publishers',
      value: analytics?.publishers || 0,
      icon: 'fa-building',
      color: 'green',
      subtitle: 'Active publishers'
    },
    {
      title: 'Buyers',
      value: analytics?.buyers || 0,
      icon: 'fa-users',
      color: 'orange',
      subtitle: 'Registered buyers'
    }
  ];

  const colorClasses = {
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name} - Here's your platform overview</p>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {statCards.map((card, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className={`${colorClasses[card.color].bg} rounded-lg p-3`}>
                    <i className={`fas ${card.icon} ${colorClasses[card.color].text} text-xl`}></i>
                  </div>
                  {card.trend && (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      {card.trend}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className={`text-2xl font-bold ${colorClasses[card.color].text} mt-1`}>
                  {card.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-chart-pie mr-2"></i>
                Overview
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-shopping-bag mr-2"></i>
                Orders Analytics
              </button>
              <button
                onClick={() => setActiveTab('publishers')}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === 'publishers'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-building mr-2"></i>
                Publishers Analytics
              </button>
              <button
                onClick={() => setActiveTab('buyers')}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === 'buyers'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-users mr-2"></i>
                Buyers Analytics
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && analytics && (
            <div className="space-y-6">
              {/* Revenue Trend Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend (Last 30 Days)</h2>
                {analytics.revenueTrend && analytics.revenueTrend.length > 0 ? (
                  <div className="h-80">
                    <Line
                      data={{
                        labels: analytics.revenueTrend.map(item => new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })),
                        datasets: [
                          {
                            label: 'Revenue (₹)',
                            data: analytics.revenueTrend.map(item => item.revenue),
                            borderColor: 'rgb(147, 51, 234)',
                            backgroundColor: 'rgba(147, 51, 234, 0.1)',
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: 'rgb(147, 51, 234)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: true, position: 'top' },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `Revenue: ${formatCurrency(context.parsed.y)}`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return '₹' + (value / 1000) + 'K';
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No revenue data available</p>
                )}
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Overview</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                      <span className="text-gray-700 font-medium">Managers</span>
                      <span className="font-bold text-purple-600">{analytics?.managers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                      <span className="text-gray-700 font-medium">Publishers</span>
                      <span className="font-bold text-indigo-600">{analytics?.publishers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                      <span className="text-gray-700 font-medium">Buyers</span>
                      <span className="font-bold text-blue-600">{analytics?.buyers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                      <span className="text-gray-700 font-medium">Books</span>
                      <span className="font-bold text-green-600">{analytics?.books || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                  <div className="space-y-3">
                    <button 
                      onClick={() => navigate('/admin/managers')}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left border border-gray-100"
                    >
                      <span className="flex items-center">
                        <div className="bg-purple-100 rounded-full p-2 mr-3">
                          <i className="fas fa-user-check text-purple-600"></i>
                        </div>
                        <span className="font-medium text-gray-900">Review Pending Managers</span>
                      </span>
                      <i className="fas fa-arrow-right text-gray-400"></i>
                    </button>
                    <button 
                      onClick={() => navigate('/admin/settings')}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left border border-gray-100"
                    >
                      <span className="flex items-center">
                        <div className="bg-indigo-100 rounded-full p-2 mr-3">
                          <i className="fas fa-cog text-indigo-600"></i>
                        </div>
                        <span className="font-medium text-gray-900">Platform Settings</span>
                      </span>
                      <i className="fas fa-arrow-right text-gray-400"></i>
                    </button>
                    {user?.isSuperAdmin && (
                      <button 
                        onClick={() => navigate('/admin/settings?tab=team')}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left border border-gray-100"
                      >
                        <span className="flex items-center">
                          <div className="bg-orange-100 rounded-full p-2 mr-3">
                            <i className="fas fa-users-cog text-orange-600"></i>
                          </div>
                          <span className="font-medium text-gray-900">Manage Admin Team</span>
                        </span>
                        <i className="fas fa-arrow-right text-gray-400"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Analytics Tab */}
          {activeTab === 'orders' && analytics && (
            <div className="space-y-6">
              {/* Revenue Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Today's Revenue</p>
                    <i className="fas fa-calendar-day text-purple-600"></i>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(analytics.revenue?.today)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">This Week</p>
                    <i className="fas fa-calendar-week text-indigo-600"></i>
                  </div>
                  <p className="text-2xl font-bold text-indigo-600">{formatCurrency(analytics.revenue?.week)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">This Month</p>
                    <i className="fas fa-calendar-alt text-blue-600"></i>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.revenue?.month)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">This Year</p>
                    <i className="fas fa-calendar text-green-600"></i>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.revenue?.year)}</p>
                </div>
              </div>

              {/* Monthly Revenue Trend */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Revenue Trend</h2>
                {analytics.monthlyRevenue && analytics.monthlyRevenue.length > 0 ? (
                  <div className="h-80">
                    <Bar
                      data={{
                        labels: analytics.monthlyRevenue.map(item => item.month),
                        datasets: [
                          {
                            label: 'Revenue (₹)',
                            data: analytics.monthlyRevenue.map(item => item.revenue),
                            backgroundColor: 'rgba(147, 51, 234, 0.8)',
                            borderColor: 'rgb(147, 51, 234)',
                            borderWidth: 2,
                            borderRadius: 8,
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `Revenue: ${formatCurrency(context.parsed.y)}`;
                              },
                              afterLabel: function(context) {
                                const orders = analytics.monthlyRevenue[context.dataIndex].orders;
                                return `Orders: ${orders}`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return '₹' + (value / 1000) + 'K';
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No monthly data available</p>
                )}
              </div>

              {/* Order Status & Revenue Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders by Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Orders by Status</h2>
                  {analytics.ordersByStatus && analytics.ordersByStatus.length > 0 ? (
                    <div className="h-64">
                      <Doughnut
                        data={{
                          labels: analytics.ordersByStatus.map(item => item.status.charAt(0).toUpperCase() + item.status.slice(1)),
                          datasets: [
                            {
                              data: analytics.ordersByStatus.map(item => item.count),
                              backgroundColor: [
                                'rgba(147, 51, 234, 0.8)',
                                'rgba(99, 102, 241, 0.8)',
                                'rgba(59, 130, 246, 0.8)',
                                'rgba(34, 197, 94, 0.8)',
                                'rgba(234, 179, 8, 0.8)',
                                'rgba(239, 68, 68, 0.8)',
                              ],
                              borderColor: [
                                'rgb(147, 51, 234)',
                                'rgb(99, 102, 241)',
                                'rgb(59, 130, 246)',
                                'rgb(34, 197, 94)',
                                'rgb(234, 179, 8)',
                                'rgb(239, 68, 68)',
                              ],
                              borderWidth: 2,
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: 'bottom' },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return `${context.label}: ${context.parsed} orders`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No order data available</p>
                  )}
                </div>

                {/* Revenue by Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue by Order Status</h2>
                  {analytics.revenueByStatus && analytics.revenueByStatus.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.revenueByStatus.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              item.status === 'delivered' ? 'bg-green-500' :
                              item.status === 'shipped' ? 'bg-blue-500' :
                              item.status === 'processing' ? 'bg-yellow-500' :
                              item.status === 'paid' ? 'bg-indigo-500' :
                              item.status === 'cancelled' ? 'bg-red-500' :
                              'bg-gray-500'
                            }`}></div>
                            <span className="font-medium text-gray-900 capitalize">{item.status}</span>
                          </div>
                          <span className="font-bold text-purple-600">{formatCurrency(item.revenue)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No revenue status data available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Publishers Analytics Tab */}
          {activeTab === 'publishers' && analytics && (
            <div className="space-y-6">
              {/* Top Publishers Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Top 10 Publishers by Revenue</h2>
                {analytics.topPublishers && analytics.topPublishers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Publisher</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Publishing House</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Books Sold</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.topPublishers.map((publisher, index) => (
                          <tr key={publisher._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                index === 0 ? 'bg-yellow-500' :
                                index === 1 ? 'bg-gray-400' :
                                index === 2 ? 'bg-orange-600' :
                                'bg-purple-600'
                              }`}>
                                {index + 1}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium text-gray-900">{publisher.name}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-gray-600">{publisher.publishingHouse}</p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="font-bold text-purple-600">{formatCurrency(publisher.revenue)}</p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="font-medium text-gray-900">{publisher.booksSold}</p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="text-gray-600">{publisher.orders}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No publisher data available</p>
                )}
              </div>

              {/* Publisher Revenue Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Publisher Revenue Distribution</h2>
                {analytics.topPublishers && analytics.topPublishers.length > 0 ? (
                  <div className="h-80">
                    <Bar
                      data={{
                        labels: analytics.topPublishers.map(p => p.name.split(' ')[0]),
                        datasets: [
                          {
                            label: 'Revenue (₹)',
                            data: analytics.topPublishers.map(p => p.revenue),
                            backgroundColor: 'rgba(99, 102, 241, 0.8)',
                            borderColor: 'rgb(99, 102, 241)',
                            borderWidth: 2,
                            borderRadius: 8,
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `Revenue: ${formatCurrency(context.parsed.y)}`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return '₹' + (value / 1000) + 'K';
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No data available</p>
                )}
              </div>
            </div>
          )}

          {/* Buyers Analytics Tab */}
          {activeTab === 'buyers' && analytics && (
            <div className="space-y-6">
              {/* Top Buyers Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Top 10 Buyers by Spending</h2>
                {analytics.topBuyers && analytics.topBuyers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Buyer</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Spent</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Order</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.topBuyers.map((buyer, index) => (
                          <tr key={buyer._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                index === 0 ? 'bg-yellow-500' :
                                index === 1 ? 'bg-gray-400' :
                                index === 2 ? 'bg-orange-600' :
                                'bg-blue-600'
                              }`}>
                                {index + 1}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium text-gray-900">{buyer.name}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-gray-600">{buyer.email}</p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="font-bold text-purple-600">{formatCurrency(buyer.totalSpent)}</p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="font-medium text-gray-900">{buyer.orderCount}</p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="text-gray-600">{formatCurrency(buyer.totalSpent / buyer.orderCount)}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No buyer data available</p>
                )}
              </div>

              {/* Buyer Spending Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Top Buyers Spending Distribution</h2>
                {analytics.topBuyers && analytics.topBuyers.length > 0 ? (
                  <div className="h-80">
                    <Bar
                      data={{
                        labels: analytics.topBuyers.map(b => b.name.split(' ')[0]),
                        datasets: [
                          {
                            label: 'Total Spent (₹)',
                            data: analytics.topBuyers.map(b => b.totalSpent),
                            backgroundColor: 'rgba(59, 130, 246, 0.8)',
                            borderColor: 'rgb(59, 130, 246)',
                            borderWidth: 2,
                            borderRadius: 8,
                          }
                        ]
                      }}
                      options={{
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `Total Spent: ${formatCurrency(context.parsed.x)}`;
                              },
                              afterLabel: function(context) {
                                const buyer = analytics.topBuyers[context.dataIndex];
                                return `Orders: ${buyer.orderCount}`;
                              }
                            }
                          }
                        },
                        scales: {
                          x: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return '₹' + (value / 1000) + 'K';
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No data available</p>
                )}
              </div>
            </div>
          )}
    </div>
  );
};

export default Dashboard;
