// routes/manager.routes.js
import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  getManagerDashboard,
  getManagerProfile,
  updateManagerProfileController,
  createManagerSignup,
  getPendingBooks,
  getApprovedBooks,
  getRejectedBooks,
  approveBookController,
  rejectBookController,
  flagBookController,
  getPendingAuctions,
  getApprovedAuctions,
  getRejectedAuctions,
  getAuctionByIdController,
  approveAuctionController,
  rejectAuctionController,
  getAuctionsOverviewController,
  getAuctionAnalyticsController,
  getPendingPublishers,
  getActivePublishers,
  getBannedPublishers,
  approvePublisherController,
  rejectPublisherController,
  banPublisherController,
  reinstatePublisherController,
  getPublisherByIdController
} from "../controllers/manager.controller.js";

const router = express.Router();

// Public route for manager signup
router.post("/signup", createManagerSignup);

// Protected routes - require authentication and manager role
router.use(protect);
router.use(authorize("manager"));

// Profile routes
router.get("/dashboard", getManagerDashboard);
router.get("/profile", getManagerProfile);
router.put("/profile", updateManagerProfileController);

// Book management routes - temporarily disabled
/**
router.get("/books/pending", getPendingBooks);
router.get("/books/approved", getApprovedBooks);
router.get("/books/rejected", getRejectedBooks);
router.put("/books/:id/approve", approveBookController);
router.put("/books/:id/reject", rejectBookController);
router.put("/books/:id/flag", flagBookController);
**/

// Auction management routes
router.get("/auctions/overview", getAuctionsOverviewController);
router.get("/auctions/pending", getPendingAuctions);
router.get("/auctions/approved", getApprovedAuctions);
router.get("/auctions/rejected", getRejectedAuctions);
router.get("/auctions/:id", getAuctionByIdController);
router.put("/auctions/:id/approve", approveAuctionController);
router.put("/auctions/:id/reject", rejectAuctionController);

// Publisher management routes
router.get("/publishers/pending", getPendingPublishers);
router.get("/publishers/active", getActivePublishers);
router.get("/publishers/banned", getBannedPublishers);
router.get("/publishers/:id", getPublisherByIdController);
router.put("/publishers/:id/approve", approvePublisherController);
router.put("/publishers/:id/reject", rejectPublisherController);
router.put("/publishers/:id/ban", banPublisherController);
router.put("/publishers/:id/reinstate", reinstatePublisherController);

export default router;
