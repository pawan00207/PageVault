//client/src/pages/buyer/auction/AuctionOngoing.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAuctionOngoing } from "../../../services/antiqueBook.services.js";
import { useUser } from '../../../store/hooks';
import { toast } from 'sonner';
import { useAuctionSocket } from "../../../hooks/useAuctionSocket.js";

import AuctionOngoingSkeleton from "./components/skeletons/AuctionOngoingSkeleton";

const CountdownProgress = ({ auctionStart, auctionEnd, isActive }) => {
  const [countdown, setCountdown] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const end = new Date(auctionEnd);
      const start = new Date(auctionStart);

      if (now >= end) {
        setCountdown("Auction Ended");
        setProgress(100);
        return;
      }

      const diff = end - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);

      const total = end - start;
      const elapsed = now - start;
      setProgress(Math.min((elapsed / total) * 100, 100));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [auctionStart, auctionEnd]);

  if (!isActive) {
    return (
      <div>
        <p className="font-medium text-red-600">Ended Auction</p>
        <div className="space-y-1">
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Time Elapsed</span>
            <span>100%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-purple-600 h-1.5 rounded-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="font-medium text-green-600">
        Active Auction
        <span className="text-gray-600 ml-2"> Ends in: <span className="font-semibold">{countdown}</span> </span>
      </p>
      <div className="space-y-1">
        <div className="flex justify-between text-gray-600 text-sm">
          <span>Time Elapsed</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const AuctionOngoing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useUser();

  const [book, setBook] = useState(null);
  const [mountLoading, setMountLoading] = useState(true);

  const [error, setError] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [showBidModal, setShowBidModal] = useState(false);
  const [modalBidAmount, setModalBidAmount] = useState(0);
  const [formError, setFormError] = useState("");

  const [visibleBidsCount, setVisibleBidsCount] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Ref to prevent duplicate refetches during reconnection
  const isRefetchingRef = useRef(false);
  // Track if we've connected at least once (for onJoinedAuction logic)
  const hasConnectedRef = useRef(false);

  // Reconnect recovery: refetch auction state to sync missed updates
  const refetchAuctionState = async () => {
    // Prevent concurrent refetches
    if (isRefetchingRef.current) return;
    
    isRefetchingRef.current = true;
    
    try {
      const response = await getAuctionOngoing(id);
      if (response.success) {
        setBook(response.data.book);
        console.log("Auction state synced after reconnection");
      }
    } catch (err) {
      console.error("Failed to refetch auction state:", err);
    } finally {
      // Reset flag after a brief delay to allow state to settle
      setTimeout(() => {
        isRefetchingRef.current = false;
      }, 1000);
    }
  };

  // Socket.IO connection and real-time updates
  const { placeBid: socketPlaceBid, audienceCount, isBidding, isConnected } = useAuctionSocket({
    auctionId: id,
    user,
    enabled: !!book,
    onNewBid: (data) => {
      // Update book state with new bid
      if (data.fullState) {
        // Full state recovery after reconnection
        setBook(data.fullState);
      } else {
        // Incremental update for new bid
        setBook((prev) => ({
          ...prev,
          currentPrice: data.currentPrice,
          biddingHistory: [data.bid, ...(prev.biddingHistory || [])],
        }));
      }
      
      // Close modal and reset form after successful bid
      if (data.bid.bidder._id === user._id) {
        setShowBidModal(false);
        setBidAmount("");
      }
    },
    onConnect: ({ isReconnection }) => {
      // On reconnection, refetch latest auction state
      if (isReconnection) {
        refetchAuctionState();
      }
    },
    onJoinedAuction: (data) => {
      // Additional safety: refetch after successfully joining auction room
      // This ensures we have the latest state even if connect event missed updates
      if (hasConnectedRef.current) {
        refetchAuctionState();
      }
    },
  });
  
  // Update connection tracking
  useEffect(() => {
    if (isConnected) {
      hasConnectedRef.current = true;
    }
  }, [isConnected]);

  useEffect(() => {
    fetchFullAuction();
  }, [id]);



  const fetchFullAuction = async () => {
    try {
      const startTime = Date.now();
      const response = await getAuctionOngoing(id);

      if (response.success) {
        setBook(response.data.book);
      } else {
        setError(response.message);
      }

      const loadTime = Date.now() - startTime;
      const MIN_DURATION = 400;

      setTimeout(() => setMountLoading(false), Math.max(MIN_DURATION - loadTime, 0));
    } catch (err) {
      setError("Failed to fetch auction");
      setMountLoading(false);
    }
  };



  const handlePlaceBid = () => {
    const current = book.currentPrice || book.basePrice;
    const minBid = current + 100;
    const bid = parseInt(bidAmount);

    if (isNaN(bid) || bid < minBid) {
      setFormError(`Bid must be at least ₹${minBid} (minimum ₹100 increment)`);
      return;
    }

    setFormError("");
    setModalBidAmount(bid);
    setShowBidModal(true);
  };

  const confirmBid = () => {
    socketPlaceBid(modalBidAmount);
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await new Promise((r) => setTimeout(r, 500));
    setVisibleBidsCount((prev) => prev + 5);
    setIsLoadingMore(false);
  };

  if (error)
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  const isActive = book && new Date() < new Date(book.auctionEnd);

  const buildMediaList = (bk) => {
    if (!bk) return [];
    const urls = [];
    if (bk.image) urls.push(bk.image);
    if (Array.isArray(bk.authenticationImages)) urls.push(...bk.authenticationImages);
    if (bk.authenticationImage) urls.push(bk.authenticationImage);
    if (Array.isArray(bk.files)) urls.push(...bk.files); // forward-compat

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

  const sortedBids = [...(book?.biddingHistory || [])].sort(
    (a, b) => new Date(b.bidTime) - new Date(a.bidTime)
  );

  const highestBid =
    sortedBids.length > 0 ? Math.max(...sortedBids.map((b) => b.bidAmount)) : 0;

  const getTimeAgo = (date) => {
    const now = new Date();
    const seconds = Math.floor((now - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + (interval === 1 ? " year ago" : " years ago");
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + (interval === 1 ? " month ago" : " months ago");
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + (interval === 1 ? " day ago" : " days ago");
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + (interval === 1 ? " hour ago" : " hours ago");
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + (interval === 1 ? " minute ago" : " minutes ago");
    return "Just now";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      <div className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Breadcrumb — should be visible instantly */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/buyer/dashboard" className="text-gray-700 hover:text-purple-600">
                  <i className="fas fa-home mr-2"></i>Home
                </Link>
              </li>

              <li className="inline-flex items-center">
                <i className="fas fa-chevron-right text-gray-400 mx-2"></i>
                <Link to={`/buyer/auction-item-detail/${id}`} className="text-gray-700 hover:text-purple-600">
                  Auctions
                </Link>
              </li>

              <li className="inline-flex items-center">
                <i className="fas fa-chevron-right text-gray-400 mx-2"></i>
                <span className="text-gray-500">{book?.title || "Loading..."}</span>
              </li>
            </ol>
          </nav>

          {/* Dynamic Content Skeleton OR actual content */}
          {mountLoading ? (
            <AuctionOngoingSkeleton />
          ) : (
            <>

              {/* MAIN CONTENT */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">

                  {/* LEFT — Media Gallery */}
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                      {media.length > 0 && media[activeMediaIdx]?.type === 'image' && (
                        <img
                          src={media[activeMediaIdx].url}
                          alt={book.title}
                          className="mx-auto w-[70%] h-[500px] object-contain transform transition-transform duration-500 hover:scale-[1.01]"
                        />
                      )}
                      {media.length > 0 && media[activeMediaIdx]?.type === 'video' && (
                        <div className="text-center">
                          <button
                            className="px-3 py-2 bg紫-600 text-white rounded hover:bg-purple-700 text-sm"
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
                          <a href={media[activeMediaIdx].url} target="_blank" rel="noreferrer" className="mt-3 text-purple-600 underline">
                            Open File
                          </a>
                        </div>
                      )}

                      {isActive && (
                        <span className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
                          Live
                        </span>
                      )}
                    </div>
                    {media.length > 1 && (
                      <div className="relative">
                        <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth space-x-3">
                          {media.map((m, index) => (
                            <button
                              key={m.url + index}
                              onClick={() => setActiveMediaIdx(index)}
                              className={`border rounded-lg p-1 flex-shrink-0 ${index === activeMediaIdx ? 'border-purple-600 ring-1 ring-purple-300' : 'border-gray-200'}`}
                              title={`Media ${index + 1}`}
                            >
                              {m.type === 'image' ? (
                                <img
                                  src={m.url}
                                  alt={`Document ${index + 1}`}
                                  className="h-24 w-24 rounded-lg object-cover snap-center"
                                />
                              ) : m.type === 'video' ? (
                                <div className="h-24 w-24 rounded-lg bg-black text-white flex items-center justify-center">
                                  <i className="fas fa-play"></i>
                                </div>
                              ) : m.type === 'pdf' ? (
                                <div className="h-24 w-24 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                                  <span className="text-xs font-semibold">PDF</span>
                                </div>
                              ) : (
                                <div className="h-24 w-24 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                                  <i className="fas fa-file"></i>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT */}
                  <div className="space-y-5">

                    {/* Title */}
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{book.title}</h1>
                      <p className="text-base md:text-lg text-gray-600 mt-1">{book.author}</p>
                      <p className="text-gray-600 text-sm">Genre: {book.genre}</p>
                      <p className="text-gray-600 text-sm">Condition: {book.condition}</p>
                    </div>

                    {/* Countdown */}
                    <CountdownProgress
                      auctionStart={book.auctionStart}
                      auctionEnd={book.auctionEnd}
                      isActive={isActive}
                    />

                    {/* Live Audience Counter */}
                    {isActive && (
                      <>
                        {!isConnected || audienceCount === 0 ? (
                          <div className="h-[52px] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg skeleton-shimmer" />
                        ) : (
                          <div className="flex items-center justify-between bg-purple-50 rounded-lg px-4 py-3 border border-purple-200">
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-users text-purple-600"></i>
                              <span className="text-[15px] text-gray-700">
                                <span className="font-semibold text-purple-700">{audienceCount}</span> {audienceCount === 1 ? 'person' : 'people'} watching
                              </span>
                            </div>
                            <span className="flex items-center space-x-1">
                              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                              <span className="text-xs text-gray-600">Live</span>
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Price Block */}
                    <div className="border-y border-gray-300 py-3">
                      <div className="flex items-baseline space-x-4">
                        <div>
                          <span className="text-3xl font-bold text-gray-900">
                            ₹{(book.currentPrice || book.basePrice).toLocaleString("en-IN")}
                          </span>
                          <p className="text-gray-600 text-xs">Current Bid</p>
                        </div>
                        <div>
                          <span className="text-lg text-gray-600">
                            ₹{book.basePrice.toLocaleString("en-IN")}
                          </span>
                          <p className="text-gray-600 text-xs">Base Price</p>
                        </div>
                      </div>
                    </div>

                    {/* Bid Input */}
                    <div className="relative space-y-3 flex items-end gap-1">
                      <div className="relative w-full">
                        <label htmlFor="bid-amount" className="text-gray-600 text-sm">
                          Your Bid (₹)
                        </label>
                        <input
                          type="number"
                          id="bid-amount"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          min={(book.currentPrice || book.basePrice) + 100}
                          placeholder={`Enter bid (min ₹${(book.currentPrice || book.basePrice) + 100})`}
                          className="w-full px-3 py-3 mt-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          disabled={!isActive || isBidding}
                        />
                        <span className="absolute right-2 top-9 text-gray-400 cursor-pointer">
                          <i className="fas fa-info-circle text-xs"></i>
                        </span>
                      </div>

                      <button
                        onClick={handlePlaceBid}
                        disabled={!isActive || isBidding}
                        className={`w-full bg-purple-600 text-white px-4 h-[45px] rounded-lg ${
                          isActive && !isBidding
                            ? "hover:bg-purple-700"
                            : "bg-gray-400 cursor-not-allowed"
                        } transition-colors flex items-center justify-center space-x-2 text-sm mb-3`}
                      >
                        <i className="fas fa-gavel"></i>
                        <span>{!isActive ? "Auction Ended" : isBidding ? "Processing..." : "Place Bid"}</span>
                      </button>

                      {formError && (
                        <p className="absolute -bottom-3 left-0 text-red-600 text-xs">{formError}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold">Description</h3>
                      <p className="text-gray-600 text-sm">{book.description}</p>
                    </div>

                  </div>
                </div>
              </div>

              {/* BIDDING HISTORY */}
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Bidding History</h3>

                <div className="bg-white rounded-xl shadow-lg p-5">
                  {sortedBids.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-300">
                        <p className="text-sm text-gray-600">
                          Total Bids: <span className="font-semibold text-gray-800">{sortedBids.length}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Highest Bid:
                          <span className="font-bold text-purple-600">
                            ₹{highestBid.toLocaleString("en-IN")}
                          </span>
                        </p>
                      </div>

                      <div className="space-y-3">
                        {sortedBids.slice(0, visibleBidsCount).map((bid, index) => {
                          const bidder = bid.bidder || {};
                          const bidderName =
                            bidder.firstname && bidder.lastname
                              ? `${bidder.firstname} ${bidder.lastname}`
                              : "Anonymous";
                          const isCurrentUser = bidder?._id === user._id;
                          const bidTime = new Date(bid.bidTime);

                          return (
                            <div
                              key={bid._id}
                              className={`flex items-center justify-between border-b border-gray-300 pb-3 px-1 ${
                                isCurrentUser ? "border-l-4 border-blue-400 pl-2" : ""
                              } ${
                                index === 0 ? "bg-purple-50 rounded-md px-3 pt-2" : ""
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                      bidderName
                                    )}&background=${
                                      isCurrentUser ? "3b82f6" : "random"
                                    }&color=ffffff`}
                                    alt={bidderName}
                                    className="w-10 h-10 rounded-full shadow-sm"
                                  />
                                  {index === 0 && (
                                    <span className="absolute -top-1 -right-1 bg-purple-600 rounded-full w-4 h-4 flex items-center justify-center text-white text-xs">
                                      1
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {bidderName}{" "}
                                    {isCurrentUser && (
                                      <span className="text-blue-600 text-xs ml-1.5">(You)</span>
                                    )}
                                    {index === 0 && (
                                      <span className="text-purple-600 text-xs ml-1.5">
                                        (Top Bidder)
                                      </span>
                                    )}
                                  </p>

                                  <div className="flex items-center text-xs text-gray-500 gap-4">
                                    <span>{bidder.email || "N/A"}</span>
                                    <span title={bidTime.toLocaleString()}>
                                      {getTimeAgo(bidTime)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="font-bold text-purple-600 text-base">
                                  ₹{bid.bidAmount.toLocaleString("en-IN")}
                                </p>

                                {index === 1 && (
                                  <span className="text-xs text-gray-500">
                                    +₹
                                    {(bid.bidAmount - sortedBids[0].bidAmount).toLocaleString(
                                      "en-IN"
                                    )}{" "}
                                    needed to lead
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {sortedBids.length > visibleBidsCount && (
                        <div className="flex justify-center mt-4">
                          <button
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm flex items-center space-x-2 disabled:opacity-50"
                          >
                            {isLoadingMore ? (
                              <>
                                <i className="fas fa-spinner fa-spin text-xs"></i>
                                <span>Loading...</span>
                              </>
                            ) : (
                              <>
                                <i className="fas fa-chevron-down text-xs"></i>
                                <span>Load More</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-gray-600 mt-2">No bids yet.</p>
                      <p className="text-sm text-gray-500 mt-1">Be the first to place a bid!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* BID MODAL */}
              {showBidModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-5 w-full max-w-sm">
                    <h3 className="text-lg font-bold text-gray-900">Confirm Bid</h3>
                    <p className="text-gray-600 text-sm mt-2">
                      Place a bid of{" "}
                      <span className="font-bold text-purple-600">
                        ₹{modalBidAmount.toLocaleString("en-IN")}
                      </span>{" "}
                      for {book.title}?
                    </p>

                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        onClick={() => setShowBidModal(false)}
                        disabled={isBidding}
                        className={`px-3 py-1.5 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 text-sm ${
                          isBidding ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        Cancel
                      </button>

                      <button
                        onClick={confirmBid}
                        disabled={isBidding}
                        className={`px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm flex items-center space-x-1 ${
                          isBidding ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {isBidding && (
                          <i className="fas fa-spinner fa-spin text-xs"></i>
                        )}
                        <span>{isBidding ? "Placing Bid..." : "Confirm"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default AuctionOngoing;
