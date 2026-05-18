//client/src/pages/buyer/dashboard/components/ShelfViewToggle.jsx
import React from "react";

const ShelfViewToggle = ({ view, onViewChange }) => {
  return (
    <div className="inline-flex items-center gap-2 p-1 bg-gray-100 rounded-lg shadow-sm">
      <button
        onClick={() => onViewChange('grid')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
          view === 'grid'
            ? 'bg-white shadow-sm text-purple-600 font-semibold'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <i className="fas fa-th" />
        <span className="text-sm">Grid</span>
      </button>
      <button
        onClick={() => onViewChange('shelf')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
          view === 'shelf'
            ? 'bg-white shadow-sm text-purple-600 font-semibold'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <i className="fas fa-book" />
        <span className="text-sm">Shelf</span>
      </button>
    </div>
  );
};

export default ShelfViewToggle;
