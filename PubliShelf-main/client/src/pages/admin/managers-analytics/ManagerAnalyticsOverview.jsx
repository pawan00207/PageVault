import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getManagerAnalytics } from '../../../services/admin.services';
import { toast } from 'sonner';
import { Line } from 'react-chartjs-2';

const ManagerAnalyticsOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchManagerData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getManagerAnalytics(id);
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load manager analytics');
      toast.error('Failed to load manager analytics');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchManagerData();
  }, [fetchManagerData]);

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
          <p className="text-gray-600">Loading manager analytics...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.manager) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-4xl text-red-600 mb-4"></i>
          <p className="text-gray-700 font-medium">Manager not found.</p>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <button
            onClick={() => navigate('/admin/managers/analytics')}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Managers Analytics
          </button>
        </div>
      </div>
    );
  }

  const { manager, auctions, publishers, activity } = data;

  const isBanned = manager.account?.status === 'banned';
  const isPending = manager.moderation?.status === 'pending';
  const isActive = manager.moderation?.status === 'approved' && manager.account?.status !== 'banned';

  // Chart data for activity
  const activityChartData = {
    labels: activity.monthlyData?.map(d => d.month) || [],
    datasets: [
      {
        label: 'Approved',
        data: activity.monthlyData?.map(d => d.approved) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Rejected',
        data: activity.monthlyData?.map(d => d.rejected) || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
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
            onClick={() => navigate('/admin/managers/analytics')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 font-medium"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back to Managers Analytics</span>
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
                {manager.firstname?.charAt(0)}{manager.lastname?.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {manager.fullName}
                </h1>
                <p className="text-purple-200 text-sm mt-1">{manager.email}</p>
                <p className="text-purple-200 text-xs mt-2">
                  <i className="far fa-calendar mr-1"></i>
                  Joined: {formatDate(manager.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-gray-50">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 rounded-lg p-2">
                  <i className="fas fa-gavel text-green-600 text-lg"></i>
                </div>
                <p className="text-sm text-gray-600">Auctions Reviewed</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{auctions.total}</p>
              <p className="text-xs text-gray-500 mt-1">
                {auctions.approved.length} approved, {auctions.rejected.length} rejected
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 rounded-lg p-2">
                  <i className="fas fa-building text-blue-600 text-lg"></i>
                </div>
                <p className="text-sm text-gray-600">Publishers Approved</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{publishers.approved.length}</p>
              <p className="text-xs text-gray-500 mt-1">Total approved</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-red-100 rounded-lg p-2">
                  <i className="fas fa-times-circle text-red-600 text-lg"></i>
                </div>
                <p className="text-sm text-gray-600">Publishers Rejected</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{publishers.rejected.length}</p>
              <p className="text-xs text-gray-500 mt-1">Total rejected</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-100 rounded-lg p-2">
                  <i className="fas fa-ban text-orange-600 text-lg"></i>
                </div>
                <p className="text-sm text-gray-600">Publishers Banned</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{publishers.banned.length}</p>
              <p className="text-xs text-gray-500 mt-1">Total banned</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'auctions', 'publishers'].map((tab) => (
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
              {/* Activity Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-chart-line text-purple-600"></i>
                  Review Activity (Last 6 Months)
                </h3>
                <div style={{ height: '300px' }}>
                  <Line data={activityChartData} options={chartOptions} />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-history text-indigo-600"></i>
                  Recent Activity
                </h3>
                {activity.recentAuctions && activity.recentAuctions.length > 0 ? (
                  <div className="space-y-3">
                    {activity.recentAuctions.map((auction, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{auction.title}</p>
                          <p className="text-xs text-gray-500">
                            {auction.publisher?.publishingHouse || 'Unknown Publisher'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            auction.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {auction.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(auction.updatedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                )}
              </div>
            </div>
          )}

          {/* Auctions Tab */}
          {activeTab === 'auctions' && (
            <div className="space-y-6">
              {/* Approved Auctions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-check-circle text-green-600"></i>
                  Approved Auctions ({auctions.approved.length})
                </h3>
                {auctions.approved.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Publisher</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewed On</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {auctions.approved.map((auction) => (
                          <tr key={auction._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{auction.title}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {auction.publisher?.publishingHouse || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{auction.condition}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                              ₹{auction.basePrice?.toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(auction.updatedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No approved auctions</p>
                )}
              </div>

              {/* Rejected Auctions */}
              {auctions.rejected.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-times-circle text-red-600"></i>
                    Rejected Auctions ({auctions.rejected.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Publisher</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewed On</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {auctions.rejected.map((auction) => (
                          <tr key={auction._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{auction.title}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {auction.publisher?.publishingHouse || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-red-600">{auction.rejectionReason || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(auction.updatedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Publishers Tab */}
          {activeTab === 'publishers' && (
            <div className="space-y-6">
              {/* Approved Publishers */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-check-circle text-green-600"></i>
                  Approved Publishers ({publishers.approved.length})
                </h3>
                {publishers.approved.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Publishing House</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved On</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {publishers.approved.map((pub) => (
                          <tr key={pub._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{pub.fullName}</td>
                            <td className="px-4 py-3 text-sm text-purple-600">{pub.publishingHouse}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{pub.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(pub.moderation?.at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No publishers approved</p>
                )}
              </div>

              {/* Banned Publishers */}
              {publishers.banned.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-ban text-red-600"></i>
                    Banned Publishers ({publishers.banned.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Publishing House</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banned On</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {publishers.banned.map((pub) => (
                          <tr key={pub._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{pub.fullName}</td>
                            <td className="px-4 py-3 text-sm text-purple-600">{pub.publishingHouse}</td>
                            <td className="px-4 py-3 text-sm text-red-600">{pub.account?.reason || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(pub.account?.at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Rejected Publishers */}
              {publishers.rejected.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-times-circle text-orange-600"></i>
                    Rejected Publishers ({publishers.rejected.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Publishing House</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rejected On</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {publishers.rejected.map((pub) => (
                          <tr key={pub._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{pub.fullName}</td>
                            <td className="px-4 py-3 text-sm text-purple-600">{pub.publishingHouse}</td>
                            <td className="px-4 py-3 text-sm text-orange-600">{pub.moderation?.reason || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(pub.moderation?.at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerAnalyticsOverview;
