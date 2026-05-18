import Admin from "../models/Admin.model.js";
import Publisher from "../models/Publisher.model.js";
import Manager from "../models/Manager.model.js";
import jwt from "jsonwebtoken";
import { getCookieOptions } from "../config/cookie.js";
import { 
  getAllPublishers, 
  deletePublisherById, 
  togglePublisherBan,
  getAllPublishersWithStats,
  getPublisherDetailedAnalytics
} from "../services/publisher.services.js";
import { 
  getAllManagersWithStats, 
  getManagerDetailedAnalytics 
} from "../services/manager.services.js";
import { 
  getAllBuyers, 
  getAllOrders,
  getAllBuyersWithStats,
  getBuyerDetailedAnalytics
} from "../services/buyer.services.js";
import {
  getAllBooksWithStats,
  getBookDetailedAnalytics
} from "../services/book.services.js";
import {
  getAllAntiqueBooksWithStats,
  getAntiqueBookDetailedAnalytics
} from "../services/antiqueBook.services.js";
import Order from "../models/Order.model.js";
import Book from "../models/Book.model.js";
import Buyer from "../models/Buyer.model.js";

export const loginAdmin = async (req, res) => {
  try {
    const { adminKey } = req.body;

    if (!adminKey) {
      return res.status(400).json({
        success: false,
        message: "Admin key is required",
        data: null
      });
    }

    const admins = await Admin.find({ isActive: true });
    let authenticatedAdmin = null;

    for (const admin of admins) {
      const isMatch = await admin.compareAdminKey(adminKey);
      if (isMatch) {
        authenticatedAdmin = admin;
        break;
      }
    }

    if (!authenticatedAdmin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin key",
        data: null
      });
    }

    authenticatedAdmin.lastLogin = new Date();
    await authenticatedAdmin.save();

    const token = jwt.sign(
      {
        id: authenticatedAdmin._id,
        role: "admin",
        isSuperAdmin: authenticatedAdmin.isSuperAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.cookie("token", token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        admin: {
          id: authenticatedAdmin._id,
          name: authenticatedAdmin.name,
          email: authenticatedAdmin.email,
          isSuperAdmin: authenticatedAdmin.isSuperAdmin,
          lastLogin: authenticatedAdmin.lastLogin
        }
      }
    });
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({
      success: false,
      message: "Error during admin login",
      data: null
    });
  }
};

export const getPlatformAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const last12Months = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    const [managersCount, buyersCount, booksCount, publishersCount] = await Promise.all([
      Manager.countDocuments({ "moderation.status": "approved", "account.status": "active" }),
      getAllBuyers().then(b => b.length),
      Book.countDocuments(),
      Publisher.countDocuments({ "moderation.status": "approved" })
    ]);

    const [
      totalRevenueAgg,
      todayRevenueAgg,
      weekRevenueAgg,
      monthRevenueAgg,
      yearRevenueAgg,
      last30DaysRevenue,
      last12MonthsRevenue,
      ordersByStatus,
      revenueByStatus
    ] = await Promise.all([
      Order.aggregate([
        { $group: { _id: null, revenue: { $sum: "$grandTotal" }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, revenue: { $sum: "$grandTotal" }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, revenue: { $sum: "$grandTotal" }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, revenue: { $sum: "$grandTotal" }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfYear } } },
        { $group: { _id: null, revenue: { $sum: "$grandTotal" }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: last30Days } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$grandTotal" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: last12Months } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            revenue: { $sum: "$grandTotal" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            revenue: { $sum: "$grandTotal" }
          }
        }
      ])
    ]);


    const topPublishers = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.publisher",
          revenue: { $sum: "$items.lineTotal" },
          orders: { $sum: 1 },
          booksSold: { $sum: "$items.quantity" }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "publishers",
          localField: "_id",
          foreignField: "_id",
          as: "publisherInfo"
        }
      },
      { $unwind: "$publisherInfo" },
      {
        $project: {
          _id: 1,
          revenue: 1,
          orders: 1,
          booksSold: 1,
          name: { $concat: ["$publisherInfo.firstname", " ", "$publisherInfo.lastname"] },
          publishingHouse: "$publisherInfo.publishingHouse"
        }
      }
    ]);

    const topBuyers = await Order.aggregate([
      {
        $group: {
          _id: "$buyer",
          totalSpent: { $sum: "$grandTotal" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "buyers",
          localField: "_id",
          foreignField: "_id",
          as: "buyerInfo"
        }
      },
      { $unwind: "$buyerInfo" },
      {
        $project: {
          _id: 1,
          totalSpent: 1,
          orderCount: 1,
          name: { $concat: ["$buyerInfo.firstname", " ", "$buyerInfo.lastname"] },
          email: "$buyerInfo.email"
        }
      }
    ]);

    const revenueBreakdown = await Order.aggregate([
      {
        $group: {
          _id: null,
          itemsTotal: { $sum: "$itemsTotal" },
          shipping: { $sum: "$shipping" },
          tax: { $sum: "$tax" },
          discount: { $sum: "$discount" }
        }
      }
    ]);

    const totalOrders = totalRevenueAgg[0]?.count || 0;
    const totalRevenue = totalRevenueAgg[0]?.revenue || 0;
    const todayRevenue = todayRevenueAgg[0]?.revenue || 0;
    const weekRevenue = weekRevenueAgg[0]?.revenue || 0;
    const monthRevenue = monthRevenueAgg[0]?.revenue || 0;
    const yearRevenue = yearRevenueAgg[0]?.revenue || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const revenueTrend = last30DaysRevenue.map(item => ({
      date: item._id,
      revenue: item.revenue,
      orders: item.orders
    }));

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenue = last12MonthsRevenue.map(item => {
      const [year, month] = item._id.split('-');
      return {
        month: `${monthNames[parseInt(month) - 1]} ${year}`,
        revenue: item.revenue,
        orders: item.orders
      };
    });

    const orderStatusData = ordersByStatus.map(item => ({
      status: item._id,
      count: item.count
    }));

    const revenueByStatusData = revenueByStatus.map(item => ({
      status: item._id,
      revenue: item.revenue
    }));

    return res.status(200).json({
      managers: managersCount,
      publishers: publishersCount,
      buyers: buyersCount,
      books: booksCount,
      orders: totalOrders,
      
      revenue: {
        total: totalRevenue,
        today: todayRevenue,
        week: weekRevenue,
        month: monthRevenue,
        year: yearRevenue,
        averageOrderValue: averageOrderValue,
        breakdown: revenueBreakdown[0] || { itemsTotal: 0, shipping: 0, tax: 0, discount: 0 }
      },
      
      revenueTrend: revenueTrend,
      monthlyRevenue: monthlyRevenue,
      
      ordersByStatus: orderStatusData,
      revenueByStatus: revenueByStatusData,
      
      topPublishers: topPublishers,
      topBuyers: topBuyers
    });
  } catch (error) {
    console.error("Error fetching platform analytics:", error);
    return res.status(500).json({ message: "Error fetching platform analytics" });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const buyers = await getAllBuyers();
    const orders = await getAllOrders();
    const auctions = [];

    const totalBuyers = buyers.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, r) => sum + (r.book.price || 0) * (r.quantity || 0), 0);
    const activeAuctions = auctions.filter(
      (auction) => auction.status === "ongoing"
    ).length;

    const genreCounts = await Book.aggregate([
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      { $project: { genre: "$_id", count: 1, _id: 0 } },
    ]);

    const revenueByGenre = await Order.aggregate([
      { $unwind: "$items" },
      { $lookup: { from: "books", localField: "items.book", foreignField: "_id", as: "bookDetails" } },
      { $unwind: "$bookDetails" },
      {
        $group: {
          _id: "$bookDetails.genre",
          revenue: { $sum: { $multiply: ["$items.quantity", "$bookDetails.price"] } },
        },
      },
      { $project: { genre: "$_id", revenue: 1, _id: 0 } },
    ]);

    const admin = { name: "Vitesh", email: "admin1@gmail.com" };
    const publishers = await getAllPublishers();
    const activities = [];

    const analytics = {
      totalBuyers,
      totalOrders,
      totalRevenue,
      activeAuctions,
      genreCounts,
      revenueByGenre,
    };

    res.status(200).json({
      success: true,
      message: "Admin dashboard data fetched successfully",
      data: { admin, publishers, activities, analytics }
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin dashboard data",
      data: null
    });
  }
};

export const banPublisher = async (req, res) => {
  try {
    const publisherId = req.params.id;
    const publisher = await togglePublisherBan(publisherId);
    res.status(200).json({
      success: true,
      message: publisher.account?.status === "banned" ? "Publisher banned successfully" : "Publisher unbanned successfully",
      data: {
        banned: publisher.account?.status === "banned",
        account: publisher.account
      }
    });
  } catch (error) {
    console.error("Error toggling publisher ban:", error);
    res.status(500).json({
      success: false,
      message: "Error updating publisher ban status",
      data: null
    });
  }
};

export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-adminKey").populate({ path: "createdBy", select: "name email" });
    return res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    return res.status(500).json({ message: "Error fetching admins" });
  }
};

export const getAdminByIdController = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-adminKey").populate({ path: "createdBy", select: "name email" });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    return res.status(200).json(admin);
  } catch (error) {
    console.error("Error fetching admin by id:", error);
    return res.status(500).json({ message: "Error fetching admin" });
  }
};

export const createAdminController = async (req, res) => {
  try {
    const { name, email, adminKey, isSuperAdmin = false } = req.body || {};
    if (!name || !email || !adminKey) {
      return res.status(400).json({ message: "Name, email and adminKey are required" });
    }
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(409).json({ message: "Admin with this email already exists" });
    const createdBy = req.user && req.user.id ? req.user.id : null;
    const admin = new Admin({ name, email, adminKey, isSuperAdmin: Boolean(isSuperAdmin), createdBy });
    await admin.save();
    const sanitized = await Admin.findById(admin._id).select("-adminKey").populate({ path: "createdBy", select: "name email" });
    return res.status(201).json(sanitized);
  } catch (error) {
    console.error("Error creating admin:", error);
    if (error.code === "DUPLICATE_ADMIN_KEY") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Error creating admin" });
  }
};

export const deleteAdminController = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await Admin.findById(id);
    if (!target) return res.status(404).json({ message: "Admin not found" });
    if (target.isSuperAdmin) return res.status(400).json({ message: "Cannot delete a super admin" });
    if (req.user && String(target._id) === String(req.user.id)) return res.status(400).json({ message: "Admins cannot delete themselves" });
    await Admin.findByIdAndDelete(id);
    return res.status(200).json({ deleted: true });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return res.status(500).json({ message: "Error deleting admin" });
  }
};

export const updateAdminKeyController = async (req, res) => {
  try {
    const { currentKey, newKey } = req.body || {};
    if (!currentKey || !newKey) return res.status(400).json({ message: "Current and new key are required" });
    const admin = await Admin.findById(req.user && req.user.id ? req.user.id : null);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    const matches = await admin.compareAdminKey(currentKey);
    if (!matches) return res.status(401).json({ message: "Current key is incorrect" });
    admin.adminKey = newKey;
    await admin.save();
    return res.status(200).json({ message: "Admin key updated. Please login again." });
  } catch (error) {
    console.error("Error updating admin key:", error);
    if (error.code === "DUPLICATE_ADMIN_KEY") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Error updating admin key" });
  }
};

export const changeAdminKeyController = async (req, res) => {
  try {
    const { id } = req.params;
    const { newAdminKey } = req.body;

    if (!newAdminKey || newAdminKey.trim().length < 6) {
      return res.status(400).json({ message: "New admin key must be at least 6 characters" });
    }

    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.isSuperAdmin) return res.status(400).json({ message: "Cannot change key for super admin" });

    admin.adminKey = newAdminKey;
    
    try {
      await admin.save();
      return res.status(200).json({ 
        success: true, 
        message: "Admin key changed successfully" 
      });
    } catch (error) {
      if (error.code === "DUPLICATE_ADMIN_KEY") {
        return res.status(409).json({ 
          success: false, 
          message: "This admin key is already in use by another admin. Please choose a different key." 
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error changing admin key:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error changing admin key" 
    });
  }
};

export const getManagersForAdmin = async (req, res) => {
  try {
    const managers = await Manager.find()
      .populate({ path: "moderation.by", select: "name email" })
      .populate({ path: "account.by", select: "name email" })
      .sort({ createdAt: -1 });
    
    const managersData = managers.map(m => ({
      _id: m._id,
      firstname: m.firstname,
      lastname: m.lastname,
      fullName: `${m.firstname} ${m.lastname}`.trim(),
      email: m.email,
      moderation: m.moderation,
      account: m.account,
      lastLogin: m.lastLogin,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt
    }));
    
    return res.status(200).json(managersData);
  } catch (error) {
    console.error("Error fetching managers:", error);
    return res.status(500).json({ message: "Error fetching managers" });
  }
};

export const getManagerDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const manager = await Manager.findById(id)
      .populate({ path: "moderation.by", select: "name email" })
      .populate({ path: "account.by", select: "name email" });
    
    if (!manager) return res.status(404).json({ message: "Manager not found" });
    
    const managerData = {
      _id: manager._id,
      firstname: manager.firstname,
      lastname: manager.lastname,
      fullName: `${manager.firstname} ${manager.lastname}`.trim(),
      email: manager.email,
      moderation: manager.moderation,
      account: manager.account,
      lastLogin: manager.lastLogin,
      createdAt: manager.createdAt,
      updatedAt: manager.updatedAt
    };
    
    return res.status(200).json(managerData);
  } catch (error) {
    console.error("Error fetching manager details:", error);
    return res.status(500).json({ message: "Error fetching manager details" });
  }
};

export const approveManagerController = async (req, res) => {
  try {
    const { id } = req.params;
    const update = {
      $set: {
        "moderation.status": "approved",
        "moderation.by": (req.user && req.user.id) || null,
        "moderation.at": new Date(),
        "moderation.reason": null,
        "account.status": "active"
      }
    };
    const manager = await Manager.findByIdAndUpdate(id, update, { new: true });
    if (!manager) return res.status(404).json({ message: "Manager not found" });
    return res.status(200).json({ message: "Manager approved" });
  } catch (error) {
    console.error("Error approving manager:", error);
    return res.status(500).json({ message: "Error approving manager" });
  }
};

export const rejectManagerController = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = "" } = req.body || {};
    const update = {
      $set: {
        "moderation.status": "rejected",
        "moderation.by": (req.user && req.user.id) || null,
        "moderation.at": new Date(),
        "moderation.reason": reason
      }
    };
    const manager = await Manager.findByIdAndUpdate(id, update, { new: true });
    if (!manager) return res.status(404).json({ message: "Manager not found" });
    return res.status(200).json({ message: "Manager rejected" });
  } catch (error) {
    console.error("Error rejecting manager:", error);
    return res.status(500).json({ message: "Error rejecting manager" });
  }
};

export const banManagerController = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = "" } = req.body || {};
    const update = {
      $set: {
        "account.status": "banned",
        "account.by": (req.user && req.user.id) || null,
        "account.at": new Date(),
        "account.reason": reason
      }
    };
    const manager = await Manager.findByIdAndUpdate(id, update, { new: true });
    if (!manager) return res.status(404).json({ message: "Manager not found" });
    return res.status(200).json({ message: "Manager banned" });
  } catch (error) {
    console.error("Error banning manager:", error);
    return res.status(500).json({ message: "Error banning manager" });
  }
};

export const reinstateManagerController = async (req, res) => {
  try {
    const { id } = req.params;
    const update = {
      $set: {
        "account.status": "active",
        "account.by": (req.user && req.user.id) || null,
        "account.at": new Date(),
        "account.reason": null
      }
    };
    const manager = await Manager.findByIdAndUpdate(id, update, { new: true });
    if (!manager) return res.status(404).json({ message: "Manager not found" });
    return res.status(200).json({ message: "Manager reinstated" });
  } catch (error) {
    console.error("Error reinstating manager:", error);
    return res.status(500).json({ message: "Error reinstating manager" });
  }
};

export const getAllPublishersWithAnalytics = async (req, res) => {
  try {
    const publishers = await getAllPublishersWithStats();
    return res.status(200).json({
      success: true,
      message: "Publishers with analytics fetched successfully",
      data: publishers,
    });
  } catch (error) {
    console.error("Error fetching publishers with analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching publishers analytics",
      data: null,
    });
  }
};

export const getPublisherAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const analytics = await getPublisherDetailedAnalytics(id);
    return res.status(200).json({
      success: true,
      message: "Publisher analytics fetched successfully",
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching publisher analytics:", error);
    const status = error.message === "Publisher not found" ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Error fetching publisher analytics",
      data: null,
    });
  }
};

export const getAllManagersWithAnalytics = async (req, res) => {
  try {
    const managers = await getAllManagersWithStats();
    return res.status(200).json({
      success: true,
      message: "Managers with analytics fetched successfully",
      data: managers,
    });
  } catch (error) {
    console.error("Error fetching managers with analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching managers analytics",
      data: null,
    });
  }
};

export const getManagerAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const analytics = await getManagerDetailedAnalytics(id);
    return res.status(200).json({
      success: true,
      message: "Manager analytics fetched successfully",
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching manager analytics:", error);
    const status = error.message === "Manager not found" ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Error fetching manager analytics",
      data: null,
    });
  }
};

export const getAllBuyersWithAnalytics = async (req, res) => {
  try {
    const buyers = await getAllBuyersWithStats();
    return res.status(200).json({
      success: true,
      message: "Buyers with analytics fetched successfully",
      data: buyers,
    });
  } catch (error) {
    console.error("Error fetching buyers with analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching buyers analytics",
      data: null,
    });
  }
};

export const getBuyerAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const analytics = await getBuyerDetailedAnalytics(id);
    return res.status(200).json({
      success: true,
      message: "Buyer analytics fetched successfully",
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching buyer analytics:", error);
    const status = error.message === "Buyer not found" ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Error fetching buyer analytics",
      data: null,
    });
  }
};

export const getAllBooksWithAnalytics = async (req, res) => {
  try {
    const books = await getAllBooksWithStats();
    return res.status(200).json({
      success: true,
      message: "Books analytics fetched successfully",
      data: books,
    });
  } catch (error) {
    console.error("Error fetching books analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching books analytics",
      data: null,
    });
  }
};

export const getBookAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const analytics = await getBookDetailedAnalytics(id);
    return res.status(200).json({
      success: true,
      message: "Book analytics fetched successfully",
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching book analytics:", error);
    const status = error.message === "Book not found" ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Error fetching book analytics",
      data: null,
    });
  }
};

export const getAllAntiqueBooksWithAnalytics = async (req, res) => {
  try {
    const antiqueBooks = await getAllAntiqueBooksWithStats();
    return res.status(200).json({
      success: true,
      message: "Antique books analytics fetched successfully",
      data: antiqueBooks,
    });
  } catch (error) {
    console.error("Error fetching antique books analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching antique books analytics",
      data: null,
    });
  }
};

export const getAntiqueBookAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const analytics = await getAntiqueBookDetailedAnalytics(id);
    return res.status(200).json({
      success: true,
      message: "Antique book analytics fetched successfully",
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching antique book analytics:", error);
    const status = error.message === "Antique book not found" ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Error fetching antique book analytics",
      data: null,
    });
  }
};
