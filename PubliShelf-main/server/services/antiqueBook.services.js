import AntiqueBook from "../models/AntiqueBook.model.js";
import mongoose from "mongoose";
import logger from "../config/logger.js";

export const addBid = async (bookId, bidderId, bidAmount) => {
  try {
    const now = new Date();

    // Atomic update with all validation conditions in query
    const updatedBook = await AntiqueBook.findOneAndUpdate(
      {
        _id: bookId,
        status: "approved",
        auctionStart: { $lte: now },
        auctionEnd: { $gte: now },
        $expr: {
          $lt: [
            { $ifNull: ["$currentPrice", "$basePrice"] },
            bidAmount
          ]
        }
      },
      {
        $max: { currentPrice: bidAmount },
        $push: {
          biddingHistory: {
            $each: [{
              bidder: bidderId,
              bidAmount,
              bidTime: now
            }]
          }
        }
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('biddingHistory.bidder', 'firstname lastname email');

    if (!updatedBook) {
      logger.warn(`Bid rejected for book ${bookId}: bidAmount=${bidAmount}, bidderId=${bidderId}`);
      throw new Error("Bid no longer valid. Price may have changed.");
    }

    if (updatedBook.currentPrice !== bidAmount) {
      await AntiqueBook.updateOne(
        { _id: bookId },
        { $pull: { biddingHistory: { bidder: bidderId, bidAmount, bidTime: now } } }
      );
      logger.warn(`Bid race lost for book ${bookId}: bidAmount=${bidAmount}, currentPrice=${updatedBook.currentPrice}`);
      throw new Error("Bid no longer valid. A higher bid was placed.");
    }

    logger.info(`Bid accepted for book ${bookId}: bidAmount=${bidAmount}, bidderId=${bidderId}`);
    return updatedBook;
  } catch (error) {
    logger.error(`Error in addBid: ${error.message}`);
    throw error;
  }
};

export const createAntiqueBook = async (bookData) => {
  try {
    const newAntiqueBook = new AntiqueBook(bookData);
    return await newAntiqueBook.save();
  } catch (error) {
    console.error("Error creating antique book:", error);
    throw new Error("Failed to create antique book.");
  }
};

export const getOngoingAuctions = async () => {
  return await AntiqueBook.find({
    status: 'approved',
    auctionStart: { $lte: new Date() },
    auctionEnd: { $gte: new Date() },
  })
    .sort({ auctionEnd: 1 })
    .select('_id title author image auctionStart auctionEnd currentPrice basePrice')
    .lean();
};

export const getFutureAuctions = async () => {
  return await AntiqueBook.find({
    status: 'approved',
    auctionStart: { $gt: new Date() },
  })
    .sort({ auctionStart: 1 })
    .select('_id title author image auctionStart auctionEnd currentPrice basePrice')
    .lean();
};

export const getEndedAuctions = async () => {
  const docs = await AntiqueBook.find({
    status: 'approved',
    auctionEnd: { $lt: new Date() },
  })
    .sort({ auctionEnd: -1 })
    .populate('biddingHistory.bidder', 'firstname lastname')
    .lean();

  // Attach winner info if sold
  return docs.map((d) => {
    if (Array.isArray(d.biddingHistory) && d.biddingHistory.length > 0 && (d.currentPrice || 0) > 0) {
      // Determine highest bid; if tie, latest occurrence wins
      let winnerBid = d.biddingHistory[0];
      for (const bid of d.biddingHistory) {
        if (
          bid.bidAmount > winnerBid.bidAmount ||
          (bid.bidAmount === winnerBid.bidAmount && new Date(bid.bidTime) > new Date(winnerBid.bidTime))
        ) {
          winnerBid = bid;
        }
      }
      const name = winnerBid.bidder
        ? `${winnerBid.bidder.firstname || ''} ${winnerBid.bidder.lastname || ''}`.trim()
        : undefined;
      return {
        ...d,
        winnerBuyer: winnerBid.bidder ? { _id: winnerBid.bidder._id, name } : undefined,
        finalPrice: d.currentPrice || d.basePrice,
      };
    }
    return { ...d, finalPrice: d.currentPrice || d.basePrice };
  });
};

export const getAuctionItemById = async (bookId) => {
  const book = await AntiqueBook.findById(bookId)
    .populate("biddingHistory.bidder", "firstname lastname email")
    .lean();
  if (!book)
    throw new Error("Antique book not found");

  if (book.status !== 'approved')
    throw new Error("Auction not available");
  return book;
};

export const getAllAntiqueBooksWithStats = async () => {
  try {
    const antiqueBooks = await AntiqueBook.find()
      .populate("publisher", "firstname lastname publishingHouse")
      .populate("reviewedBy", "firstname lastname")
      .select("title author description genre image basePrice currentPrice auctionStart auctionEnd status biddingHistory publishedAt condition createdAt")
      .lean();

    const antiqueBooksWithStats = antiqueBooks.map((book) => {
      const now = new Date();
      const auctionStart = new Date(book.auctionStart);
      const auctionEnd = new Date(book.auctionEnd);

      let auctionStatus = "Pending";
      if (book.status === "rejected") {
        auctionStatus = "Rejected";
      } else if (book.status === "approved") {
        if (now < auctionStart) {
          auctionStatus = "Scheduled";
        } else if (now >= auctionStart && now <= auctionEnd) {
          auctionStatus = "Ongoing";
        } else if (now > auctionEnd) {
          auctionStatus = "Ended";
        }
      }

      const totalBids = book.biddingHistory?.length || 0;
      const uniqueBidders = book.biddingHistory ? new Set(book.biddingHistory.map((b) => b.bidder.toString())).size : 0;

      let winner = null;
      if (auctionStatus === "Ended" && totalBids > 0) {
        const winningBid = book.biddingHistory.reduce((highest, bid) =>
          bid.bidAmount > highest.bidAmount ? bid : highest
        );
        winner = winningBid.bidder;
      }

      return {
        ...book,
        publisherName: book.publisher?.publishingHouse || `${book.publisher?.firstname || ""} ${book.publisher?.lastname || ""}`.trim() || "Unknown",
        auction: {
          status: auctionStatus.toLowerCase(),
          auctionStatus,
          basePrice: book.basePrice || 0,
          currentPrice: book.currentPrice || book.basePrice || 0,
          auctionStart: book.auctionStart,
          auctionEnd: book.auctionEnd,
        },
        stats: {
          auctionStatus,
          totalBids,
          uniqueBidders,
          currentPrice: book.currentPrice || book.basePrice || 0,
          basePrice: book.basePrice || 0,
          winner,
        },
      };
    });

    return antiqueBooksWithStats;
  } catch (error) {
    console.error("Error in getAllAntiqueBooksWithStats:", error);
    throw error;
  }
};

export const getAntiqueBookDetailedAnalytics = async (antiqueBookId) => {
  try {
    const antiqueBook = await AntiqueBook.findById(antiqueBookId)
      .populate("publisher", "firstname lastname publishingHouse email")
      .populate("reviewedBy", "firstname lastname")
      .populate("biddingHistory.bidder", "firstname lastname email")
      .lean();

    if (!antiqueBook) {
      throw new Error("Antique book not found");
    }

    const now = new Date();
    const auctionStart = new Date(antiqueBook.auctionStart);
    const auctionEnd = new Date(antiqueBook.auctionEnd);

    let auctionStatus = "Pending";
    if (antiqueBook.status === "rejected") {
      auctionStatus = "Rejected";
    } else if (antiqueBook.status === "approved") {
      if (now < auctionStart) {
        auctionStatus = "Scheduled";
      } else if (now >= auctionStart && now <= auctionEnd) {
        auctionStatus = "Ongoing";
      } else if (now > auctionEnd) {
        auctionStatus = "Ended";
      }
    }

    const biddingHistory = antiqueBook.biddingHistory || [];
    const totalBids = biddingHistory.length;
    const uniqueBidders = new Set(biddingHistory.map((b) => b.bidder._id.toString())).size;

    let winner = null;
    let winningBid = null;
    if (auctionStatus === "Ended" && totalBids > 0) {
      winningBid = biddingHistory.reduce((highest, bid) =>
        bid.bidAmount > highest.bidAmount ? bid : highest
      );
      winner = winningBid.bidder;
    }

    const bidTrend = biddingHistory.map((bid, index) => ({
      bidNumber: index + 1,
      bidder: `${bid.bidder.firstname} ${bid.bidder.lastname}`,
      bidderId: bid.bidder._id,
      amount: bid.bidAmount,
      timestamp: bid.bidTime,
    }));

    const bidderStats = {};
    biddingHistory.forEach((bid) => {
      const bidderId = bid.bidder._id.toString();
      if (!bidderStats[bidderId]) {
        bidderStats[bidderId] = {
          bidder: bid.bidder,
          bidCount: 0,
          highestBid: 0,
          totalBidAmount: 0,
        };
      }
      bidderStats[bidderId].bidCount += 1;
      bidderStats[bidderId].highestBid = Math.max(bidderStats[bidderId].highestBid, bid.bidAmount);
      bidderStats[bidderId].totalBidAmount += bid.bidAmount;
    });

    const topBidders = Object.values(bidderStats)
      .sort((a, b) => b.highestBid - a.highestBid)
      .slice(0, 10)
      .map((stat) => ({
        bidderName: `${stat.bidder.firstname} ${stat.bidder.lastname}`,
        email: stat.bidder.email,
        bidCount: stat.bidCount,
        highestBid: stat.highestBid,
      }));

    const biddingHistoryFormatted = biddingHistory.map((bid) => ({
      bidderName: `${bid.bidder.firstname} ${bid.bidder.lastname}`,
      bidderEmail: bid.bidder.email,
      amount: bid.bidAmount,
      bidAmount: bid.bidAmount,
      timestamp: bid.bidTime,
    }));

    return {
      antiqueBook: {
        ...antiqueBook,
        publisherName: antiqueBook.publisher?.publishingHouse || `${antiqueBook.publisher?.firstname || ""} ${antiqueBook.publisher?.lastname || ""}`.trim(),
        reviewedByName: antiqueBook.reviewedBy ? `${antiqueBook.reviewedBy.firstname} ${antiqueBook.reviewedBy.lastname}` : null,
      },
      auction: {
        status: auctionStatus.toLowerCase(),
        auctionStatus,
        basePrice: antiqueBook.basePrice || 0,
        currentPrice: antiqueBook.currentPrice || antiqueBook.basePrice || 0,
        auctionStart: antiqueBook.auctionStart,
        auctionEnd: antiqueBook.auctionEnd,
      },
      stats: {
        auctionStatus,
        totalBids,
        uniqueBidders,
        currentPrice: antiqueBook.currentPrice || antiqueBook.basePrice || 0,
        basePrice: antiqueBook.basePrice || 0,
        priceIncrease: ((antiqueBook.currentPrice || antiqueBook.basePrice || 0) - (antiqueBook.basePrice || 0)),
        priceIncreasePercentage: antiqueBook.basePrice > 0 ? (((antiqueBook.currentPrice || antiqueBook.basePrice) - antiqueBook.basePrice) / antiqueBook.basePrice * 100).toFixed(2) : 0,
        auctionStart: antiqueBook.auctionStart,
        auctionEnd: antiqueBook.auctionEnd,
        winner: winner ? `${winner.firstname} ${winner.lastname}` : null,
        winnerEmail: winner?.email || null,
        winningAmount: winningBid?.bidAmount || null,
      },
      bidTrend,
      topBidders,
      biddingHistory: biddingHistoryFormatted,
      bidHistory: biddingHistoryFormatted,
    };
  } catch (error) {
    console.error("Error in getAntiqueBookDetailedAnalytics:", error);
    throw error;
  }
};