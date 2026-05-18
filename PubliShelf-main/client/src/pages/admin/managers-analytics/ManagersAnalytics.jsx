import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllManagersWithAnalytics } from '../../../services/admin.services';
import { toast } from 'sonner';

const ManagersAnalytics = () => {
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('activity');

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const response = await getAllManagersWithAnalytics();
      setManagers(response.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load managers');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort managers
  const filteredManagers = managers
    .filter(manager => {
      const matchesSearch = 
        manager.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      if (filterStatus === 'all') return true;
      if (filterStatus === 'banned') return manager.account?.status === 'banned';
      if (filterStatus === 'active') return manager.moderation?.status === 'approved' && manager.account?.status !== 'banned';
      if (filterStatus === 'pending') return manager.moderation?.status === 'pending';
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'activity') {
        return (b.stats?.auctions?.total || 0) - (a.stats?.auctions?.total || 0);
      } else if (sortBy === 'publishers') {
        return (b.stats?.publishers?.approved || 0) - (a.stats?.publishers?.approved || 0);
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
          <p className="text-gray-600">Loading managers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manager Analytics</h1>
        <p className="text-gray-600 mt-2">Monitor all manager activities and performance</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 rounded-lg p-3">
              <i className="fas fa-user-tie text-purple-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Managers</p>
              <p className="text-2xl font-bold text-gray-900">{managers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-lg p-3">
              <i className="fas fa-gavel text-green-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Auctions Reviewed</p>
              <p className="text-2xl font-bold text-gray-900">
                {managers.reduce((sum, m) => sum + (m.stats?.auctions?.total || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-3">
              <i className="fas fa-building text-blue-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Publishers Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {managers.reduce((sum, m) => sum + (m.stats?.publishers?.approved || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 rounded-lg p-3">
              <i className="fas fa-ban text-red-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Publishers Banned</p>
              <p className="text-2xl font-bold text-gray-900">
                {managers.reduce((sum, m) => sum + (m.stats?.publishers?.banned || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search managers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="pending">Pending Approval</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="activity">Sort by Activity</option>
            <option value="publishers">Sort by Publishers Approved</option>
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Join Date</option>
          </select>
        </div>
      </div>

      {/* Managers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auctions Reviewed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Publishers Managed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredManagers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <i className="fas fa-inbox text-4xl mb-3 opacity-50"></i>
                    <p>No managers found</p>
                  </td>
                </tr>
              ) : (
                filteredManagers.map((manager) => (
                  <tr key={manager._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{manager.fullName}</p>
                        <p className="text-xs text-gray-500">{manager.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {manager.stats?.auctions?.total || 0}
                          </span>
                          <span className="text-xs text-gray-500">total</span>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span className="text-green-600">{manager.stats?.auctions?.approved || 0} approved</span>
                          <span className="text-red-600">{manager.stats?.auctions?.rejected || 0} rejected</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-2 text-xs">
                          <span className="text-green-600">{manager.stats?.publishers?.approved || 0} approved</span>
                          <span className="text-red-600">{manager.stats?.publishers?.rejected || 0} rejected</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-600">{manager.stats?.publishers?.banned || 0} banned</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {manager.lastLogin ? new Date(manager.lastLogin).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'Never'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {manager.account?.status === 'banned' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <i className="fas fa-ban mr-1"></i> Banned
                          </span>
                        ) : manager.moderation?.status === 'pending' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <i className="fas fa-clock mr-1"></i> Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <i className="fas fa-check-circle mr-1"></i> Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/managers/analytics/${manager._id}`)}
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

export default ManagersAnalytics;
