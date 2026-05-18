//client/src/pages/buyer/dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../../../services/buyer.services.js";
import BookCard from "./components/BookCard.jsx";
import HeroCarousel from "./components/HeroCarousel.jsx";
import AuctionCountdownCard from "./components/AuctionCountdownCard.jsx";
import AuctionActivityFeed from "./components/AuctionActivityFeed.jsx";
import ShelfViewToggle from "./components/ShelfViewToggle.jsx";
import ShelfView from "./components/ShelfView.jsx";
import DashboardSkeleton from "./components/skeletons/DashboardSkeleton.jsx";

const Dashboard = () => {
  const [data, setData] = useState({
    newlyBooks: [],
    mostSoldBooks: [],
    trendingBooks: [],
    featuredAuctions: [],
    ongoingAuctions: [],
    upcomingAuctions: [],
    recentBids: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");
        setLoading(true);
        const response = await getDashboard();
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.message || "Something went wrong");
        }
      } catch {
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <section className="pt-20 pb-8 bg-gradient-to-b from-purple-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroCarousel
            auctions={data.featuredAuctions}
            featuredBooks={data.newlyBooks.slice(0, 2)}
          />
        </div>
      </section>

      {(data.ongoingAuctions.length > 0 || data.upcomingAuctions.length > 0) && (
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <i className="fas fa-clock text-2xl text-purple-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Live & Upcoming Auctions
                  </h2>
                  <p className="text-gray-600">
                    Don't miss out on these exclusive opportunities
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/buyer/auction-page")}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                View All Auctions
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...data.ongoingAuctions, ...data.upcomingAuctions]
                .slice(0, 6)
                .map((auction) => (
                  <AuctionCountdownCard
                    key={auction._id}
                    auction={auction}
                    onClick={() =>
                      navigate(`/buyer/auction-ongoing/${auction._id}`)
                    }
                  />
                ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <i className="fas fa-sparkles text-2xl text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Newly Added Books
                  </h2>
                </div>
                <ShelfViewToggle view={viewMode} onViewChange={setViewMode} />
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {data.newlyBooks.slice(0, 6).map((book) => (
                    <BookCard
                      key={book._id}
                      book={book}
                      onClick={() =>
                        navigate(`/buyer/product-detail/${book._id}`)
                      }
                    />
                  ))}
                </div>
              ) : (
                <ShelfView
                  books={data.newlyBooks.slice(0, 6)}
                  onClick={(id) => navigate(`/buyer/product-detail/${id}`)}
                />
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <i className="fas fa-award text-2xl text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Most Sold Books
                  </h2>
                </div>
                <ShelfViewToggle view={viewMode} onViewChange={setViewMode} />
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {data.mostSoldBooks.slice(0, 6).map((book) => (
                    <BookCard
                      key={book._id}
                      book={book}
                      showSold
                      onClick={() =>
                        navigate(`/buyer/product-detail/${book._id}`)
                      }
                    />
                  ))}
                </div>
              ) : (
                <ShelfView
                  books={data.mostSoldBooks.slice(0, 6)}
                  onClick={(id) => navigate(`/buyer/product-detail/${id}`)}
                />
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <i className="fas fa-chart-line text-2xl text-orange-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Trending Now
                  </h2>
                </div>
                <ShelfViewToggle view={viewMode} onViewChange={setViewMode} />
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {data.trendingBooks.slice(0, 6).map((book, idx) => (
                    <BookCard
                      key={book._id}
                      book={book}
                      isTrending
                      idx={idx}
                      onClick={() =>
                        navigate(`/buyer/product-detail/${book._id}`)
                      }
                    />
                  ))}
                </div>
              ) : (
                <ShelfView
                  books={data.trendingBooks.slice(0, 6)}
                  onClick={(id) => navigate(`/buyer/product-detail/${id}`)}
                />
              )}
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <AuctionActivityFeed recentBids={data.recentBids || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;