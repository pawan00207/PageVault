import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearAuth } from "../../../store/slices/authSlice";
import { clearUser } from "../../../store/slices/userSlice";
import { clearCart } from "../../../store/slices/cartSlice";
import { clearWishlist } from "../../../store/slices/wishlistSlice";
import { useUser, useCart, useWishlist } from "../../../store/hooks";
import { logout } from "../../../services/auth.services";
import SearchAutocomplete from "./SearchAutocomplete";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../components/ui/AlertDialog";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q");

  const user = useUser();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const profileMenuRef = useRef(null);
  const buyerName = user.firstname || "Buyer";
  
  const isOnAuctionPage = location.pathname.includes("/auction");
  const buttonDestination = isOnAuctionPage ? "/buyer/dashboard" : "/buyer/auction-page";

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
    dispatch(clearCart());
    dispatch(clearWishlist());
    setShowLogoutDialog(false);
    navigate("/auth/login");
  };

  

  const showSearchBar = !["/buyer/checkout", "/buyer/profile"].includes(location.pathname);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const closeOnEscape = (e) => e.key === "Escape" && (setIsMobileMenuOpen(false), setIsSearchOpen(false));
    const closeOnClick = (e) => {};
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOnClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOnClick);
    };
  }, []);


  return (
    <nav className="font-sans fixed w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              PubliShelf
            </span>
          </Link>

          {/* ===== Desktop Section (unchanged) ===== */}
          <div className="flex items-center md:gap-8 mr-2 relative">
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              <Link 
                to="/buyer/dashboard" 
                className={`px-3 py-2 rounded-lg transition-all ${
                  location.pathname === '/buyer/dashboard'
                    ? 'bg-purple-50 text-purple-600 font-semibold'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              <Link 
                to={buttonDestination} 
                className={`px-3 py-2 rounded-lg transition-all ${
                  location.pathname.includes('/auction')
                    ? 'bg-purple-50 text-purple-600 font-semibold'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                {isOnAuctionPage ? "Bookstore" : "Auctions"}
              </Link>
              <Link 
                to="/about" 
                className={`px-3 py-2 rounded-lg transition-all ${
                  location.pathname === '/about'
                    ? 'bg-purple-50 text-purple-600 font-semibold'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className={`px-3 py-2 rounded-lg transition-all ${
                  location.pathname === '/contact'
                    ? 'bg-purple-50 text-purple-600 font-semibold'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                Contact
              </Link>
              <div className="relative group">
                <button className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all">
                  Categories
                </button>
                <div className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-lg py-2 hidden group-hover:block">
                  {["Fiction", "Non-Fiction", "Mystery", "Science Fiction", "Romance", "Thriller", "Other"].map((cat) => (
                    <Link
                      key={cat}
                      to={`/buyer/search?q=${encodeURIComponent(cat)}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Search */}
            <div className={`hidden md:block ${showSearchBar ? "opacity-100" : "opacity-0 max-w-[125px]"}`}>
              <SearchAutocomplete variant="desktop" initialQuery={q || ""} />
            </div>

            {/* Wishlist & Cart (Desktop) */}
            <Link to="/buyer/cart/#wishlist-section" className="relative hidden md:flex text-gray-700 hover:text-purple-600">
              <i className="far fa-heart text-lg"></i>
              {!!wishlistItems.length && (
                <span className="absolute -top-2 -right-4 bg-pink-700 text-white text-[0.65rem] rounded-full px-[5px]">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link to="/buyer/cart" className="relative hidden md:flex text-gray-700 hover:text-purple-600">
              <i className="fas fa-shopping-cart text-lg"></i>
              {!!cartItems.length && (
                <span className="absolute -top-2 -right-3 bg-purple-600 text-white text-[0.65rem] rounded-full px-[5px]">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* Profile (Desktop) */}
            <div className="relative group hidden md:block" ref={profileMenuRef}>
              <button className="flex items-center gap-2 font-medium text-gray-700">
                <i className="text-3xl fas fa-user-circle text-purple-600"></i>
                <span className="font-[550] md:scale-100 scale-0">{buyerName}</span>
              </button>
              <div
                className="absolute hidden group-hover:block top-full -right-6 w-48 bg-white shadow-lg rounded-lg py-2 transition-all duration-200"
              >
                <Link to="/buyer/profile" className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600">
                  <i className="fas fa-user mr-2"></i>
                  Your Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-red-600">
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </button>
              </div>
            </div>

            {/* ===== Mobile Section (Fixed & Enhanced) ===== */}
            <div className="flex md:hidden items-center gap-4">
              {/* Search Icon */}
              {showSearchBar && (
                <button
                  onClick={() => setIsSearchOpen((prev) => !prev)}
                  className="relative text-purple-600 text-xl transition-transform duration-300 hover:scale-110"
                >
                  <i
                    className={`fa-solid ${
                      isSearchOpen ? "fa-xmark rotate-180" : "fa-magnifying-glass"
                    } transition-transform duration-300 ease-in-out`}
                  ></i>
                </button>
              )}

              {/* Animated Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="relative w-8 h-8 flex flex-col justify-center items-center group"
              >
                <span
                  className={`block w-6 h-0.5 bg-purple-600 rounded transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
                ></span>
                <span
                  className={`block w-6 h-0.5 bg-purple-600 rounded transition-all duration-300 ease-in-out my-1 ${
                    isMobileMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
                <span
                  className={`block w-6 h-0.5 bg-purple-600 rounded transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                  }`}
                ></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search (input + suggestions) */}
      {isSearchOpen && showSearchBar && (
        <SearchAutocomplete
          variant="mobile"
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          initialQuery={q || ""}
        />
      )}

      {/* Mobile Menu Dropdown (slide-down) */}
      <div
        className={`md:hidden bg-white shadow-md rounded-b-xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isMobileMenuOpen ? "max-h-64 opacity-100 mt-2" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col px-6 py-3 space-y-3 text-gray-700">
          <Link to="/buyer/dashboard" className="hover:text-purple-600 transition-colors">
            Home
          </Link>
          <Link to={buttonDestination} className="hover:text-purple-600 transition-colors">
            {isOnAuctionPage ? "Bookstore" : "Auctions"}
          </Link>
          <Link to="/about" className="hover:text-purple-600 transition-colors">
            About
          </Link>
          <Link to="/contact" className="hover:text-purple-600 transition-colors">
            Contact
          </Link>
          <Link to="/buyer/profile" className="hover:text-purple-600 transition-colors">
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="text-left text-gray-700 hover:text-red-600 transition-colors"
          >
            Logout
          </button>
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

export default Navbar;