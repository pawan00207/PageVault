//client/src/pages/buyer/auction/AuctionItemDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getAuctionItemDetail } from "../../../services/antiqueBook.services.js";

import AuctionItemDetailSkeleton from "./components/skeletons/AuctionItemDetailSkeleton";

const Countdown = ({ target, status }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const targetDate = new Date(target);
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft(status === "Ended" ? "Auction Ended" : "Awaiting Start");
        return true;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      return false;
    };

    if (calculateTimeLeft()) return;

    const intervalId = setInterval(() => {
      if (calculateTimeLeft()) clearInterval(intervalId);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [target, status]);

  return <span className="font-semibold">{timeLeft}</span>;
};

const AuctionItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [mountLoading, setMountLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAuctionItemDetailData();
  }, [id]);

  const fetchAuctionItemDetailData = async () => {
    try {
      const startTime = Date.now();
      const response = await getAuctionItemDetail(id);

      if (response.success) {
        setBook(response.data.book);
      } else {
        setError(response.message);
      }

      const loadDuration = Date.now() - startTime;
      const MIN_DURATION = 400;
      const remaining = Math.max(MIN_DURATION - loadDuration, 0);

      setTimeout(() => setMountLoading(false), remaining);

    } catch (err) {
      setError("Failed to fetch auction item");
      setMountLoading(false);
    }
  };

  const getAuctionStatus = () => {
    if (!book) return "Upcoming";

    const now = new Date();

    if (now < new Date(book.auctionStart)) return "Upcoming";
    if (now > new Date(book.auctionEnd)) return "Ended";

    return "Active";
  };

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  const status = getAuctionStatus();

  const buildMediaList = (bk) => {
    if (!bk) return [];
    const urls = [];
    if (bk.image) urls.push(bk.image);
    if (Array.isArray(bk.authenticationImages)) urls.push(...bk.authenticationImages);
    if (bk.authenticationImage) urls.push(bk.authenticationImage);
    if (Array.isArray(bk.files)) urls.push(...bk.files); // forward-compat if backend adds files

    const deduped = Array.from(new Set(urls.filter(Boolean)));
    const getType = (u) => {
      const ext = (u.split('?')[0].split('#')[0].split('.').pop() || '').toLowerCase();
      if (["jpg","jpeg","png","webp","gif","svg","bmp","avif"].includes(ext)) return 'image';
      if (["mp4","webm","ogg","mov","m4v"].includes(ext)) return 'video';
      if (ext === 'pdf') return 'pdf';
      return 'file';
    };
    return deduped.map((u) => ({ url: u, type: getType(u) }));
  };

  const [activeMediaIdx, setActiveMediaIdx] = useState(0);

  const media = buildMediaList(book);

  useEffect(() => {
    setActiveMediaIdx(0);
  }, [id, book?._id]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      <div className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Breadcrumb (always visible instantly) */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/buyer/dashboard" className="text-gray-700 hover:text-purple-600">
                  <i className="fas fa-home mr-2"></i>Home
                </Link>
              </li>

              <li className="flex items-center">
                <i className="fas fa-chevron-right text-gray-400 mx-2"></i>
                <Link to="/buyer/auction-page" className="text-gray-700 hover:text-purple-600">
                  Auctions
                </Link>
              </li>

              <li className="flex items-center">
                <i className="fas fa-chevron-right text-gray-400 mx-2"></i>
                <span className="text-gray-500">{book?.title || "Loading..."}</span>
              </li>
            </ol>
          </nav>

          {/* Skeleton OR actual detail content */}
          {mountLoading ? (
            <AuctionItemDetailSkeleton />
          ) : !book ? (
            <div className="text-center py-20">Auction item not found</div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                
                {/* Left — Media Gallery */}
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                    {media.length > 0 && media[activeMediaIdx]?.type === 'image' && (
                      <img
                        src={media[activeMediaIdx].url}
                        alt={book.title}
                        className="mx-auto w-[60%] h-[500px] object-contain transform transition-transform duration-500 hover:scale-101"
                      />
                    )}
                    {media.length > 0 && media[activeMediaIdx]?.type === 'video' && (
                      <div className="text-center">
                        <button
                          className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                          onClick={() => window.open(`/file-viewer?url=${encodeURIComponent(media[activeMediaIdx].url)}&title=${encodeURIComponent(book.title)}`, '_blank')}
                        >
                          Open Video in Viewer
                        </button>
                      </div>
                    )}
                    {media.length > 0 && media[activeMediaIdx]?.type === 'pdf' && (
                      <div className="text-center w-full">
                        <button
                          className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                          onClick={() => window.open(`/file-viewer?url=${encodeURIComponent(media[activeMediaIdx].url)}&title=${encodeURIComponent(book.title)}`, '_blank')}
                        >
                          Open PDF in Viewer
                        </button>
                      </div>
                    )}
                    {media.length > 0 && media[activeMediaIdx]?.type === 'file' && (
                      <div className="flex flex-col items-center justify-center h-[500px] w-full">
                        <i className="fas fa-file text-5xl text-gray-400"></i>
                        <button
                          onClick={() => window.open(`/file-viewer?url=${encodeURIComponent(media[activeMediaIdx].url)}&title=${encodeURIComponent(book.title)}`, '_blank')}
                          className="mt-3 px-3 py-2 bg-gray-700 text-white rounded text-sm hover:bg-gray-800"
                        >
                          Open in Viewer
                        </button>
                      </div>
                    )}
                    {media.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-[500px] w-full text-gray-400">
                        <i className="fas fa-image text-5xl mb-2"></i>
                        <span>No media available</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails / File chips */}
                  {media.length > 1 && (
                    <div className="flex overflow-x-auto gap-3">
                      {media.map((m, idx) => (
                        <button
                          key={m.url + idx}
                          onClick={() => setActiveMediaIdx(idx)}
                          className={`border rounded-lg p-1 flex-shrink-0 ${idx === activeMediaIdx ? 'border-purple-600 ring-1 ring-purple-300' : 'border-gray-200'}`}
                          title={`Media ${idx + 1}`}
                        >
                          {m.type === 'image' ? (
                            <img src={m.url} alt={`media-${idx}`} className="h-16 w-16 object-cover rounded" />
                          ) : m.type === 'video' ? (
                            <div className="h-16 w-16 rounded bg-black flex items-center justify-center text-white">
                              <i className="fas fa-play"></i>
                            </div>
                          ) : m.type === 'pdf' ? (
                            <div className="h-16 w-16 rounded bg-red-50 text-red-600 flex items-center justify-center">
                              <span className="text-xs font-semibold">PDF</span>
                            </div>
                          ) : (
                            <div className="h-16 w-16 rounded bg-gray-100 text-gray-600 flex items-center justify-center">
                              <i className="fas fa-file"></i>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right — Details */}
                <div className="space-y-5">
                  
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{book.title}</h1>
                    <p className="text-base md:text-lg text-gray-600 mt-1">{book.author}</p>
                    <p className="text-gray-600 text-sm">Genre: {book.genre}</p>
                    <p className="text-gray-600 text-sm">Condition: {book.condition}</p>
                  </div>

                  <div className="flex items-center space-x-3 text-sm">
                    <span
                      className={`font-medium ${
                        status === "Active"
                          ? "text-green-600"
                          : status === "Ended"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {status} Auction
                    </span>

                    {status !== "Ended" ? (
                      <span className="text-gray-600">
                        Ends in: <Countdown target={book.auctionEnd} status={status} />
                      </span>
                    ) : (
                      <span className="text-gray-600">Auction Ended</span>
                    )}
                  </div>

                  <div className="border-y border-gray-300 py-3">
                    <div className="flex items-baseline space-x-4">
                      <div>
                        <span className="text-3xl font-bold text-gray-900">
                          ₹{book.currentPrice || book.basePrice}
                        </span>
                        <p className="text-gray-600 text-xs">Current Bid</p>
                      </div>

                      <div>
                        <span className="text-lg text-gray-600">₹{book.basePrice}</span>
                        <p className="text-gray-600 text-xs">Base Price</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold">Description</h3>
                    <p className="text-gray-600 text-sm">{book.description}</p>
                  </div>

                  <button
                    onClick={() => navigate(`/buyer/auction-ongoing/${book._id}`)}
                    className={`w-full bg-purple-600 text-white px-4 py-3 rounded-lg ${
                      status === "Active"
                        ? "hover:bg-purple-700"
                        : "opacity-50 cursor-not-allowed"
                    } transition-colors flex items-center justify-center space-x-2 text-base`}
                    disabled={status !== "Active"}
                  >
                    <i className="fas fa-gavel"></i>
                    <span>Join Auction</span>
                  </button>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AuctionItemDetail;
