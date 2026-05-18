import express from "express";
import { protect, authorize, checkAdminKey } from "../middleware/auth.middleware.js";
import {
  loginAdmin,
  getPlatformAnalytics,
  getAdminDashboard,
  banPublisher,
  getAdmins,
  getAdminByIdController,
  createAdminController,
  deleteAdminController,
  updateAdminKeyController,
  changeAdminKeyController,
  getManagersForAdmin,
  getManagerDetailsForAdmin,
  approveManagerController,
  rejectManagerController,
  banManagerController,
  reinstateManagerController,
  getAllPublishersWithAnalytics,
  getPublisherAnalytics,
  getAllManagersWithAnalytics,
  getManagerAnalytics,
  getAllBuyersWithAnalytics,
  getBuyerAnalytics,
  getAllBooksWithAnalytics,
  getBookAnalytics,
  getAllAntiqueBooksWithAnalytics,
  getAntiqueBookAnalytics
} from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/auth/login", loginAdmin);

router.use(protect);
router.use(authorize("admin"));

const requireSuperAdmin = (req, res, next) => {
  if (!req.user?.isSuperAdmin) {
    return res.status(403).json({ message: "Super admin access required" });
  }
  next();
};

router.get("/analytics", getPlatformAnalytics);
router.get("/dashboard/:key", checkAdminKey, getAdminDashboard);
router.put("/publishers/:id/ban", banPublisher);

router.get("/admins", requireSuperAdmin, getAdmins);
router.get("/admins/:id", requireSuperAdmin, getAdminByIdController);
router.post("/admins", requireSuperAdmin, createAdminController);
router.delete("/admins/:id", requireSuperAdmin, deleteAdminController);
router.put("/admins/:id/change-key", requireSuperAdmin, changeAdminKeyController);
router.put("/admins/update-key", updateAdminKeyController);

router.get("/managers", getManagersForAdmin);
router.get("/managers/:id", getManagerDetailsForAdmin);
router.post("/managers/:id/approve", approveManagerController);
router.post("/managers/:id/reject", rejectManagerController);
router.post("/managers/:id/ban", banManagerController);
router.post("/managers/:id/reinstate", reinstateManagerController);

router.get("/publishers-analytics", getAllPublishersWithAnalytics);
router.get("/publishers-analytics/:id", getPublisherAnalytics);

router.get("/managers-analytics", getAllManagersWithAnalytics);
router.get("/managers-analytics/:id", getManagerAnalytics);

router.get("/buyers-analytics", getAllBuyersWithAnalytics);
router.get("/buyers-analytics/:id", getBuyerAnalytics);

router.get("/books-analytics", getAllBooksWithAnalytics);
router.get("/books-analytics/:id", getBookAnalytics);

router.get("/antique-books-analytics", getAllAntiqueBooksWithAnalytics);
router.get("/antique-books-analytics/:id", getAntiqueBookAnalytics);

export default router;
