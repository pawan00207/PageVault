//client/src/pages/buyer/dashboard/components/HeroCarousel.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HeroCarousel = ({ auctions = [], featuredBooks = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Combine auctions and featured books for carousel
  const slides = [
    ...auctions.slice(0, 3).map(auction => ({
      type: 'auction',
      id: auction._id,
      title: auction.title,
      author: auction.author,
      image: auction.image,
      currentPrice: auction.currentPrice || auction.basePrice,
      auctionEnd: auction.auctionEnd,
      description: auction.description,
      badge: 'LIVE AUCTION'
    })),
    ...featuredBooks.slice(0, 2).map(book => ({
      type: 'book',
      id: book._id,
      title: book.title,
      author: book.author,
      image: book.image,
      price: book.price,
      description: book.description,
      badge: 'NEW ARRIVAL'
    }))
  ];

  // Auto-advance carousel
  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleSlideClick = (slide) => {
    if (slide.type === 'auction') {
      navigate(`/buyer/auction-ongoing/${slide.id}`);
    } else {
      navigate(`/buyer/product-detail/${slide.id}`);
    }
  };

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-900 rounded-2xl overflow-hidden shadow-2xl group">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
        style={{
          backgroundImage: `url(${currentSlide.image})`,
          filter: 'blur(8px) brightness(0.4)'
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex items-center px-8 md:px-24">
        <div className="flex-1 max-w-2xl space-y-6 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            {currentSlide.type === 'auction' ? (
              <>
                <i className="fas fa-gavel text-yellow-400 animate-pulse" />
                <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">
                  {currentSlide.badge}
                </span>
              </>
            ) : (
              <>
                <i className="fas fa-fire text-orange-400" />
                <span className="text-orange-400 font-semibold text-sm uppercase tracking-wider">
                  {currentSlide.badge}
                </span>
              </>
            )}
          </div>

          {/* Title & Author */}
          <div>
            <h1 className="text-5xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
              {currentSlide.title}
            </h1>
            <p className="text-xl text-gray-300 italic">by {currentSlide.author}</p>
          </div>

          {/* Description */}
          <p className="text-gray-200 text-lg line-clamp-3 max-w-xl">
            {currentSlide.description || 'Discover this amazing book in our collection.'}
          </p>

          {/* Price/Auction Info */}
          <div className="flex items-center gap-6">
            {currentSlide.type === 'auction' ? (
              <>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Current Bid</p>
                  <p className="text-3xl font-bold text-yellow-400">₹{currentSlide.currentPrice?.toLocaleString('en-IN')}</p>
                </div>
                {currentSlide.auctionEnd && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-lg border border-red-500/30">
                    <i className="fas fa-clock text-red-400" />
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-red-300">Ends in</p>
                      <p className="text-sm font-semibold text-red-200">
                        {getTimeRemaining(currentSlide.auctionEnd)}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <p className="text-sm text-gray-400 mb-1">Price</p>
                <p className="text-3xl font-bold text-green-400">₹{currentSlide.price?.toLocaleString('en-IN')}</p>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => handleSlideClick(currentSlide)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {currentSlide.type === 'auction' ? 'Place Bid Now' : 'View Details'}
          </button>
        </div>

        {/* Book Cover Image */}
        <div className="hidden lg:block flex-shrink-0 ml-12">
          <div className="relative w-64 h-96 transform hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-lg blur-2xl" />
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="relative w-full h-full object-cover rounded-lg shadow-2xl border-4 border-white/10"
            />
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <i className="fas fa-chevron-left text-white text-xl" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <i className="fas fa-chevron-right text-white text-xl" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// Helper function to calculate time remaining
const getTimeRemaining = (endTime) => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end - now;

  if (diff <= 0) return 'Ended';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  
  return `${hours}h ${minutes}m`;
};

export default HeroCarousel;
