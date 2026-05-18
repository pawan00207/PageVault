const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    pages.push(1);  
    if (showEllipsisStart) {
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++)
        if (i > 1 && i < totalPages) pages.push(i);
    } else 
      for (let i = 2; i <= Math.min(5, totalPages - 1); i++)
        pages.push(i);

    if (showEllipsisEnd)
      pages.push('...');
    else if (!showEllipsisStart && totalPages > 6) {
      const lastShown = pages[pages.length - 1];
      if (typeof lastShown === 'number' && lastShown < totalPages - 1)
        pages.push('...');
    }

    if (totalPages > 1 && pages[pages.length - 1] !== totalPages)
      pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center mt-8">
      <nav className="flex items-center space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-[6px] rounded-lg transition-colors ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
          }`}
        >
          ← Prev
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-[6px] text-gray-400">
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-[6px] rounded-lg transition-colors ${
                currentPage === page
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-[6px] rounded-lg transition-colors ${
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
          }`}
        >
          Next →
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
