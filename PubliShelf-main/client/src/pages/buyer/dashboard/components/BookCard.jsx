//client/src/pages/buyer/dashboard/components/BookCard.jsx
import React from "react";

const BookCard = ({ book, onClick, showSold = false, isTrending = false, idx }) => {
  return (
    <div onClick={onClick}
     className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-[5px] hover:shadow-lg cursor-pointer">
      <div className="relative w-full h-64 bg-gray-100 flex items-center justify-center">
        <img src={book.image} alt={book.title} className="max-h-full max-w-full object-contain" />
        {isTrending && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
            #{idx + 1}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-lg font-semibold mb-1 truncate">{book.title}</h3>
        <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            {showSold && (
              <span className="text-purple-600 text-sm">Total Sold: {book.totalSold}</span>
            )}
            {!showSold && isTrending && (
              <span className="text-purple-600 text-sm">Trending</span>
            )}
            <span className="font-bold text-purple-600 text-sm">₹{book.price}</span>
            {book.quantity <= 0 && (
              <span className="text-red-600 text-xs font-semibold mt-1">Out of Stock</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;