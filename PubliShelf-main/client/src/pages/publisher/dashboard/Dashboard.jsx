// client/src/pages/publisher/dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { getProfile, updateProfile } from "../../../services/publisher.services";
import { logout } from "../../../services/auth.services";
import { clearAuth } from "../../../store/slices/authSlice";
import { clearUser } from "../../../store/slices/userSlice";
import { useForm } from "react-hook-form";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
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
  publisherNameRules,
  publishingHouseRules,
  emailRules,
  currentPasswordRules,
  newPasswordRules,
  confirmNewPasswordRules,
} from "./dashboardValidation";

// Register ChartJS components
ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const SkeletonMetric = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 skeleton-shimmer animate-fade-in">
    <div className="h-4 w-32 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded mb-4" />
    <div className="h-6 w-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden skeleton-shimmer animate-fade-in">
    <div className="p-4 space-y-3">
      <div className="w-full h-40 md:h-64 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded mb-3" />
      <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <div className="space-y-2">
          <div className="h-4 w-16 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
          <div className="h-3 w-20 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
        </div>
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
      </div>
    </div>
  </div>
);

const SkeletonListItem = () => (
  <div className="border border-gray-200 rounded-lg p-4 skeleton-shimmer animate-fade-in">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
        <div>
          <div className="h-4 w-40 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded mb-2" />
          <div className="h-3 w-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
        </div>
      </div>
      <div className="text-right">
        <div className="h-5 w-24 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded mb-2" />
        <div className="h-3 w-20 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
      </div>
    </div>
    <div className="flex justify-between items-center mt-3">
      <div className="h-3 w-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
      <div className="h-6 w-24 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-full" />
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [user, setUser] = useState({ firstname: "", lastname: "", email: "", publishingHouse: "" });
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loading, setLoading] = useState(true); // <-- loading state for initial API fetch
  const [tabLoading, setTabLoading] = useState(false); // for simulated loading when switching tabs

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      if (res?.success && res?.data?.user) {
        setUser(res.data.user);
        reset({
          firstname: res.data.user.firstname,
          lastname: res.data.user.lastname,
          publishingHouse: res.data.user.publishingHouse,
          email: res.data.user.email,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
      if (res?.data?.analytics) {
        setAnalytics(res.data.analytics);
      } else {
        setAnalytics(null);
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        firstname: data.firstname.trim(),
        lastname: data.lastname.trim(),
        publishingHouse: data.publishingHouse.trim(),
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
          publishingHouse: res.data.publishingHouse,
          email: res.data.email,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(res?.message || "Failed to update profile");
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

  // Handle tab change with small random artificial loading to show skeleton
  const handleTabChange = (tabKey) => {
    if (tabKey === activeTab) return;
    // show skeleton only for revenue and buyers (as requested)
    setActiveTab(tabKey);
    if (tabKey === 'revenue' || tabKey === 'buyers') {
      setTabLoading(true);
      const delay = Math.floor(Math.random() * (700 - 300 + 1)) + 300; // 300-700ms
      setTimeout(() => setTabLoading(false), delay);
    } else {
      // ensure tabLoading false for other tabs
      setTabLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header (static parts should remain visible even while loading dynamic content) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* --------- ONLY PROFILE PART: show skeleton while loading --------- */}
                {loading ? (
                  <>
                    <div className="rounded-full w-20 h-20 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 skeleton-shimmer animate-fade-in" />
                    <div className="space-y-2">
                      <div className="h-6 w-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer animate-fade-in" />
                      <div className="h-4 w-36 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer animate-fade-in" />
                      <div className="h-4 w-40 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded skeleton-shimmer animate-fade-in" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-purple-600 rounded-full w-20 h-20 flex items-center justify-center text-white text-3xl font-bold">
                      {user.firstname?.charAt(0)}{user.lastname?.charAt(0)}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {user.firstname} {user.lastname}
                      </h1>
                      <p className="text-gray-600 mt-1">{user.email}</p>
                      <p className="text-purple-600 font-medium mt-1">{user.publishingHouse}</p>
                    </div>
                  </>
                )}
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
                onClick={() => handleTabChange('overview')}
                className={`pb-4 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => handleTabChange('revenue')}
                className={`pb-4 font-medium transition-colors ${
                  activeTab === 'revenue'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Revenue Analytics
              </button>
              <button
                onClick={() => handleTabChange('buyers')}
                className={`pb-4 font-medium transition-colors ${
                  activeTab === 'buyers'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Buyer Interactions
              </button>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                  // show skeleton metrics while loading initial fetch
                  <>
                    <SkeletonMetric />
                    <SkeletonMetric />
                    <SkeletonMetric />
                    <SkeletonMetric />
                  </>
                ) : (
                  <>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Revenue</p>
                          <p className="text-2xl font-bold text-purple-600 mt-1">
                            ₹{analytics.totalRevenue.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-purple-100 rounded-full p-3">
                          <i className="fas fa-rupee-sign text-purple-600 text-xl"></i>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Books Sold</p>
                          <p className="text-2xl font-bold text-indigo-600 mt-1">
                            {analytics.totalBooksSold}
                          </p>
                        </div>
                        <div className="bg-indigo-100 rounded-full p-3">
                          <i className="fas fa-book text-indigo-600 text-xl"></i>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Active Books</p>
                          <p className="text-2xl font-bold text-green-600 mt-1">
                            {analytics.activeBooks}
                          </p>
                        </div>
                        <div className="bg-green-100 rounded-full p-3">
                          <i className="fas fa-check-circle text-green-600 text-xl"></i>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Books</p>
                          <p className="text-2xl font-bold text-gray-600 mt-1">
                            {analytics.totalBooks}
                          </p>
                        </div>
                        <div className="bg-gray-100 rounded-full p-3">
                          <i className="fas fa-layer-group text-gray-600 text-xl"></i>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Top Selling Books */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Top Selling Books</h2>
                {loading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <SkeletonListItem />
                      <SkeletonListItem />
                      <SkeletonListItem />
                    </div>
                    <div className="h-64">
                      <SkeletonCard />
                    </div>
                  </div>
                ) : (
                  <>
                    {analytics.topSellingBooks && analytics.topSellingBooks.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* List View */}
                        <div className="space-y-3">
                          {analytics.topSellingBooks.slice(0, 3).map((book, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full text-sm font-bold">
                                  {index + 1}
                                </span>
                                <div>
                                  <p className="font-medium text-gray-900">{book.title}</p>
                                  <p className="text-sm text-gray-500">{book.quantity} copies sold</p>
                                </div>
                              </div>
                              <p className="font-bold text-purple-600">₹{book.revenue.toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                        
                        {/* Bar Chart */}
                        <div className="h-64">
                          <Bar
                            data={{
                              labels: analytics.topSellingBooks.map(book => 
                                book.title.length > 20 ? book.title.substring(0, 20) + '...' : book.title
                              ),
                              datasets: [
                                {
                                  label: 'Revenue (₹)',
                                  data: analytics.topSellingBooks.map(book => book.revenue),
                                  backgroundColor: [
                                    'rgba(147, 51, 234, 0.8)',
                                    'rgba(99, 102, 241, 0.8)',
                                    'rgba(59, 130, 246, 0.8)',
                                    'rgba(34, 197, 94, 0.8)',
                                    'rgba(20, 184, 166, 0.8)',
                                  ],
                                  borderColor: [
                                    'rgb(147, 51, 234)',
                                    'rgb(99, 102, 241)',
                                    'rgb(59, 130, 246)',
                                    'rgb(34, 197, 94)',
                                    'rgb(20, 184, 166)',
                                  ],
                                  borderWidth: 2,
                                  borderRadius: 6,
                                },
                              ],
                            }}
                            options={{
                              indexAxis: 'y',
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: false,
                                },
                                tooltip: {
                                  callbacks: {
                                    label: function(context) {
                                      return `Revenue: ₹${context.parsed.x.toFixed(2)}`;
                                    },
                                    afterLabel: function(context) {
                                      const book = analytics.topSellingBooks[context.dataIndex];
                                      return `Copies Sold: ${book.quantity}`;
                                    }
                                  }
                                }
                              },
                              scales: {
                                x: {
                                  beginAtZero: true,
                                  ticks: {
                                    callback: function(value) {
                                      return '₹' + value;
                                    }
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No sales data available</p>
                    )}
                  </>
                )}
              </div>

              {/* Low Stock Alerts */}
              {!loading && analytics && analytics.lowStockBooks && analytics.lowStockBooks.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <i className="fas fa-exclamation-triangle text-amber-500"></i>
                    <h2 className="text-xl font-bold text-gray-900">Low Stock Alerts</h2>
                  </div>
                  <div className="space-y-2">
                    {analytics.lowStockBooks.map((book) => (
                      <div key={book._id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <p className="font-medium text-gray-900">{book.title}</p>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                          {book.quantity} left
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="space-y-8">
              {/* Revenue Trend - Line Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend (Last 6 Months)</h2>
                {(loading || (tabLoading && activeTab === 'revenue')) ? (
                  <SkeletonCard />
                ) : (
                  <>
                    {analytics.revenueData && analytics.revenueData.length > 0 ? (
                      <div className="h-80">
                        <Line
                          data={{
                            labels: analytics.revenueData.map(item => item.month),
                            datasets: [
                              {
                                label: 'Revenue (₹)',
                                data: analytics.revenueData.map(item => item.revenue),
                                borderColor: 'rgb(147, 51, 234)',
                                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                                tension: 0.4,
                                fill: true,
                                pointBackgroundColor: 'rgb(147, 51, 234)',
                                pointBorderColor: '#fff',
                                pointBorderWidth: 2,
                                pointRadius: 5,
                                pointHoverRadius: 7,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: true,
                                position: 'top',
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context) {
                                    return `Revenue: ₹${context.parsed.y.toFixed(2)}`;
                                  }
                                }
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  callback: function(value) {
                                    return '₹' + value;
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
                  </>
                )}
              </div>

              {/* Genre Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Genre Performance</h2>
                {(loading || (tabLoading && activeTab === 'revenue')) ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : (
                  <>
                    {analytics.genreBreakdown && analytics.genreBreakdown.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Doughnut Chart */}
                        <div className="flex flex-col items-center justify-center">
                          <div className="text-center mb-4">
                            <p className="text-sm font-medium text-gray-600">Revenue Distribution</p>
                            <p className="text-2xl font-bold text-purple-600">
                              ₹{analytics.genreBreakdown.reduce((sum, g) => sum + g.revenue, 0).toFixed(2)}
                            </p>
                          </div>
                          <div className="w-full max-w-sm h-64">
                            <Doughnut
                              data={{
                                labels: analytics.genreBreakdown.map(g => g.genre),
                                datasets: [
                                  {
                                    label: 'Revenue',
                                    data: analytics.genreBreakdown.map(g => g.revenue),
                                    backgroundColor: [
                                      'rgba(147, 51, 234, 0.8)',
                                      'rgba(99, 102, 241, 0.8)',
                                      'rgba(59, 130, 246, 0.8)',
                                      'rgba(34, 197, 94, 0.8)',
                                      'rgba(20, 184, 166, 0.8)',
                                    ],
                                    borderColor: [
                                      'rgb(147, 51, 234)',
                                      'rgb(99, 102, 241)',
                                      'rgb(59, 130, 246)',
                                      'rgb(34, 197, 94)',
                                      'rgb(20, 184, 166)',
                                    ],
                                    borderWidth: 2,
                                  },
                                ],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'bottom',
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function(context) {
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                                        return `${context.label}: ₹${context.parsed.toFixed(2)} (${percentage}%)`;
                                      }
                                    }
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>

                        {/* Bar Chart for Books Sold by Genre */}
                        <div className="flex flex-col">
                          <div className="text-center mb-4">
                            <p className="text-sm font-medium text-gray-600">Books Sold by Genre</p>
                            <p className="text-2xl font-bold text-indigo-600">
                              {analytics.genreBreakdown.reduce((sum, g) => sum + g.quantity, 0)} books
                            </p>
                          </div>
                          <div className="h-64">
                            <Bar
                              data={{
                                labels: analytics.genreBreakdown.map(g => g.genre),
                                datasets: [
                                  {
                                    label: 'Books Sold',
                                    data: analytics.genreBreakdown.map(g => g.quantity),
                                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                                    borderColor: 'rgb(99, 102, 241)',
                                    borderWidth: 2,
                                    borderRadius: 8,
                                  },
                                ],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    display: false,
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function(context) {
                                        return `Books Sold: ${context.parsed.y}`;
                                      },
                                      afterLabel: function(context) {
                                        const revenue = analytics.genreBreakdown[context.dataIndex].revenue;
                                        return `Revenue: ₹${revenue.toFixed(2)}`;
                                      }
                                    }
                                  }
                                },
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    ticks: {
                                      stepSize: 1,
                                    }
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No genre data available</p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'buyers' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Buyer Interactions</h2>
              {(loading || (tabLoading && activeTab === 'buyers')) ? (
                <div className="space-y-4">
                  <SkeletonListItem />
                  <SkeletonListItem />
                  <SkeletonListItem />
                </div>
              ) : (
                <>
                  {analytics && analytics.buyerInteractions && analytics.buyerInteractions.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.buyerInteractions.map((interaction, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center">
                                <i className="fas fa-user text-purple-600"></i>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{interaction.buyer.name}</p>
                                <p className="text-sm text-gray-500">{interaction.buyer.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-purple-600">₹{interaction.totalAmount.toFixed(2)}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(interaction.orderDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center ">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <i className="fas fa-book text-purple-500"></i>
                              <span>
                                {interaction.books.length === 1 
                                  ? interaction.books[0]
                                  : `${interaction.books[0]} +${interaction.books.length - 1} more`
                                }
                              </span>
                            </div>  
                            <div>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                interaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                                interaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {interaction.status}
                              </span>
                            </div>
                          </div>                  
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No buyer interactions yet</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                <button
                  onClick={() => setShowEditDialog(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    {...register("firstname", publisherNameRules("First name"))}
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
                    {...register("lastname", publisherNameRules("Last name"))}
                    className="w-full px-4 py-2 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none hover:shadow-md transition-shadow duration-200"
                  />
                  {(errors.lastname && (touchedFields.lastname || isSubmitted)) && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastname.message}</p>
                  )}
                </div>

                {/* Publishing House */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publishing House</label>
                  <input
                    {...register("publishingHouse", publishingHouseRules)}
                    className="w-full px-4 py-2 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none hover:shadow-md transition-shadow duration-200"
                  />
                  {(errors.publishingHouse && (touchedFields.publishingHouse || isSubmitted)) && (
                    <p className="text-red-500 text-sm mt-1">{errors.publishingHouse.message}</p>
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
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Change Password (Optional)</p>
                  
                  <div className="space-y-3">
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
                        {...register("confirmPassword", confirmNewPasswordRules(() => newPassword))}
                        className="w-full px-4 py-2 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none hover:shadow-md transition-shadow duration-200"
                      />
                      {(errors.confirmPassword && (touchedFields.confirmPassword || isSubmitted)) && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                      )}
                    </div>
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
