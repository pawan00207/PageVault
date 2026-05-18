import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../../services/auth.services';
import { clearAuth } from '../../../store/slices/authSlice';
import { clearUser } from '../../../store/slices/userSlice';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/AlertDialog';

const AdminNavbar = ({ adminName, isSuperAdmin }) => {
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
    navigate("/admin/login");
  };

  const navLinks = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/publishers', label: 'Publishers' },
    { path: '/admin/buyers', label: 'Buyers' },
    { path: '/admin/managers', label: 'Managers' },
    { path: '/admin/products', label: 'Products' },
    { path: '/admin/settings', label: 'Settings' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/admin/dashboard" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                PubliShelf
              </span>
              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-600 text-xs font-semibold rounded">
                {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-2 mr-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg transition-all ${
                  isActive(link.path)
                    ? 'bg-purple-50 text-purple-600 font-semibold'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative group">
              <button className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors">
                <i className="text-3xl fas fa-user-circle text-purple-600"></i>
                <span className="font-[550]">{adminName}</span>
              </button>
              <div className="absolute hidden group-hover:block top-full -right-6 w-48 bg-white shadow-lg rounded-lg py-2 transition-all duration-200">
                <Link 
                  to="/admin/settings" 
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

          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative w-8 h-8 flex flex-col justify-center items-center"
            >
              <span className={`block w-6 h-0.5 bg-purple-600 rounded transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-purple-600 rounded transition-all duration-300 ease-in-out my-1 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`block w-6 h-0.5 bg-purple-600 rounded transition-all duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden bg-white shadow-md rounded-b-xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isMobileMenuOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col px-6 py-3 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`transition-colors ${isActive(link.path) ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <span className="font-medium">{adminName}</span>
              {isSuperAdmin && (
                <span className="ml-auto px-2 py-0.5 bg-purple-100 text-purple-600 text-xs font-semibold rounded">
                  Super Admin
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-left text-gray-700 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

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

export default AdminNavbar;
