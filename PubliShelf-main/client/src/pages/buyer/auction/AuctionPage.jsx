//client/src/pages/buyer/auction/AuctionPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuctionPage } from "../../../services/antiqueBook.services.js";
import Pagination from "../../../components/Pagination";
import SkeletonSectionLoader from "./components/skeletons/SkeletonSectionLoader";

const Countdown = ({ target, type }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const t = new Date(target);
      const diff = t - now;

      if (diff <= 0) {
        setTimeLeft(type === "end" ? "Auction Ended" : "Auction Started");
        return true;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % 1000) / 1000);

      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
      return false;
    };

    if (calculate()) return;
    const id = setInterval(() => {
      if (calculate()) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [target, type]);

  return <p className="text-sm font-semibold">{timeLeft}</p>;
};

const AuctionPage = () => {
  const navigate = useNavigate();

  const [auctions, setAuctions] = useState({
    ongoingAuctions: [],
    futureAuctions: [],
    endedAuctions: []
  });

  const [mountLoading, setMountLoading] = useState(true);
  const [loadingSection, setLoadingSection] = useState({
    ongoing: false,
    future: false,
    ended: false
  });

  const [error, setError] = useState("");

  const [ongoingPage, setOngoingPage] = useState(1);
  const [futurePage, setFuturePage] = useState(1);
  const [endedPage, setEndedPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const start = Date.now();
      const res = await getAuctionPage();

      if (res.success) setAuctions(res.data);
      else setError(res.message);

      const elapsed = Date.now() - start;
      const MIN = 400;
      const wait = Math.max(MIN - elapsed, 0);

      setTimeout(() => setMountLoading(false), wait);
    } catch {
      setError("Failed to fetch auctions");
      setMountLoading(false);
    }
  };

  const paginate = (items, page) =>
    items.slice((page - 1) * ITEMS_PER_PAGE, (page - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE);

  const scrollToTop = (sec) => {
    const el = document.getElementById(`${sec}-section`);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handlePageChange = (section, newPage) => {
    scrollToTop(section);

    setLoadingSection((prev) => ({ ...prev, [section]: true }));

    setTimeout(() => {
      if (section === "ongoing") setOngoingPage(newPage);
      else if (section === "future") setFuturePage(newPage);
      else if (section === "ended") setEndedPage(newPage);

      setLoadingSection((prev) => ({ ...prev, [section]: false }));
    }, 500);
  };

  const renderCards = (items, type) =>
    items.map((book) => (
      <div
        key={book._id}
        className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl"
      >
        <img src={book.image} className="w-full h-[260px] object-contain" alt={book.title} />

        <div className="px-4 py-2">
          <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
          <p className="text-gray-600 text-sm">{book.author}</p>

          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">
                {type === "future"
                  ? "Starting Bid"
                  : type === "ended"
                  ? "Final Price"
                  : "Current Bid"}
              </p>
              <p className="text-lg font-bold text-purple-600">
                ₹{book.currentPrice || book.basePrice || "Not sold"}
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-sm">
                {type === "future"
                  ? "Starts in"
                  : type === "ongoing"
                  ? "Ends in"
                  : "Status"}
              </p>

              {type === "ended" ? (
                <p className="text-sm font-semibold">
                  {book.currentPrice ? "Sold" : "Not sold"}
                </p>
              ) : (
                <Countdown
                  target={type === "ongoing" ? book.auctionEnd : book.auctionStart}
                  type={type === "ongoing" ? "end" : "start"}
                />
              )}
            </div>
          </div>

          <button
            onClick={() => navigate(`/buyer/auction-item-detail/${book._id}`)}
            className="mt-4 mb-1 w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            {type === "future" ? "View Details" : "View Auction"}
          </button>
        </div>
      </div>
    ));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <nav className="flex mb-6">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/buyer/dashboard" className="text-gray-700 hover:text-purple-600">
                  <i className="fas fa-home mr-2"></i>
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <i className="fas fa-chevron-right text-gray-400 mx-2"></i>
                <span className="text-gray-500">Auctions</span>
              </li>
            </ol>
          </nav>

          {/* --- ONGOING SECTION ALWAYS RENDERS --- */}
          <section id="ongoing-section">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Ongoing Auctions</h1>

            {mountLoading || loadingSection.ongoing ? (
              <SkeletonSectionLoader />
            ) : auctions.ongoingAuctions.length === 0 ? (
              <p className="text-gray-600">No ongoing auctions</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {renderCards(
                    paginate(auctions.ongoingAuctions, ongoingPage),
                    "ongoing"
                  )}
                </div>

                <Pagination
                  currentPage={ongoingPage}
                  totalPages={Math.ceil(
                    auctions.ongoingAuctions.length / ITEMS_PER_PAGE
                  )}
                  onPageChange={(p) => handlePageChange("ongoing", p)}
                />
              </>
            )}
          </section>

          {/* --- FUTURE SECTION ALWAYS RENDERS --- */}
          <section id="future-section">
            <h1 className="text-3xl font-bold text-gray-900 mt-12 mb-8">
              Upcoming Auctions
            </h1>

            {mountLoading || loadingSection.future ? (
              <SkeletonSectionLoader />
            ) : auctions.futureAuctions.length === 0 ? (
              <p className="text-gray-600">No upcoming auctions</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {renderCards(
                    paginate(auctions.futureAuctions, futurePage),
                    "future"
                  )}
                </div>

                <Pagination
                  currentPage={futurePage}
                  totalPages={Math.ceil(
                    auctions.futureAuctions.length / ITEMS_PER_PAGE
                  )}
                  onPageChange={(p) => handlePageChange("future", p)}
                />
              </>
            )}
          </section>

          {/* --- ENDED SECTION ALWAYS RENDERS --- */}
          <section id="ended-section">
            <h1 className="text-3xl font-bold text-gray-900 mt-12 mb-8">
              Past Auctions
            </h1>

            {mountLoading || loadingSection.ended ? (
              <SkeletonSectionLoader />
            ) : auctions.endedAuctions.length === 0 ? (
              <p className="text-gray-600">No past auctions</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {renderCards(
                    paginate(auctions.endedAuctions, endedPage),
                    "ended"
                  )}
                </div>

                <Pagination
                  currentPage={endedPage}
                  totalPages={Math.ceil(
                    auctions.endedAuctions.length / ITEMS_PER_PAGE
                  )}
                  onPageChange={(p) => handlePageChange("ended", p)}
                />
              </>
            )}
          </section>

        </div>
      </div>
    </div>
  );
};

export default AuctionPage;