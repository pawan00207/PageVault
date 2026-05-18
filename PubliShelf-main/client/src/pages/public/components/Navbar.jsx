import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../store/hooks";

const Navbar = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();  
  return (
  <nav className="fixed w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
              PubliShelf
            </span>
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={`${location.pathname === '/' ? 'bg-purple-50 text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'} px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors`}
          >
            Home
          </Link>
          <Link 
            to="/buyer/dashboard" 
            className={`${location.pathname === '/buyer/dashboard' ? 'bg-purple-50 text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'} px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors`}
          >
            Bookstores
          </Link>
          <Link 
            to="/about" 
            className={`${location.pathname === '/about' ? 'bg-purple-50 text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'} px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors`}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className={`${location.pathname === '/contact' ? 'bg-purple-50 text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'} px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors`}
          >
            Contact Us
          </Link>
          <Link 
            to="/#faq-section" 
            className={`text-gray-700 hover:text-purple-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors`}
          >
            FAQ
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              if (!isAuthenticated) {
                navigate("/auth/login");
              } else if (role === 'buyer') {
                navigate("/buyer/dashboard");
              } else if (role === 'publisher') {
                navigate("/publisher/dashboard");
              } else if (role === 'manager') {
                navigate("/manager/dashboard");
              } else {
                navigate("/");
              }
            }}
            className="bg-gradient-to-r hover:bg-gradient-to-l from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:-translate-y-[2px] transition-all duration-300"
          >
            {isAuthenticated ? "Dashboard" : "Join Now"}
          </button>
          <div className="relative group">
            <button className="md:hidden text-gray-700 hover:text-purple-600 transition-colors px-3 py-2">
              <img
                className="h-5 w-5"
                src="https://img.icons8.com/?size=100&id=3096&format=png&color=000000"
                alt="="
              />
            </button>
            <div className="absolute top-full right-1 w-32 bg-white shadow-lg rounded-lg py-2 hidden group-hover:block">
              <Link 
                to="/" 
                className={`block px-4 py-2 ${location.pathname === '/' ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'}`}
              >
                Home
              </Link>
              <Link 
                to="/buyer/dashboard" 
                className={`block px-4 py-2 ${location.pathname === '/buyer/dashboard' ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'}`}
              >
                Bookstores
              </Link>
              <Link 
                to="/about" 
                className={`block px-4 py-2 ${location.pathname === '/about' ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'}`}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className={`block px-4 py-2 ${location.pathname === '/contact' ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'}`}
              >
                Contact Us
              </Link>
              <Link 
                to="/#faq-section" 
                className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700"
              >
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
)};

export default Navbar;