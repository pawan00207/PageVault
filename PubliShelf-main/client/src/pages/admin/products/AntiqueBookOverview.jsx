import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAntiqueBookAnalytics } from '../../../services/admin.services';
import { Line } from 'react-chartjs-2';
import { toast } from 'sonner';

const AntiqueBookOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [antiqueBook, setAntiqueBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAntiqueBookData();
  }, [id]);

  const fetchAntiqueBookData = async () => {
    try {
      setLoading(true);
      const response = await getAntiqueBookAnalytics(id);
      setAntiqueBook(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load antique book data');
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        <i className={`fas ${statusIcons[status] || 'fa-question'} mr-2`}></i>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
          <p className="text-gray-600">Loading antique book analytics...</p>
        </div>
      </div>
    );
  }

  if (!antiqueBook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-4xl text-red-600 mb-4"></i>
          <p className="text-gray-600">Antique book not found</p>
          <button
            onClick={() => navigate('/admin/products/antique-books')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Back to Antique Books
          </button>
        </div>
      </div>
    );
  }

  const bidTrendData = {
    labels: antiqueBook.bidHistory?.map((_, idx) => `Bid ${idx + 1}`) || [],
    datasets: [
      {
        label: 'Bid Amount',
        data: antiqueBook.bidHistory?.map(bid => bid.bidAmount) || [],
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
          label: (context) => `Bid: ${formatCurrency(context.parsed.y)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => formatCurrency(value)
        }
      }
    }
  };

  const priceIncrease = antiqueBook.auction?.currentPrice && antiqueBook.auction?.basePrice
    ? (((antiqueBook.auction.currentPrice - antiqueBook.auction.basePrice) / antiqueBook.auction.basePrice) * 100).toFixed(1)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/products/antique-books')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i className="fas fa-arrow-left text-gray-600"></i>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{antiqueBook.antiqueBook?.title}</h1>
            <p className="text-gray-600 mt-1">by {antiqueBook.antiqueBook?.author}</p>
          </div>
        </div>
        {getStatusBadge(antiqueBook.auction?.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 rounded-lg p-3">
              <i className="fas fa-gavel text-purple-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Bids</p>
              <p className="text-2xl font-bold text-gray-900">{antiqueBook.stats?.totalBids || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-3">
              <i className="fas fa-users text-blue-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Unique Bidders</p>
              <p className="text-2xl font-bold text-gray-900">{antiqueBook.stats?.uniqueBidders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-lg p-3">
              <i className="fas fa-rupee-sign text-green-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Price</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(antiqueBook.auction?.currentPrice)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 rounded-lg p-3">
              <i className="fas fa-tag text-amber-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Base Price</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(antiqueBook.auction?.basePrice)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-rose-100 rounded-lg p-3">
              <i className="fas fa-chart-line text-rose-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Price Increase</p>
              <p className="text-2xl font-bold text-gray-900">+{priceIncrease}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('biddingHistory')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'biddingHistory'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bidding History ({antiqueBook.biddingHistory?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('topBidders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'topBidders'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Top Bidders ({antiqueBook.topBidders?.length || 0})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Book Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Title</span>
                      <span className="font-medium text-gray-900">{antiqueBook.antiqueBook?.title || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Author</span>
                      <span className="font-medium text-gray-900">{antiqueBook.antiqueBook?.author || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Genre</span>
                      <span className="font-medium text-gray-900">{antiqueBook.antiqueBook?.genre || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Publisher</span>
                      <span className="font-medium text-gray-900">{antiqueBook.antiqueBook?.publisherName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Published Date</span>
                      <span className="font-medium text-gray-900">{antiqueBook.antiqueBook?.publishedAt ? new Date(antiqueBook.antiqueBook.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Condition</span>
                      <span className="font-medium text-gray-900">{antiqueBook.antiqueBook?.condition || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Auction Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Status</span>
                      <span>{getStatusBadge(antiqueBook.auction?.status)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Base Price</span>
                      <span className="font-medium text-gray-900">{formatCurrency(antiqueBook.auction?.basePrice)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Current Price</span>
                      <span className="font-medium text-gray-900">{formatCurrency(antiqueBook.auction?.currentPrice)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Start Time</span>
                      <span className="font-medium text-gray-900">{formatDate(antiqueBook.stats?.auctionStart)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">End Time</span>
                      <span className="font-medium text-gray-900">{formatDate(antiqueBook.stats?.auctionEnd)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Bid Trend</h4>
                <div className="h-80">
                  <Line data={bidTrendData} options={chartOptions} />
                </div>
              </div>

              {antiqueBook.stats?.winner && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 rounded-full p-4">
                      <i className="fas fa-trophy text-purple-600 text-2xl"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Auction Winner</h4>
                      <p className="text-gray-700">
                        <span className="font-medium">{antiqueBook.stats.winner}</span>
                        {antiqueBook.stats.winnerEmail && (
                          <span className="text-gray-600"> ({antiqueBook.stats.winnerEmail})</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Winning Bid: <span className="font-semibold text-purple-600">{formatCurrency(antiqueBook.stats.winningAmount)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'biddingHistory' && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Complete Bidding History</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bidder</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bid Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {antiqueBook.biddingHistory?.length > 0 ? (
                      antiqueBook.biddingHistory.map((bid, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {antiqueBook.biddingHistory.length - index}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{bid.bidderName}</p>
                              <p className="text-sm text-gray-500">{bid.bidderEmail}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(bid.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(bid.timestamp)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                          <i className="fas fa-inbox text-4xl mb-3 opacity-50"></i>
                          <p>No bids yet</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'topBidders' && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Top Bidders</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bidder</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bids</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Highest Bid</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {antiqueBook.topBidders?.length > 0 ? (
                      antiqueBook.topBidders.map((bidder, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {index === 0 && <i className="fas fa-crown text-yellow-500 text-lg mr-2"></i>}
                              {index === 1 && <i className="fas fa-medal text-gray-400 text-lg mr-2"></i>}
                              {index === 2 && <i className="fas fa-medal text-amber-700 text-lg mr-2"></i>}
                              <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{bidder.bidderName}</p>
                              <p className="text-sm text-gray-500">{bidder.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {bidder.bidCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(bidder.highestBid)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                          <i className="fas fa-inbox text-4xl mb-3 opacity-50"></i>
                          <p>No bidders yet</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AntiqueBookOverview;
