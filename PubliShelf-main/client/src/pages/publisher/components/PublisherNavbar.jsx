// client/src/pages/publisher/components/PublisherNavbar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../../services/auth.services';
import { clearAuth } from '../../../store/slices/authSlice';
import { clearUser } from '../../../store/slices/userSlice';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/AlertDialog';

const PublisherNavbar = ({ publisherName }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

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

  const navLinks = [
    { path: '/publisher/dashboard', label: 'Dashboard'},
    { path: '/publisher/active-books', label: 'Active Books'},
    { path: '/publisher/deleted-books', label: 'Deleted Books'},
    { path: '/publisher/auctions', label: 'Auctions'},
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed w-full bg-white shadow-sm z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/publisher/dashboard" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
                PubliShelf
              </span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  isActive(link.path)
                    ? 'bg-purple-50 text-purple-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative group">
              <button className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors">
                <i className="text-3xl fas fa-user-circle text-purple-600"></i>
                <span className="font-[550]">{publisherName}</span>
              </button>
              <div className="absolute hidden group-hover:block top-[90%] -right-6 w-48 bg-white shadow-lg rounded-lg py-2 mt-1 transition-all duration-200">
                <Link 
                  to="/publisher/dashboard" 
                  className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                >
                  <i className="fas fa-user mr-2"></i>
                  Your Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-red-600"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative w-8 h-8 flex flex-col justify-center items-center"
            >
              <span
                className={`block w-6 h-0.5 bg-purple-600 rounded transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              ></span>
              <span
                className={`block w-6 h-0.5 bg-purple-600 rounded transition-all duration-300 ease-in-out my-1 ${
                  isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}
              ></span>
              <span
                className={`block w-6 h-0.5 bg-purple-600 rounded transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              ></span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden bg-white shadow-md rounded-b-xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col px-6 py-3 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 transition-colors ${
                isActive(link.path)
                  ? 'text-purple-600 font-semibold'
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              <span>{link.label}</span>
            </Link>
          ))}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <i className="fas fa-user-circle text-2xl text-purple-600"></i>
              <span className="font-medium">{publisherName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-left text-red-600 hover:text-red-700 transition-colors font-medium"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
          </div>
        </div>
      </div>

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
    </nav>
  );
};

export default PublisherNavbar;
