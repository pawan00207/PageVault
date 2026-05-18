//client/src/pages/buyer/dashboard/components/ShelfView.jsx
import React from "react";

const ShelfView = ({ books, onClick }) => {
  return (
    <div className="space-y-8">
      {/* Wooden Shelf */}
      <div className="relative">
        {/* Shelf Background */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-amber-800 to-amber-900 rounded-sm shadow-lg">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.2) 50%, transparent 100%)'
          }} />
        </div>

        {/* Books */}
        <div className="flex items-end justify-start gap-1 pb-12 px-4 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-gray-100">
          {books.map((book, idx) => (
            <div
              key={book._id}
              onClick={() => onClick(book._id)}
              className="group relative cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:z-10"
              style={{
                transform: `rotate(${Math.random() * 4 - 2}deg)`,
                animationDelay: `${idx * 50}ms`
              }}
            >
              {/* Book Spine */}
              <div
                className="relative h-64 w-12 bg-gradient-to-r shadow-lg rounded-sm group-hover:shadow-2xl transition-shadow overflow-hidden"
                style={{
                  backgroundColor: getBookColor(idx),
                  backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)'
                }}
              >
                {/* Title on Spine */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p
                    className="text-white text-xs font-bold px-1 text-center line-clamp-3"
                    style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      transform: 'rotate(180deg)'
                    }}
                  >
                    {book.title}
                  </p>
                </div>

                {/* Book Edge Detail */}
                <div className="absolute top-0 right-0 w-1 h-full bg-black/20" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30" />
              </div>

              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                  <p className="font-semibold">{book.title}</p>
                  <p className="text-gray-300">{book.author}</p>
                  <p className="text-purple-300 font-bold mt-1">₹{book.price}</p>
                </div>
                <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Shelf Shadow */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-b from-transparent to-black/20 blur-sm" />
      </div>
    </div>
  );
};

// Helper to generate consistent book colors
const getBookColor = (index) => {
  const colors = [
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#6366f1', // Indigo
    '#14b8a6', // Teal
  ];
  return colors[index % colors.length];
};

export default ShelfView;
