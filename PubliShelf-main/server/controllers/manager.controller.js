// controllers/manager.controller.js
import {
  // Profile
  getManagerById,
  createManager,
  updateManagerProfile,
  // Books (temporarily disabled in UI but controllers remain)
  getAllPendingBooks,
  getAllApprovedBooks,
  getAllRejectedBooks,
  approveBook,
  rejectBook,
  flagBook,
  // Auctions
  getAllPendingAuctions,
  getAllApprovedAuctions,
  getAllRejectedAuctions,
  getAuctionById,
  approveAuction,
  rejectAuction,
  getAuctionsOverview,
  // Publishers
  getAllPendingPublishers,
  getAllActivePublishers,
  approvePublisher,
  rejectPublisher,
  banPublisher,
  reinstatePublisher,
  // Analytics
  getManagerDashboardAnalytics,
  getAuctionAnalytics
} from "../services/manager.services.js";
import { getAllBannedPublishers } from "../services/manager.services.js";
import { getPublisherById as getPublisherDetails } from "../services/publisher.services.js";

// ===== Profile Controllers =====

export const getManagerProfile = async (req, res) => {
  try {
    const manager = await getManagerById(req.user.id);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
        data: null
      });
    }

    const analytics = await getManagerDashboardAnalytics();

    return res.status(200).json({
      success: true,
      message: "Manager profile fetched successfully",
      data: { user: manager, analytics }
    });
  } catch (error) {
    console.error("Error in getManagerProfile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const getManagerDashboard = async (req, res) => {
  try {
    const manager = await getManagerById(req.user.id);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
        data: null
      });
    }

    const analytics = await getManagerDashboardAnalytics();

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: { manager, analytics }
    });
  } catch (error) {
    console.error("Error in getManagerDashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const updateManagerProfileController = async (req, res) => {
  try {
    const { firstname, lastname, email, currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is required",
        data: null
      });
    }

    if (newPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
        data: null
      });
    }

    const updatedManager = await updateManagerProfile(req.user.id, {
      firstname,
      lastname,
      email,
      currentPassword,
      newPassword
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedManager
    });
  } catch (error) {
    console.error("Error in updateManagerProfileController:", error);
    const statusCode = error.message === "Current password is incorrect" ? 401 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Internal server error",
      data: null
    });
  }
};

export const createManagerSignup = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        data: null
      });
    }

    const manager = await createManager({ firstname, lastname, email, password });

    return res.status(201).json({
      success: true,
      message: "Manager account created successfully",
      data: manager
    });
  } catch (error) {
    console.error("Error in createManagerSignup:", error);
    const statusCode = error.message === "Email already registered" ? 409 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Internal server error",
      data: null
    });
  }
};

// ===== Book Management Controllers =====

export const getPendingBooks = async (req, res) => {
  try {
    const books = await getAllPendingBooks();
    return res.status(200).json({
      success: true,
      message: "Pending books fetched successfully",
      data: books
    });
  } catch (error) {
    console.error("Error in getPendingBooks:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const getApprovedBooks = async (req, res) => {
  try {
    const books = await getAllApprovedBooks();
    return res.status(200).json({
      success: true,
      message: "Approved books fetched successfully",
      data: books
    });
  } catch (error) {
    console.error("Error in getApprovedBooks:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const getRejectedBooks = async (req, res) => {
  try {
    const books = await getAllRejectedBooks();
    return res.status(200).json({
      success: true,
      message: "Rejected books fetched successfully",
      data: books
    });
  } catch (error) {
    console.error("Error in getRejectedBooks:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const approveBookController = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await approveBook(id);
    return res.status(200).json({
      success: true,
      message: "Book approved successfully",
      data: book
    });
  } catch (error) {
    console.error("Error in approveBookController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const rejectBookController = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const book = await rejectBook(id, reason);
    return res.status(200).json({
      success: true,
      message: "Book rejected successfully",
      data: book
    });
  } catch (error) {
    console.error("Error in rejectBookController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const flagBookController = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const book = await flagBook(id, remarks);
    return res.status(200).json({
      success: true,
      message: "Book flagged successfully",
      data: book
    });
  } catch (error) {
    console.error("Error in flagBookController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

// ===== Auction Management Controllers =====

export const getPendingAuctions = async (req, res) => {
  try {
    const auctions = await getAllPendingAuctions();
    return res.status(200).json({
      success: true,
      message: "Pending auctions fetched successfully",
      data: auctions
    });
  } catch (error) {
    console.error("Error in getPendingAuctions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const getApprovedAuctions = async (req, res) => {
  try {
    const managerId = req.user?.id; // token payload uses `id`
    if (!managerId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized: missing manager id",
        data: null
      });
    }
    const auctions = await getAllApprovedAuctions(managerId);
    return res.status(200).json({
      success: true,
      message: "Approved auctions fetched successfully",
      data: auctions
    });
  } catch (error) {
    console.error("Error in getApprovedAuctions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const getRejectedAuctions = async (req, res) => {
  try {
    const auctions = await getAllRejectedAuctions();
    return res.status(200).json({
      success: true,
      message: "Rejected auctions fetched successfully",
      data: auctions
    });
  } catch (error) {
    console.error("Error in getRejectedAuctions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const getAuctionByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await getAuctionById(id);
    return res.status(200).json({
      success: true,
      message: "Auction details fetched successfully",
      data: auction
    });
  } catch (error) {
    console.error("Error in getAuctionByIdController:", error);
    return res.status(404).json({
      success: false,
      message: error.message || "Auction not found",
      data: null
    });
  }
};

export const approveAuctionController = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user?.id; // Get the manager's ID from authenticated user (token payload uses `id`)
    if (!managerId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized: missing manager id",
        data: null
      });
    }
    const auction = await approveAuction(id, managerId);
    return res.status(200).json({
      success: true,
      message: "Auction approved successfully",
      data: auction
    });
  } catch (error) {
    console.error("Error in approveAuctionController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const rejectAuctionController = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const managerId = req.user?.id;
    
    if (!managerId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized: missing manager id",
        data: null
      });
    }
    
    const auction = await rejectAuction(id, reason, managerId);
    return res.status(200).json({
      success: true,
      message: "Auction rejected successfully",
      data: auction
    });
  } catch (error) {
    console.error("Error in rejectAuctionController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const getAuctionsOverviewController = async (req, res) => {
  try {
    const managerId = req.user?.id;
    
    if (!managerId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized: missing manager id",
        data: null
      });
    }

    const overview = await getAuctionsOverview(managerId);
    return res.status(200).json({
      success: true,
      message: "Auctions overview fetched successfully",
      data: overview
    });
  } catch (error) {
    console.error("Error in getAuctionsOverviewController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const getAuctionAnalyticsController = async (req, res) => {
  try {
    const analytics = await getAuctionAnalytics();
    return res.status(200).json({
      success: true,
      message: "Auction analytics fetched successfully",
      data: analytics
    });
  } catch (error) {
    console.error("Error in getAuctionAnalyticsController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

// ===== Publisher Management Controllers =====

export const getPendingPublishers = async (req, res) => {
  try {
    const publishers = await getAllPendingPublishers();
    return res.status(200).json({
      success: true,
      message: "Pending publishers fetched successfully",
      data: publishers
    });
  } catch (error) {
    console.error("Error in getPendingPublishers:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const getActivePublishers = async (req, res) => {
  try {
    const publishers = await getAllActivePublishers(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Active publishers fetched successfully",
      data: publishers
    });
  } catch (error) {
    console.error("Error in getActivePublishers:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const getBannedPublishers = async (req, res) => {
  try {
    const publishers = await getAllBannedPublishers(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Banned publishers fetched successfully",
      data: publishers
    });
  } catch (error) {
    console.error("Error in getBannedPublishers:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const approvePublisherController = async (req, res) => {
  try {
    const { id } = req.params;
    const publisher = await approvePublisher(id, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Publisher approved successfully",
      data: publisher
    });
  } catch (error) {
    console.error("Error in approvePublisherController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const rejectPublisherController = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const managerId = req.user.id;
    const publisher = await rejectPublisher(id, reason, managerId);
    return res.status(200).json({
      success: true,
      message: "Publisher rejected successfully",
      data: publisher
    });
  } catch (error) {
    console.error("Error in rejectPublisherController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const banPublisherController = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const managerId = req.user.id;
    const publisher = await banPublisher(id, reason, managerId);
    return res.status(200).json({
      success: true,
      message: "Publisher banned successfully",
      data: publisher
    });
  } catch (error) {
    console.error("Error in banPublisherController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

export const reinstatePublisherController = async (req, res) => {
  try {
    const { id } = req.params;
    const publisher = await reinstatePublisher(id);
    return res.status(200).json({
      success: true,
      message: "Publisher reinstated successfully",
      data: publisher
    });
  } catch (error) {
    console.error("Error in reinstatePublisherController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

// Publisher details (for manager overview)
export const getPublisherByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const publisher = await getPublisherDetails(id);
    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: "Publisher not found",
        data: null
      });
    }
    return res.status(200).json({
      success: true,
      message: "Publisher details fetched successfully",
      data: publisher
    });
  } catch (error) {
    console.error("Error in getPublisherByIdController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};
