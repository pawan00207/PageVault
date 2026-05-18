// client/src/pages/manager/dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { getProfile, updateProfile } from "../../../services/manager.services";
import { logout } from "../../../services/auth.services";
import { clearAuth } from "../../../store/slices/authSlice";
import { clearUser } from "../../../store/slices/userSlice";
import { useForm } from "react-hook-form";
import Pagination from "../../../components/ui/Pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/AlertDialog";
import {
  firstnameRules,
  lastnameRules,
  emailRules,
  currentPasswordRules,
  newPasswordRules,
  confirmPasswordRules,
} from "./managerValidation";

// Analytics charts removed per requirement

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [user, setUser] = useState({ firstname: "", lastname: "", email: "" });
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  // Pagination for recent activity
  const [recentAuctionsPage, setRecentAuctionsPage] = useState(1);
  const [recentAuctionsPageLoading, setRecentAuctionsPageLoading] = useState(false);
  const RECENT_ITEMS_PER_PAGE = 3;
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, touchedFields, isSubmitted }
  } = useForm({ 
    mode: "onBlur",
    reValidateMode: "onChange"
  });

  const newPassword = watch("newPassword");


  useEffect(() => {
    loadProfile();
    console.log("in manager dashboard useeffect");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await getProfile();
      if (res?.success && res?.data?.user) {
        setUser(res.data.user);
        reset({
          firstname: res.data.user.firstname,
          lastname: res.data.user.lastname,
          email: res.data.user.email,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
      if (res?.data?.analytics) {
        setAnalytics(res.data.analytics);
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        firstname: data.firstname.trim(),
        lastname: data.lastname.trim(),
        email: data.email.trim(),
        currentPassword: data.currentPassword.trim(),
        confirmPassword: data.newPassword ? data.confirmPassword.trim() : "",
      };

      const res = await updateProfile(payload);

      if (res?.success) {
        setUser(res.data);
        setShowEditDialog(false);
        toast.success("Profile updated successfully");
        reset({
          firstname: res.data.firstname,
          lastname: res.data.lastname,
          email: res.data.email,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(res?.message || "Update failed");
      }
    } catch {
      toast.error("Failed to update profile");
    }
  };


  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    dispatch(clearAuth());
    dispatch(clearUser());
    setShowLogoutDialog(false);
    navigate("/auth/login");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="bg-purple-600 rounded-full w-20 h-20 flex items-center justify-center text-white text-3xl font-bold">
                  {user.firstname?.charAt(0)}{user.lastname?.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user.firstname} {user.lastname}
                  </h1>
                  <p className="text-gray-600 mt-1">{user.email}</p>
                  <p className="text-purple-600 font-medium mt-1 flex items-center gap-2">
                    <i className="fas fa-user-shield"></i>
                    Platform Manager
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowEditDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-[550] px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-edit"></i>
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 font-[550] rounded-lg transition-colors flex items-center gap-2"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-4 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`pb-4 font-medium transition-colors ${
                  activeTab === 'recent'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Recent Activity
              </button>
              {/* Analytics tab removed */}
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'overview' && (
            <>
              {analyticsLoading ? (
                <div className="space-y-8">
                  {/* Key Metrics Grid Skeleton */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 skeleton-shimmer animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-full"></div>
                          <div className="h-4 w-16 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-8 w-20 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded"></div>
                          <div className="h-4 w-32 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions Skeleton */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="h-6 w-40 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded mb-6 skeleton-shimmer"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Array.from({ length: 2 }).map((_, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg skeleton-shimmer">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded"></div>
                            <div className="h-3 w-1/2 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : analytics ? (
                <div className="space-y-8">
                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Books Stats - temporarily disabled */}
                {/**
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 rounded-full p-3">
                      <i className="fas fa-book text-blue-600 text-xl"></i>
                    </div>
                    <span className="text-sm text-gray-500">Books</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-gray-900">{analytics.bookStats.total}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-yellow-600">
                        <i className="fas fa-clock mr-1"></i>
                        {analytics.bookStats.pending} pending
                      </span>
                    </div>
                  </div>
                </div>
                **/}

                {/* Auctions Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-100 rounded-full p-3">
                      <i className="fas fa-gavel text-purple-600 text-xl"></i>
                    </div>
                    <span className="text-sm text-gray-500">Auctions</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-gray-900">{analytics.auctionStats.total}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-yellow-600">
                        <i className="fas fa-clock mr-1"></i>
                        {analytics.auctionStats.pending} pending
                      </span>
                    </div>
                  </div>
                </div>

                {/* Publishers Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 rounded-full p-3">
                      <i className="fas fa-users text-green-600 text-xl"></i>
                    </div>
                    <span className="text-sm text-gray-500">Publishers</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-gray-900">{analytics.publisherStats.total}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-600">
                        <i className="fas fa-check mr-1"></i>
                        {analytics.publisherStats.active} active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Platform Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-indigo-100 rounded-full p-3">
                      <i className="fas fa-chart-line text-indigo-600 text-xl"></i>
                    </div>
                    <span className="text-sm text-gray-500">Platform</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-gray-900">Active</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <i className="fas fa-check-circle text-green-500"></i>
                      <span>All systems operational</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/**
                  <button
                    onClick={() => navigate('/manager/books/pending')}
                    className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                  >
                    <div className="bg-yellow-100 rounded-full p-3">
                      <i className="fas fa-clock text-yellow-600 text-xl"></i>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Review Pending Books</p>
                      <p className="text-sm text-gray-500">{analytics.bookStats.pending} items</p>
                    </div>
                  </button>
                  **/}

                  <button
                    onClick={() => navigate('/manager/auctions/pending')}
                    className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                  >
                    <div className="bg-purple-100 rounded-full p-3">
                      <i className="fas fa-gavel text-purple-600 text-xl"></i>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Review Pending Auctions</p>
                      <p className="text-sm text-gray-500">{analytics.auctionStats.pending} items</p>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/manager/publishers')}
                    className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                  >
                    <div className="bg-green-100 rounded-full p-3">
                      <i className="fas fa-users text-green-600 text-xl"></i>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Manage Publishers</p>
                      <p className="text-sm text-gray-500">{analytics.publisherStats.total} total</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
              ) : null}
            </>
          )}

          {activeTab === 'recent' && (
            <>
              {analyticsLoading ? (
                <div className="space-y-6">
                  {/* Recent Auctions Skeleton */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="h-6 w-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded mb-6 skeleton-shimmer"></div>
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden skeleton-shimmer animate-fade-in">
                          <div className="flex flex-col md:flex-row gap-4 p-5">
                            {/* Image skeleton */}
                            <div className="flex-shrink-0">
                              <div className="w-32 h-40 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg"></div>
                            </div>
                            {/* Content skeleton */}
                            <div className="flex-1 space-y-3">
                              <div className="h-5 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-3/4"></div>
                              <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-1/3"></div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="h-16 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg"></div>
                                <div className="h-16 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg"></div>
                              </div>
                              <div className="flex gap-3">
                                <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-24"></div>
                                <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-20"></div>
                                <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-16"></div>
                              </div>
                              <div className="pt-3 border-t border-gray-200">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="h-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-full"></div>
                                  <div className="h-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-full"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : analytics ? (
            <div className="space-y-6">
              {/* Recent Books - temporarily disabled */}
              {/**
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Book Submissions</h2>
                {analytics.recentBooks && analytics.recentBooks.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.recentBooks.map((book) => (
                      <div key={book._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          {book.image ? (
                            <img src={book.image} alt={book.title} className="w-12 h-16 object-cover rounded" />
                          ) : (
                            <div className="w-12 h-16 bg-purple-100 rounded flex items-center justify-center">
                              <i className="fas fa-book text-purple-600"></i>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{book.title}</p>
                            <p className="text-sm text-gray-600">by {book.author}</p>
                            <p className="text-xs text-gray-500">
                              Publisher: {book.publisher?.firstname} {book.publisher?.lastname}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">₹{book.price}</p>
                          <p className="text-sm text-gray-500">{new Date(book.publishedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent book submissions</p>
                )}
              </div>
              **/}

              {/* Recent Auctions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <i className="fas fa-gavel text-2xl text-purple-600"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Recent Auction Submissions</h2>
                    <p className="text-sm text-gray-600">Latest auctions from publishers</p>
                  </div>
                </div>

                {analytics?.recentAuctions && analytics.recentAuctions.length > 0 ? (
                  <>
                    {recentAuctionsPageLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: RECENT_ITEMS_PER_PAGE }).map((_, idx) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden skeleton-shimmer animate-fade-in">
                            <div className="flex flex-col md:flex-row gap-4 p-5">
                              {/* Image skeleton */}
                              <div className="flex-shrink-0">
                                <div className="w-32 h-40 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg"></div>
                              </div>
                              {/* Content skeleton */}
                              <div className="flex-1 space-y-3">
                                <div className="h-5 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-1/3"></div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="h-16 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg"></div>
                                  <div className="h-16 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg"></div>
                                </div>
                                <div className="flex gap-3">
                                  <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-24"></div>
                                  <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-20"></div>
                                  <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-16"></div>
                                </div>
                                <div className="pt-3 border-t border-gray-200">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="h-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-full"></div>
                                    <div className="h-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-full"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(() => {
                          const startIndex = (recentAuctionsPage - 1) * RECENT_ITEMS_PER_PAGE;
                          const paginatedAuctions = analytics.recentAuctions.slice(startIndex, startIndex + RECENT_ITEMS_PER_PAGE);
                          
                          return paginatedAuctions.map((auction) => {
                            const auctionStart = auction.auctionStart ? new Date(auction.auctionStart) : null;
                            const auctionEnd = auction.auctionEnd ? new Date(auction.auctionEnd) : null;
                            const now = new Date();
                            const isActive = auctionStart && auctionEnd && now >= auctionStart && now <= auctionEnd;
                            const hasEnded = auctionEnd && now > auctionEnd;
                            
                            return (
                              <div key={auction._id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl hover:shadow-lg transition-all overflow-hidden">
                                <div className="flex flex-col md:flex-row gap-4 p-5">
                                  {/* Image Section */}
                                  <div className="flex-shrink-0">
                                    <div className="relative">
                                      {auction.itemImage || auction.image ? (
                                        <img 
                                          src={auction.itemImage || auction.image} 
                                          alt={auction.itemName || auction.title || 'Auction'} 
                                          className="w-28 h-36 object-cover rounded-lg shadow-md"
                                        />
                                      ) : (
                                        <div className="w-28 h-36 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center shadow-md">
                                          <i className="fas fa-gavel text-purple-600 text-3xl"></i>
                                        </div>
                                      )}
                                      {/* Status Badge */}
                                      <span className={`absolute top-2 right-2 text-xs font-bold px-2.5 py-1 rounded-full shadow-lg ${
                                        auction.status === 'pending' ? 'bg-yellow-500 text-white' :
                                        auction.status === 'approved' ? 'bg-green-500 text-white' :
                                        'bg-red-500 text-white'
                                      }`}>
                                        {(auction.status || 'pending').charAt(0).toUpperCase() + (auction.status || 'pending').slice(1)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Details Section */}
                                  <div className="flex-1 min-w-0">
                                    <div className="mb-3">
                                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                                        {auction.itemName || auction.title || 'Untitled Auction'}
                                      </h3>
                                      <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <i className="fas fa-tag text-purple-500"></i>
                                        {auction.category || auction.genre || 'Uncategorized'}
                                      </p>
                                    </div>

                                    {/* Publisher & Buyer Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                      {/* Publisher */}
                                      <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                                        <p className="text-xs font-semibold text-purple-700 mb-1.5 flex items-center gap-1">
                                          <i className="fas fa-user-tie"></i>
                                          Publisher
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                          {auction.publisher?.firstname || 'Unknown'} {auction.publisher?.lastname || ''}
                                        </p>
                                        {auction.publisher?.publishingHouse && (
                                          <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                                            <i className="fas fa-building text-xs mr-1"></i>
                                            {auction.publisher.publishingHouse}
                                          </p>
                                        )}
                                      </div>

                                      {/* Highest Bidder / Winner */}
                                      {(() => {
                                        const hasBids = auction.biddingHistory && auction.biddingHistory.length > 0;
                                        const latestBid = hasBids ? auction.biddingHistory[auction.biddingHistory.length - 1] : null;
                                        const bidder = auction.winner || auction.highestBidder || latestBid?.buyer;
                                        
                                        if (bidder || hasBids) {
                                          return (
                                            <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                                              <p className="text-xs font-semibold text-green-700 mb-1.5 flex items-center gap-1">
                                                <i className="fas fa-trophy"></i>
                                                {hasEnded ? 'Winner' : 'Highest Bidder'}
                                              </p>
                                              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                                {bidder?.firstname || 'Anonymous'} {bidder?.lastname || 'Bidder'}
                                              </p>
                                              {(auction.currentPrice || latestBid?.amount) && (
                                                <p className="text-xs font-bold text-green-600 mt-1">
                                                  ₹{((auction.currentPrice || latestBid?.amount) || 0).toLocaleString('en-IN')}
                                                </p>
                                              )}
                                              {hasBids && (
                                                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                  <i className="fas fa-gavel text-xs"></i>
                                                  {auction.biddingHistory.length} {auction.biddingHistory.length === 1 ? 'bid' : 'bids'}
                                                </p>
                                              )}
                                            </div>
                                          );
                                        } else {
                                          return (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center">
                                              <p className="text-xs text-gray-500 italic flex items-center gap-1">
                                                <i className="fas fa-hourglass-half"></i>
                                                No bids yet
                                              </p>
                                            </div>
                                          );
                                        }
                                      })()}
                                    </div>

                                    {/* Price & Status Info */}
                                    <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                                      {/* Starting Bid */}
                                      <div className="flex items-center gap-1.5 bg-purple-50 px-2.5 py-1 rounded-full">
                                        <span className="text-gray-600 text-xs">Base:</span>
                                        <span className="font-bold text-purple-600">₹{(auction.startingBid || auction.basePrice || 0).toLocaleString('en-IN')}</span>
                                      </div>

                                      {/* Current Price if exists */}
                                      {auction.currentPrice && auction.currentPrice > (auction.startingBid || auction.basePrice || 0) && (
                                        <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full">
                                          <span className="text-gray-600 text-xs">Current:</span>
                                          <span className="font-bold text-green-600">₹{auction.currentPrice.toLocaleString('en-IN')}</span>
                                        </div>
                                      )}

                                      {/* Total Bids */}
                                      {auction.biddingHistory && auction.biddingHistory.length > 0 && (
                                        <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-full">
                                          <i className="fas fa-gavel text-blue-600 text-xs"></i>
                                          <span className="text-blue-700 font-medium text-xs">{auction.biddingHistory.length} bids</span>
                                        </div>
                                      )}

                                      {/* Active Status */}
                                      {isActive && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white rounded-full text-xs font-bold shadow-sm">
                                          <i className="fas fa-fire"></i>
                                          Live Now
                                        </span>
                                      )}
                                      
                                      {hasEnded && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                                          <i className="fas fa-flag-checkered"></i>
                                          Ended
                                        </span>
                                      )}
                                    </div>

                                    {/* Auction Timeline */}
                                    {(auctionStart || auctionEnd) && (
                                      <div className="pt-3 border-t border-gray-200">
                                        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                                          {auctionStart && (
                                            <div className="flex items-center gap-1.5">
                                              <i className="fas fa-play-circle text-green-500"></i>
                                              <span>Start: {auctionStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                          )}
                                          {auctionEnd && (
                                            <div className="flex items-center gap-1.5">
                                              <i className="fas fa-stop-circle text-red-500"></i>
                                              <span>End: {auctionEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                    
                    {/* Pagination */}
                    {analytics.recentAuctions.length > RECENT_ITEMS_PER_PAGE && !recentAuctionsPageLoading && (
                      <div className="mt-6">
                        <Pagination
                          currentPage={recentAuctionsPage}
                          totalPages={Math.ceil(analytics.recentAuctions.length / RECENT_ITEMS_PER_PAGE)}
                          onPageChange={(page) => {
                            setRecentAuctionsPageLoading(true);
                            const delay = Math.floor(Math.random() * 300) + 300;
                            setTimeout(() => {
                              setRecentAuctionsPage(page);
                              setRecentAuctionsPageLoading(false);
                            }, delay);
                          }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent auction submissions</p>
                )}
              </div>
            </div>
              ) : null}
            </>
          )}

          {/* Analytics charts removed */}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                <button onClick={() => setShowEditDialog(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    {...register("firstname", firstnameRules)}
                    className="w-full px-4 py-2 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none hover:shadow-md transition-shadow duration-200"
                  />
                  {(errors.firstname && (touchedFields.firstname || isSubmitted)) && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstname.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    {...register("lastname", lastnameRules)}
                    className="w-full px-4 py-2 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none hover:shadow-md transition-shadow duration-200"
                  />
                  {(errors.lastname && (touchedFields.lastname || isSubmitted)) && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastname.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    {...register("email", emailRules)}
                    className="w-full px-4 py-2 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none hover:shadow-md transition-shadow duration-200"
                  />
                  {(errors.email && (touchedFields.email || isSubmitted)) && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    {...register("currentPassword", currentPasswordRules)}
                    className="w-full px-4 py-2 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none hover:shadow-md transition-shadow duration-200"
                  />
                  {(errors.currentPassword && (touchedFields.currentPassword || isSubmitted)) && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
                  )}
                </div>

                {/* Change Password */}
                <div className="border-t pt-4 mt-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Change Password (Optional)</p>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      {...register("newPassword", newPasswordRules)}
                      className="w-full px-4 py-2 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none hover:shadow-md transition-shadow duration-200"
                    />
                    {(errors.newPassword && (touchedFields.newPassword || isSubmitted)) && (
                      <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      {...register("confirmPassword", confirmPasswordRules(newPassword))}
                      className="w-full px-4 py-2 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none hover:shadow-md transition-shadow duration-200"
                    />
                    {(errors.confirmPassword && (touchedFields.confirmPassword || isSubmitted)) && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditDialog(false)}
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    Save Changes
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}


      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to login again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="bg-red-600 hover:bg-red-700">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
