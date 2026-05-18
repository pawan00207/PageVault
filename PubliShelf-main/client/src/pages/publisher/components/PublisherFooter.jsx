import React from 'react';
import { Link } from 'react-router-dom';

const PublisherFooter = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-600">
        <p>© {new Date().getFullYear()} PubliShelf — Publisher Portal</p>
        <div className="flex items-center gap-4">
          <Link to="#" className="hover:text-purple-600">Terms</Link>
          <Link to="#" className="hover:text-purple-600">Privacy</Link>
          <Link to="#" className="hover:text-purple-600">Support</Link>
        </div>
      </div>
    </footer>
  );
};

export default PublisherFooter;
