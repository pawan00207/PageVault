import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">PubliShelf</h3>
            <p className="text-sm">
              Your one-stop destination for discovering and purchasing the best books online.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/buyer/dashboard" className="hover:text-purple-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/buyer/cart" className="hover:text-purple-400 transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/buyer/auction-page" className="hover:text-purple-400 transition-colors">
                  Auctions
                </Link>
              </li>
              <li>
                <Link to="/buyer/profile" className="hover:text-purple-400 transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-purple-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-purple-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-purple-400 transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-purple-400 transition-colors">
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <Link to="#" className="hover:text-purple-400 transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </Link>
              <Link to="#" className="hover:text-purple-400 transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </Link>
              <Link to="#" className="hover:text-purple-400 transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </Link>
              <Link to="#" className="hover:text-purple-400 transition-colors">
                <i className="fab fa-linkedin text-xl"></i>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} PubliShelf. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;