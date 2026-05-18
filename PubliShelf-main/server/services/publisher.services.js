//services/publisher.services.js
import Publisher from "../models/Publisher.model.js";
import Book from "../models/Book.model.js";
import AntiqueBook from "../models/AntiqueBook.model.js";
import Order from "../models/Order.model.js";
import mongoose from "mongoose";

export const getPublisherById = async (publisherId) => {
  return await Publisher.findById(publisherId).populate({
    path: "books",
    options: { sort: { publishedAt: -1 } },
  });
};

export const addBookToPublisher = async (publisherId, bookId) => {
  const publisher = await Publisher.findById(publisherId);
  publisher.books.push(bookId);
  return await publisher.save();
};

export const getAllPublishers = async () => {
  return await Publisher.find().populate("books");
};

export const getPublisherByEmail = async (email) => {
  return await Publisher.findOne({ email });
};

export const createPublisher = async ({ firstname, lastname, publishingHouse, email, password }) => {
  const newPublisher = new Publisher({
    firstname,
    lastname,
    publishingHouse,
    email,
    password,
  });

  return await newPublisher.save();
};

export const deletePublisherById = async (publisherId) => {
  return await Publisher.findByIdAndDelete(publisherId);
};

export const togglePublisherBan = async (publisherId) => {
  const publisher = await Publisher.findById(publisherId);
  if (!publisher) {
    throw new Error("Publisher not found");
  }
  if (publisher.account?.status === "banned") {
    publisher.account = { status: "active", by: null, at: null, reason: null };
  } else {
    publisher.account = { status: "banned", by: null, at: new Date(), reason: publisher.account?.reason || null };
  }
  return await publisher.save();
};

// ==================== Admin Analytics ====================

/**
 * Get all publishers with their statistics for admin dashboard
 */
export const getAllPublishersWithStats = async () => {
  try {
    const publishers = await Publisher.find()
      .select("firstname lastname publishingHouse email moderation account createdAt")
      .lean();

    // Get statistics for each publisher
    const publishersWithStats = await Promise.all(
      publishers.map(async (publisher) => {
        const publisherId = publisher._id;

        // Count books (active and deleted)
        const [totalBooks, activeBooks, deletedBooks] = await Promise.all([
          Book.countDocuments({ publisher: publisherId }),
          Book.countDocuments({ publisher: publisherId, isDeleted: false }),
          Book.countDocuments({ publisher: publisherId, isDeleted: true }),
        ]);

        // Count antique books by status
        const [totalAntiques, pendingAntiques, approvedAntiques, rejectedAntiques] = await Promise.all([
          AntiqueBook.countDocuments({ publisher: publisherId }),
          AntiqueBook.countDocuments({ publisher: publisherId, status: "pending" }),
          AntiqueBook.countDocuments({ publisher: publisherId, status: "approved" }),
          AntiqueBook.countDocuments({ publisher: publisherId, status: "rejected" }),
        ]);

        // Calculate revenue from orders
        const revenueData = await Order.aggregate([
          { $match: { publishers: publisherId } },
          { $unwind: "$items" },
          { $match: { "items.publisher": publisherId } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$items.lineTotal" },
              totalBooksSold: { $sum: "$items.quantity" },
              orderCount: { $sum: 1 },
            },
          },
        ]);

        const revenue = revenueData.length > 0 ? revenueData[0] : { totalRevenue: 0, totalBooksSold: 0, orderCount: 0 };

        return {
          ...publisher,
          fullName: `${publisher.firstname} ${publisher.lastname}`,
          stats: {
            books: {
              total: totalBooks,
              active: activeBooks,
              deleted: deletedBooks,
            },
            antiqueBooks: {
              total: totalAntiques,
              pending: pendingAntiques,
              approved: approvedAntiques,
              rejected: rejectedAntiques,
            },
            revenue: {
              total: revenue.totalRevenue,
              booksSold: revenue.totalBooksSold,
              orderCount: revenue.orderCount,
            },
          },
        };
      })
    );

    return publishersWithStats;
  } catch (error) {
    console.error("Error in getAllPublishersWithStats:", error);
    throw error;
  }
};

/**
 * Get detailed analytics for a specific publisher (for admin view)
 */
export const getPublisherDetailedAnalytics = async (publisherId) => {
  try {
    const publisher = await Publisher.findById(publisherId)
      .select("firstname lastname publishingHouse email phoneNumber address gstNumber moderation account createdAt")
      .lean();

    if (!publisher) {
      throw new Error("Publisher not found");
    }

    const publisherObjectId = new mongoose.Types.ObjectId(publisherId);

    // Get all books with details
    const allBooks = await Book.find({ publisher: publisherId })
      .select("title author genre price quantity isDeleted publishedAt")
      .sort({ publishedAt: -1 })
      .lean();

    const activeBooks = allBooks.filter((book) => !book.isDeleted);
    const deletedBooks = allBooks.filter((book) => book.isDeleted);

    // Get all antique books categorized by status
    const [antiqueBooksPending, antiqueBooksApproved, antiqueBooksRejected] = await Promise.all([
      AntiqueBook.find({ publisher: publisherId, status: "pending" })
        .select("title author condition basePrice currentPrice status auctionStart auctionEnd createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      AntiqueBook.find({ publisher: publisherId, status: "approved" })
        .select("title author condition basePrice currentPrice status auctionStart auctionEnd createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      AntiqueBook.find({ publisher: publisherId, status: "rejected" })
        .select("title author condition basePrice currentPrice status rejectionReason createdAt")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // Get revenue analytics - last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      { $match: { publishers: publisherObjectId, createdAt: { $gte: sixMonthsAgo } } },
      { $unwind: "$items" },
      { $match: { "items.publisher": publisherObjectId } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$items.lineTotal" },
          booksSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Format monthly revenue
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthLabel = `${monthNames[month - 1]} ${year}`;
      const monthData = monthlyRevenue.find((m) => m._id.year === year && m._id.month === month);
      revenueData.push({
        month: monthLabel,
        revenue: monthData ? monthData.revenue : 0,
        booksSold: monthData ? monthData.booksSold : 0,
      });
    }

    // Get total revenue and stats
    const totalRevenueData = await Order.aggregate([
      { $match: { publishers: publisherObjectId } },
      { $unwind: "$items" },
      { $match: { "items.publisher": publisherObjectId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$items.lineTotal" },
          totalBooksSold: { $sum: "$items.quantity" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const totalStats =
      totalRevenueData.length > 0 ? totalRevenueData[0] : { totalRevenue: 0, totalBooksSold: 0, totalOrders: 0 };

    // Get recent orders
    const recentOrders = await Order.find({ publishers: publisherId })
      .select("items buyer createdAt status grandTotal")
      .populate({ path: "buyer", select: "firstname lastname email" })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const formattedRecentOrders = recentOrders.map((order) => {
      const publisherItems = order.items.filter((item) => item.publisher.toString() === publisherId);
      const publisherTotal = publisherItems.reduce((sum, item) => sum + item.lineTotal, 0);
      return {
        _id: order._id,
        buyer: order.buyer,
        items: publisherItems.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
        total: publisherTotal,
        status: order.status,
        orderDate: order.createdAt,
      };
    });

    // Get top selling books
    const topSellingBooks = await Order.aggregate([
      { $match: { publishers: publisherObjectId } },
      { $unwind: "$items" },
      { $match: { "items.publisher": publisherObjectId } },
      {
        $group: {
          _id: "$items.book",
          title: { $first: "$items.title" },
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.lineTotal" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    // Genre breakdown
    const genreBreakdown = await Book.aggregate([
      { $match: { publisher: publisherObjectId, isDeleted: false } },
      {
        $group: {
          _id: "$genre",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      publisher: {
        ...publisher,
        fullName: `${publisher.firstname} ${publisher.lastname}`,
      },
      books: {
        total: allBooks.length,
        active: activeBooks,
        deleted: deletedBooks,
      },
      antiqueBooks: {
        total: antiqueBooksPending.length + antiqueBooksApproved.length + antiqueBooksRejected.length,
        pending: antiqueBooksPending,
        approved: antiqueBooksApproved,
        rejected: antiqueBooksRejected,
      },
      revenue: {
        total: totalStats.totalRevenue,
        booksSold: totalStats.totalBooksSold,
        orderCount: totalStats.totalOrders,
        monthlyData: revenueData,
      },
      recentOrders: formattedRecentOrders,
      topSellingBooks,
      genreBreakdown: genreBreakdown.map((g) => ({
        genre: g._id || "Unknown",
        count: g.count,
      })),
    };
  } catch (error) {
    console.error("Error in getPublisherDetailedAnalytics:", error);
    throw error;
  }
};