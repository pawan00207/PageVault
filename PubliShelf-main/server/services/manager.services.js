// services/manager.services.js
import Manager from "../models/Manager.model.js";
import Book from "../models/Book.model.js";
import Publisher from "../models/Publisher.model.js";
import AntiqueBook from "../models/AntiqueBook.model.js";
import Order from "../models/Order.model.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// ===== Manager Profile Services =====

export const getManagerById = async (managerId) => {
  try {
    const manager = await Manager.findById(managerId).select("-password").lean();
    return manager;
  } catch (error) {
    console.error("Error fetching manager by ID:", error);
    throw new Error("Error fetching manager");
  }
};

export const createManager = async (managerData) => {
  try {
    const { firstname, lastname, email, password } = managerData;
    const existingManager = await Manager.findOne({ email });
    if (existingManager) {
      throw new Error("Email already registered");
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newManager = new Manager({
      firstname,
      lastname,
      email,
      password: hashedPassword
    });
    
    await newManager.save();
    const { password: _pw, ...managerWithoutPassword } = newManager.toObject();
    return managerWithoutPassword;
  } catch (error) {
    console.error("Error creating manager:", error);
    throw error;
  }
};

export const updateManagerProfile = async (managerId, updates) => {
  try {
    const { firstname, lastname, email, currentPassword, newPassword } = updates;
    const manager = await Manager.findById(managerId);
    
    if (!manager) {
      throw new Error("Manager not found");
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, manager.password);
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }
    
    // Update basic info
    if (firstname) manager.firstname = firstname;
    if (lastname) manager.lastname = lastname;
    if (email) manager.email = email;
    
    // Update password if new password provided
    if (newPassword) {
      manager.password = await bcrypt.hash(newPassword, 10);
    }
    
    manager.updatedAt = Date.now();
    await manager.save();
    
    const { password: _pw, ...managerWithoutPassword } = manager.toObject();
    return managerWithoutPassword;
  } catch (error) {
    console.error("Error updating manager profile:", error);
    throw error;
  }
};

// ===== Book Management Services =====

export const getAllPendingBooks = async () => {
  try {
    // In a real scenario, books would have a 'status' field
    // For now, we'll return newly published books as "pending"
    const books = await Book.find({ isDeleted: false })
      .populate("publisher", "firstname lastname publishingHouse email")
      .sort({ publishedAt: -1 })
      .lean();
    return books;
  } catch (error) {
    console.error("Error fetching pending books:", error);
    throw new Error("Error fetching pending books");
  }
};

export const getAllApprovedBooks = async () => {
  try {
    const books = await Book.find({ isDeleted: false, quantity: { $gt: 0 } })
      .populate("publisher", "firstname lastname publishingHouse email")
      .sort({ publishedAt: -1 })
      .lean();
    return books;
  } catch (error) {
    console.error("Error fetching approved books:", error);
    throw new Error("Error fetching approved books");
  }
};

export const getAllRejectedBooks = async () => {
  try {
    // Deleted books treated as rejected
    const books = await Book.find({ isDeleted: true })
      .populate("publisher", "firstname lastname publishingHouse email")
      .sort({ publishedAt: -1 })
      .lean();
    return books;
  } catch (error) {
    console.error("Error fetching rejected books:", error);
    throw new Error("Error fetching rejected books");
  }
};

export const approveBook = async (bookId) => {
  try {
    const book = await Book.findByIdAndUpdate(
      bookId,
      { isDeleted: false },
      { new: true }
    ).populate("publisher", "firstname lastname publishingHouse");
    return book;
  } catch (error) {
    console.error("Error approving book:", error);
    throw new Error("Error approving book");
  }
};

export const rejectBook = async (bookId, reason) => {
  try {
    const book = await Book.findByIdAndUpdate(
      bookId,
      { isDeleted: true, rejectionReason: reason || "Quality standards not met" },
      { new: true }
    ).populate("publisher", "firstname lastname publishingHouse");
    return book;
  } catch (error) {
    console.error("Error rejecting book:", error);
    throw new Error("Error rejecting book");
  }
};

export const flagBook = async (bookId, remarks) => {
  try {
    const book = await Book.findByIdAndUpdate(
      bookId,
      { flagged: true, flagRemarks: remarks || "Requires review" },
      { new: true }
    ).populate("publisher", "firstname lastname publishingHouse");
    return book;
  } catch (error) {
    console.error("Error flagging book:", error);
    throw new Error("Error flagging book");
  }
};

// ===== Auction Book Management Services =====

export const getAllPendingAuctions = async () => {
  try {
    const auctions = await AntiqueBook.find({ status: "pending" })
      .populate("publisher", "firstname lastname publishingHouse email")
      .sort({ createdAt: -1 })
      .lean();
    return auctions;
  } catch (error) {
    console.error("Error fetching pending auctions:", error);
    throw new Error("Error fetching pending auctions");
  }
};

export const getAllApprovedAuctions = async (managerId) => {
  try {
    if (!managerId) {
      // Guard against undefined causing unintended matches in Mongo
      return [];
    }
    const auctions = await AntiqueBook.find({ 
      status: "approved",
      reviewedBy: managerId 
    })
      .populate("publisher", "firstname lastname publishingHouse email")
      .sort({ createdAt: -1 })
      .lean();
    return auctions;
  } catch (error) {
    console.error("Error fetching approved auctions:", error);
    throw new Error("Error fetching approved auctions");
  }
};

export const getAllRejectedAuctions = async () => {
  try {
    const auctions = await AntiqueBook.find({ status: "rejected" })
      .populate("publisher", "firstname lastname publishingHouse email")
      .sort({ createdAt: -1 })
      .lean();
    return auctions;
  } catch (error) {
    console.error("Error fetching rejected auctions:", error);
    throw new Error("Error fetching rejected auctions");
  }
};

export const getAuctionById = async (auctionId) => {
  try {
    const auction = await AntiqueBook.findById(auctionId)
      .populate("publisher", "firstname lastname publishingHouse email")
      .lean();
    if (!auction) {
      throw new Error("Auction not found");
    }
    return auction;
  } catch (error) {
    console.error("Error fetching auction by ID:", error);
    throw new Error("Error fetching auction details");
  }
};

export const approveAuction = async (auctionId, managerId) => {
  try {
    const auction = await AntiqueBook.findByIdAndUpdate(
      auctionId,
      { status: "approved", rejectionReason: null, reviewedBy: managerId },
      { new: true }
    ).populate("publisher", "firstname lastname publishingHouse");
    return auction;
  } catch (error) {
    console.error("Error approving auction:", error);
    throw new Error("Error approving auction");
  }
};

export const rejectAuction = async (auctionId, reason, managerId) => {
  try {
    const auction = await AntiqueBook.findByIdAndUpdate(
      auctionId,
      { status: "rejected", rejectionReason: reason || "Does not meet auction criteria", reviewedBy: managerId },
      { new: true }
    ).populate("publisher", "firstname lastname publishingHouse");
    return auction;
  } catch (error) {
    console.error("Error rejecting auction:", error);
    throw new Error("Error rejecting auction");
  }
};

export const getAuctionsOverview = async (managerId) => {
  try {
    const now = new Date();
    
    // Always filter by managerId - only show manager's own activity
    if (!managerId) {
      // Return empty data if no managerId provided
      return {
        kpis: { total: 0, pending: 0, approved: 0, rejected: 0, active: 0 },
        recent: { approved: [], rejected: [] }
      };
    }

    const baseFilter = { reviewedBy: managerId };

    // KPI Counts - only for this manager's reviewed auctions
    const total = await AntiqueBook.countDocuments(baseFilter);
    const pending = await AntiqueBook.countDocuments({ ...baseFilter, status: "pending" });
    const approved = await AntiqueBook.countDocuments({ ...baseFilter, status: "approved" });
    const rejected = await AntiqueBook.countDocuments({ ...baseFilter, status: "rejected" });
    const active = await AntiqueBook.countDocuments({
      ...baseFilter,
      status: "approved",
      auctionStart: { $lte: now },
      auctionEnd: { $gte: now }
    });

    // Recent Approved (last 6)
    const approvedFilter = { ...baseFilter, status: "approved" };
    const recentApproved = await AntiqueBook.find(approvedFilter)
      .select("title author image genre basePrice auctionStart auctionEnd status publisher")
      .populate("publisher", "firstname lastname publishingHouse")
      .sort({ updatedAt: -1 })
      .limit(6)
      .lean();

    // Recent Rejected (last 6)
    const rejectedFilter = { ...baseFilter, status: "rejected" };
    const recentRejected = await AntiqueBook.find(rejectedFilter)
      .select("title author image genre basePrice auctionStart auctionEnd status rejectionReason publisher")
      .populate("publisher", "firstname lastname publishingHouse")
      .sort({ updatedAt: -1 })
      .limit(6)
      .lean();

    return {
      kpis: {
        total,
        pending,
        approved,
        rejected,
        active
      },
      recent: {
        approved: recentApproved,
        rejected: recentRejected
      }
    };
  } catch (error) {
    console.error("Error fetching auctions overview:", error);
    throw new Error("Error fetching auctions overview");
  }
};

// ===== Publisher Management Services =====

export const getAllPendingPublishers = async () => {
  try {
    // Pending: not verified/approved AND not banned
    // Support both new schema (moderation.status) and legacy (isVerified)
    const filter = {
      $and: [
        {
          $or: [
            { "moderation.status": "pending" },
            { moderation: { $exists: false } },
            { "moderation.status": { $exists: false } },
            { "moderation.status": { $ne: "approved" } }
          ]
        },
        {
          $or: [
            { isVerified: { $ne: true } },
            { isVerified: { $exists: false } }
          ]
        },
        {
          $or: [
            { "account.status": { $ne: "banned" } },
            { account: { $exists: false } },
            { "account.status": { $exists: false } }
          ]
        },
        {
          $or: [
            { banned: { $ne: true } },
            { banned: { $exists: false } }
          ]
        }
      ],
    };

    const pendingPublishers = await Publisher.find(filter)
      .select("firstname lastname email publishingHouse books moderation account createdAt updatedAt verifiedAt bannedAt banReason isVerified banned")
      .populate("books")
      .sort({ createdAt: -1 })
      .lean();
    return pendingPublishers;
  } catch (error) {
    console.error("Error fetching pending publishers:", error);
    throw new Error("Error fetching pending publishers");
  }
};

export const getAllActivePublishers = async (managerId) => {
  try {
    if (!managerId) return [];
    // Active: verified/approved AND attributed to this manager AND not banned
    // Support both new schema (moderation.by) and legacy (verifiedBy)
    const filter = {
      $and: [
        {
          $or: [
            { $and: [ { "moderation.status": "approved" }, { "moderation.by": managerId } ] },
            { $and: [ { isVerified: true }, { verifiedBy: managerId } ] }
          ]
        },
        {
          $or: [
            { "account.status": { $ne: "banned" } },
            { account: { $exists: false } },
            { "account.status": { $exists: false } }
          ]
        },
        {
          $or: [
            { banned: { $ne: true } },
            { banned: { $exists: false } }
          ]
        }
      ],
    };

    const activePublishers = await Publisher.find(filter)
      .select("firstname lastname email publishingHouse books moderation account createdAt updatedAt verifiedAt bannedAt banReason isVerified banned verifiedBy")
      .populate("books")
      .sort({ "moderation.at": -1, verifiedAt: -1, updatedAt: -1 })
      .lean();
    return activePublishers;
  } catch (error) {
    console.error("Error fetching active publishers:", error);
    throw new Error("Error fetching active publishers");
  }
};

export const getAllBannedPublishers = async (managerId) => {
  try {
    if (!managerId) return [];
    // Banned: those who are banned AND were approved/verified by this manager
    // Support both new schema and legacy fields
    const filter = {
      $and: [
        {
          $or: [
            { "account.status": "banned" },
            { banned: true }
          ]
        },
        {
          $or: [
            { $and: [ { "moderation.status": "approved" }, { "moderation.by": managerId } ] },
            { $and: [ { isVerified: true }, { verifiedBy: managerId } ] }
          ]
        }
      ]
    };

    const bannedPublishers = await Publisher.find(filter)
      .select("firstname lastname email publishingHouse books moderation account createdAt updatedAt bannedAt banReason banned isVerified verifiedBy")
      .populate("books")
      .sort({ "account.at": -1, bannedAt: -1, updatedAt: -1 })
      .lean();
    return bannedPublishers;
  } catch (error) {
    console.error("Error fetching banned publishers:", error);
    throw new Error("Error fetching banned publishers");
  }
};

export const approvePublisher = async (publisherId, managerId) => {
  try {
    const publisher = await Publisher.findByIdAndUpdate(
      publisherId,
      { 
        moderation: { status: "approved", by: managerId, at: new Date(), reason: null },
        account: { status: "active", by: null, at: null, reason: null }
      },
      { new: true }
    ).populate("books");
    return publisher;
  } catch (error) {
    console.error("Error approving publisher:", error);
    throw new Error("Error approving publisher");
  }
};

export const rejectPublisher = async (publisherId, reason, managerId) => {
  try {
    const publisher = await Publisher.findByIdAndUpdate(
      publisherId,
      { moderation: { status: "rejected", by: managerId, at: new Date(), reason: reason || "Insufficient or invalid details" } },
      { new: true }
    ).populate("books");
    return publisher;
  } catch (error) {
    console.error("Error rejecting publisher:", error);
    throw new Error("Error rejecting publisher");
  }
};

export const banPublisher = async (publisherId, reason, managerId) => {
  try {
    const publisher = await Publisher.findByIdAndUpdate(
      publisherId,
      { account: { status: "banned", by: managerId, at: new Date(), reason: reason || "Violated platform policies" } },
      { new: true }
    ).populate("books");
    return publisher;
  } catch (error) {
    console.error("Error banning publisher:", error);
    throw new Error("Error banning publisher");
  }
};

export const reinstatePublisher = async (publisherId) => {
  try {
    const publisher = await Publisher.findByIdAndUpdate(
      publisherId,
      { account: { status: "active", by: null, at: null, reason: null } },
      { new: true }
    ).populate("books");
    return publisher;
  } catch (error) {
    console.error("Error reinstating publisher:", error);
    throw new Error("Error reinstating publisher");
  }
};

// ===== Analytics Services =====

export const getManagerDashboardAnalytics = async () => {
  try {
    // Total counts
    const totalBooks = await Book.countDocuments({ isDeleted: false });
    const totalPendingBooks = await Book.countDocuments({ isDeleted: false, quantity: 0 });
    const totalApprovedBooks = await Book.countDocuments({ isDeleted: false, quantity: { $gt: 0 } });
    const totalRejectedBooks = await Book.countDocuments({ isDeleted: true });
    
    const totalAuctions = await AntiqueBook.countDocuments();
    const pendingAuctions = await AntiqueBook.countDocuments({ status: "pending" });
    const approvedAuctions = await AntiqueBook.countDocuments({ status: "approved" });
    const rejectedAuctions = await AntiqueBook.countDocuments({ status: "rejected" });
    
  const totalPublishers = await Publisher.countDocuments();
  const activePublishers = await Publisher.countDocuments({
    $or: [
      { "account.status": { $ne: "banned" } },
      { account: { $exists: false } },
      { "account.status": { $exists: false } },
      { banned: { $ne: true } },
    ],
  });
  const bannedPublishers = await Publisher.countDocuments({
    $or: [
      { "account.status": "banned" },
      { banned: true },
    ],
  });
    
    // Recent activity
    const recentBooks = await Book.find({ isDeleted: false })
      .populate("publisher", "firstname lastname publishingHouse")
      .sort({ publishedAt: -1 })
      .limit(5)
      .lean();
    
    const recentAuctions = await AntiqueBook.find()
      .populate("publisher", "firstname lastname publishingHouse")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    // Revenue analytics (from orders)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$items.lineTotal" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthLabel = `${monthNames[month - 1]} ${year}`;

      const monthData = monthlyRevenue.find((m) => m._id.year === year && m._id.month === month);
      revenueData.push({ month: monthLabel, revenue: monthData ? monthData.revenue : 0 });
    }

    // Genre distribution
    const genreDistribution = await Book.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    
    return {
      bookStats: {
        total: totalBooks,
        pending: totalPendingBooks,
        approved: totalApprovedBooks,
        rejected: totalRejectedBooks
      },
      auctionStats: {
        total: totalAuctions,
        pending: pendingAuctions,
        approved: approvedAuctions,
        rejected: rejectedAuctions
      },
      publisherStats: {
        total: totalPublishers,
        active: activePublishers,
        banned: bannedPublishers
      },
      recentBooks,
      recentAuctions,
      revenueData,
      genreDistribution: genreDistribution.map(g => ({
        genre: g._id || 'Unknown',
        count: g.count
      }))
    };
  } catch (error) {
    console.error("Error fetching manager dashboard analytics:", error);
    throw new Error("Error fetching analytics");
  }
};

export const getAuctionAnalytics = async () => {
  try {
    // Only consider approved auctions for buyer-facing analytics
    const now = new Date();
    const totalAuctions = await AntiqueBook.countDocuments({ status: 'approved' });
    const activeAuctions = await AntiqueBook.countDocuments({ status: 'approved', auctionStart: { $lte: now }, auctionEnd: { $gte: now } });
    const completedAuctions = await AntiqueBook.countDocuments({ status: 'approved', auctionEnd: { $lt: now } });
    
    // Auction trends over time
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const auctionTrends = await AntiqueBook.aggregate([
      { $match: { status: 'approved', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          totalStartingBid: { $sum: { $ifNull: ["$basePrice", 0] } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthLabel = `${monthNames[month - 1]} ${year}`;
      
      const monthData = auctionTrends.find(
        m => m._id.year === year && m._id.month === month
      );
      
      trendData.push({
        month: monthLabel,
        count: monthData ? monthData.count : 0,
        avgStartingBid: monthData ? (monthData.totalStartingBid / monthData.count) : 0
      });
    }
    
    // Category breakdown
    const categoryBreakdown = await AntiqueBook.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    return {
      totalAuctions,
      activeAuctions,
      completedAuctions,
      trendData,
      categoryBreakdown: categoryBreakdown.map(c => ({
        category: c._id || 'Uncategorized',
        count: c.count
      }))
    };
  } catch (error) {
    console.error("Error fetching auction analytics:", error);
    throw new Error("Error fetching auction analytics");
  }
};

// ==================== Admin Analytics ====================

/**
 * Get all managers with their activity statistics for admin dashboard
 */
export const getAllManagersWithStats = async () => {
  try {
    const managers = await Manager.find()
      .select("firstname lastname email moderation account lastLogin createdAt")
      .lean();

    // Get statistics for each manager
    const managersWithStats = await Promise.all(
      managers.map(async (manager) => {
        const managerId = manager._id;

        // Count antique books reviewed by this manager
        const [totalReviewed, approvedAuctions, rejectedAuctions] = await Promise.all([
          AntiqueBook.countDocuments({ reviewedBy: managerId }),
          AntiqueBook.countDocuments({ reviewedBy: managerId, status: "approved" }),
          AntiqueBook.countDocuments({ reviewedBy: managerId, status: "rejected" }),
        ]);

        // Count publishers approved/rejected/banned by this manager (using moderation.by)
        const [publishersApproved, publishersRejected] = await Promise.all([
          Publisher.countDocuments({ "moderation.by": managerId, "moderation.status": "approved" }),
          Publisher.countDocuments({ "moderation.by": managerId, "moderation.status": "rejected" }),
        ]);

        // Count publishers banned by this manager
        const publishersBanned = await Publisher.countDocuments({
          "account.by": managerId,
          "account.status": "banned",
        });

        return {
          ...manager,
          fullName: `${manager.firstname} ${manager.lastname}`,
          stats: {
            auctions: {
              total: totalReviewed,
              approved: approvedAuctions,
              rejected: rejectedAuctions,
            },
            publishers: {
              approved: publishersApproved,
              rejected: publishersRejected,
              banned: publishersBanned,
            },
          },
        };
      })
    );

    return managersWithStats;
  } catch (error) {
    console.error("Error in getAllManagersWithStats:", error);
    throw error;
  }
};

/**
 * Get detailed analytics for a specific manager (for admin view)
 */
export const getManagerDetailedAnalytics = async (managerId) => {
  try {
    const manager = await Manager.findById(managerId)
      .select("firstname lastname email moderation account lastLogin createdAt")
      .lean();

    if (!manager) {
      throw new Error("Manager not found");
    }

    const managerObjectId = new mongoose.Types.ObjectId(managerId);

    // Get all antique books reviewed by this manager
    const [auctionsApproved, auctionsRejected, auctionsPending] = await Promise.all([
      AntiqueBook.find({ reviewedBy: managerId, status: "approved" })
        .populate("publisher", "firstname lastname publishingHouse")
        .select("title author condition basePrice currentPrice status auctionStart auctionEnd createdAt updatedAt")
        .sort({ updatedAt: -1 })
        .lean(),
      AntiqueBook.find({ reviewedBy: managerId, status: "rejected" })
        .populate("publisher", "firstname lastname publishingHouse")
        .select("title author condition basePrice rejectionReason createdAt updatedAt")
        .sort({ updatedAt: -1 })
        .lean(),
      AntiqueBook.find({ reviewedBy: managerId, status: "pending" })
        .populate("publisher", "firstname lastname publishingHouse")
        .select("title author condition basePrice createdAt")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // Get publishers approved/rejected by this manager
    const [publishersApproved, publishersRejected, publishersBanned] = await Promise.all([
      Publisher.find({ "moderation.by": managerId, "moderation.status": "approved" })
        .select("firstname lastname publishingHouse email moderation createdAt")
        .sort({ "moderation.at": -1 })
        .lean(),
      Publisher.find({ "moderation.by": managerId, "moderation.status": "rejected" })
        .select("firstname lastname publishingHouse email moderation createdAt")
        .sort({ "moderation.at": -1 })
        .lean(),
      Publisher.find({ "account.by": managerId, "account.status": "banned" })
        .select("firstname lastname publishingHouse email account createdAt")
        .sort({ "account.at": -1 })
        .lean(),
    ]);

    // Activity timeline - last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const auctionReviewTrend = await AntiqueBook.aggregate([
      {
        $match: {
          reviewedBy: managerObjectId,
          updatedAt: { $gte: sixMonthsAgo },
          status: { $in: ["approved", "rejected"] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" },
            month: { $month: "$updatedAt" },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Format monthly activity
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const activityData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthLabel = `${monthNames[month - 1]} ${year}`;

      const approvedData = auctionReviewTrend.find(
        (t) => t._id.year === year && t._id.month === month && t._id.status === "approved"
      );
      const rejectedData = auctionReviewTrend.find(
        (t) => t._id.year === year && t._id.month === month && t._id.status === "rejected"
      );

      activityData.push({
        month: monthLabel,
        approved: approvedData ? approvedData.count : 0,
        rejected: rejectedData ? rejectedData.count : 0,
      });
    }

    // Recent activity log
    const recentAuctions = await AntiqueBook.find({
      reviewedBy: managerId,
      status: { $in: ["approved", "rejected"] },
    })
      .populate("publisher", "firstname lastname publishingHouse")
      .select("title status updatedAt rejectionReason")
      .sort({ updatedAt: -1 })
      .limit(15)
      .lean();

    const recentPublisherActions = [
      ...(await Publisher.find({ "moderation.by": managerId })
        .select("firstname lastname publishingHouse moderation")
        .sort({ "moderation.at": -1 })
        .limit(10)
        .lean()),
      ...(await Publisher.find({ "account.by": managerId })
        .select("firstname lastname publishingHouse account")
        .sort({ "account.at": -1 })
        .limit(10)
        .lean()),
    ]
      .sort((a, b) => {
        const aDate = a.moderation?.at || a.account?.at || new Date(0);
        const bDate = b.moderation?.at || b.account?.at || new Date(0);
        return new Date(bDate) - new Date(aDate);
      })
      .slice(0, 10);

    return {
      manager: {
        ...manager,
        fullName: `${manager.firstname} ${manager.lastname}`,
      },
      auctions: {
        total: auctionsApproved.length + auctionsRejected.length + auctionsPending.length,
        approved: auctionsApproved,
        rejected: auctionsRejected,
        pending: auctionsPending,
      },
      publishers: {
        approved: publishersApproved.map((p) => ({
          ...p,
          fullName: `${p.firstname} ${p.lastname}`,
        })),
        rejected: publishersRejected.map((p) => ({
          ...p,
          fullName: `${p.firstname} ${p.lastname}`,
        })),
        banned: publishersBanned.map((p) => ({
          ...p,
          fullName: `${p.firstname} ${p.lastname}`,
        })),
      },
      activity: {
        monthlyData: activityData,
        recentAuctions,
        recentPublisherActions,
      },
    };
  } catch (error) {
    console.error("Error in getManagerDetailedAnalytics:", error);
    throw error;
  }
};
