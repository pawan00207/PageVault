
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const categories = [
  { key: "newlyBooks", label: "Newly Added" },
  { key: "mostSoldBooks", label: "Most Sold" },
  { key: "trendingBooks", label: "Trending" },
];

const SkeletonBookCard = () => (
  <div className="min-w-[220px] max-w-xs flex-shrink-0 bg-white rounded-xl shadow-md overflow-hidden skeleton-shimmer animate-fade-in">
    <div className="w-full h-56 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-1/2" />
      <div className="flex justify-between items-center">
        <div className="h-4 w-16 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
      </div>
    </div>
  </div>
);

const FeaturedBooks = ({ newlyBooks, mostSoldBooks, trendingBooks, loading }) => {
  const [activeTab, setActiveTab] = useState("newlyBooks");
  const carousels = {
    newlyBooks,
    mostSoldBooks,
    trendingBooks,
  };
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  // Scroll animation on tab change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [activeTab]);

  // Animate cards on scroll into view
  useEffect(() => {
    if (loading) return;
    const cards = document.querySelectorAll(".bookCardStyle");
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-home-fade-in");
          }
        });
      },
      { threshold: 0.2 }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [activeTab, newlyBooks, mostSoldBooks, trendingBooks, loading]);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Featured Books</h2>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 text-sm focus:outline-none
                  ${activeTab === cat.key
                    ? "bg-purple-600 text-white shadow"
                    : "bg-gray-100 text-purple-700 hover:bg-purple-50"}
                `}
                onClick={() => setActiveTab(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          {/* Carousel */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory book-carousel"
            style={{ scrollBehavior: "smooth" }}
          >
            {loading ? (
              <>
                <SkeletonBookCard />
                <SkeletonBookCard />
                <SkeletonBookCard />
                <SkeletonBookCard />
                <SkeletonBookCard />
              </>
            ) : (
              <>
                {carousels[activeTab].length === 0 && (
                  <div className="w-full text-center py-16 text-gray-400">No books found in this category.</div>
                )}
                {carousels[activeTab].map((book, idx) => (
                  <div
                    key={book._id}
                    className="bookCardStyle snap-start bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 cursor-pointer min-w-[220px] max-w-xs flex-shrink-0 animate-home-fade-in opacity-0"
                    onClick={() => navigate(`/buyer/product-detail/${book._id}`)}
                    style={{ transition: "box-shadow 0.3s, transform 0.3s" }}
                  >
                    <div className="relative">
                      <img src={book.image} alt={book.title} className="w-full h-56 object-contain rounded-t-xl" />
                      {activeTab === "trendingBooks" && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs animate-pulse">
                          #{idx + 1}
                        </div>
                      )}
                      {activeTab === "mostSoldBooks" && (
                        <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs">
                          Sold: {book.totalSold}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-1 truncate">{book.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-purple-600 text-sm">₹{book.price}</span>
                        <button
                          className="ml-2 text-gray-400 hover:text-purple-600 focus:outline-none"
                          title="Quick View"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/buyer/product-detail/${book._id}`);
                          }}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks;
