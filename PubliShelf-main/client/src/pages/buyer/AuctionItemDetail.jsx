import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaHome, FaChevronRight, FaGavel } from "react-icons/fa";
import { getAuctionItemDetail } from "../../../services/antiqueBook.services.js";

const AuctionItemDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuctionItem();
  }, [id]);

  const fetchAuctionItem = async () => {
    try {
      setLoading(true);
      const response = await getAuctionItemDetail(id);
      if (response.success) {
        setBook(response.data.book);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to fetch auction item");
    } finally {
      setLoading(false);
    }
  };

  const getAuctionStatus = () => {
    const now = new Date();
    if (now < new Date(book.auctionStart)) return "Upcoming";
    if (now > new Date(book.auctionEnd)) return "Ended";
    return "Active";
  };

  const formatTimeRemaining = (endDate) => {
    return "00:00:00";
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!book) return <div className="min-h-screen flex items-center justify-center">Auction item not found</div>;

  const status = getAuctionStatus();

  return (
    <div className="bg-gray-50">
      <nav className="fixed w-full bg-white shadow-sm z-50">
        {/* ... */}
      </nav>

      <div className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex mb-6">
            <ol className="inline-flex items-center space-x-1">
              <li>
                <Link to="/buyer/dashboard" className="text-gray-700 hover:text-purple-600 flex items-center">
                  <FaHome className="mr-2" /> Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <FaChevronRight className="text-gray-400 mx-2" />
                  <Link to="/buyer/auction-page" className="text-gray-700 hover:text-purple-600">Auctions</Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <FaChevronRight className="text-gray-400 mx-2" />
                  <span className="text-gray-500">{book.title}</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="space-y-4">
                <img
                  src={book.image || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600"}
                  alt={book.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
              <div className="space-y-5">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
                  <p className="text-lg text-gray-600 mt-1">{book.author}</p>
                  <p className="text-gray-600 text-sm">Genre: {book.genre}</p>
                  <p className="text-gray-600 text-sm">Condition: {book.condition}</p>
                </div>

                <div className="flex items-center space-x-3 text-sm">
                  <span className={`font-medium ${status === "Active" ? "text-green-600" : status === "Ended" ? "text-red-600" : "text-yellow-600"}`}>
                    {status} Auction
                  </span>
                  {status !== "Ended" && (
                    <span className="text-gray-600">Ends in: <span className="font-semibold">{formatTimeRemaining(book.auctionEnd)}</span></span>
                  )}
                </div>

                <div className="border-t border-b py-3">
                  <div className="flex items-baseline space-x-4">
                    <div>
                      <span className="text-3xl font-bold text-gray-900">₹{book.currentPrice || book.basePrice}</span>
                      <p className="text-gray-600 text-xs">Current Bid</p>
                    </div>
                    <div>
                      <span className="text-lg text-gray-600">₹{book.basePrice}</span>
                      <p className="text-gray-600 text-xs">Base Price</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-semibold">Description</h3>
                  <p className="text-gray-600 text-sm">{book.description}</p>
                </div>

                <button
                  onClick={() => navigate(`/buyer/auction-ongoing/${book._id}`)}
                  disabled={status !== "Active"}
                  className={`w-full bg-purple-600 text-white py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition`}
                >
                  <FaGavel />
                  <span>{status === "Active" ? "Join Auction" : "Auction Not Active"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer class="footer">
          <div class="footer-container">
              <div class="footer-section">
                  <h3 class="footer-title">PubliShelf</h3>
                  <p class="footer-text">Your gateway to endless literary discoveries.</p>
              </div>
              <div class="footer-section">
                  <h4 class="footer-subtitle">Quick Links</h4>
                  <ul class="footer-links">
                      <li><a href="/about" class="footer-link">About Us</a></li>
                      <li><a href="/contact" class="footer-link">Contact</a></li>
                      <li><a href="#" class="footer-link">Terms of Service</a></li>
                      <li><a href="#" class="footer-link">Privacy Policy</a></li>
                  </ul>
              </div>
              <div class="footer-section">
                  <h4 class="footer-subtitle">Connect</h4>
                  <div class="footer-social">
                      <a href="#" class="footer-social-icon"><i class="fab fa-twitter"></i></a>
                      <a href="#" class="footer-social-icon"><i class="fab fa-facebook"></i></a>
                      <a href="#" class="footer-social-icon"><i class="fab fa-instagram"></i></a>
                      <a href="#" class="footer-social-icon"><i class="fab fa-linkedin"></i></a>
                  </div>
              </div>
              <div class="footer-section">
                  <h4 class="footer-subtitle">Newsletter</h4>
                  <form class="footer-newsletter">
                      <input type="email" placeholder="Enter your email" class="footer-newsletter-input"/>
                      <button class="footer-newsletter-btn">Subscribe</button>
                  </form>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default AuctionItemDetail;
