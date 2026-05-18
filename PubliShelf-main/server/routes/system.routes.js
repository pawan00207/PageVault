import express from "express";
import Book from "../models/Book.model.js";
import { getMetrics, getTopSoldBooks, getTrendingBooks } from "../services/buyer.services.js";
import { recordVisit, getStats } from "../services/analytics.services.js";
import { buildCacheKey, getOrSetCache } from "../services/cache.services.js";

const router = express.Router();

router.get("/api/home/data", async (req, res) => {
  try {
    const controllerStartTimeMs = Date.now();
    const cacheKey = buildCacheKey("home:payload", { endpoint: "/api/home/data" });
    const homeData = await getOrSetCache({
      key: cacheKey,
      ttlSeconds: 90,
      label: "Home Data Payload",
      controllerStartTimeMs,
      getter: async () => {
        const newlyBooks = await Book.find({ isDeleted: { $ne: true } })
          .sort({ publishedAt: -1 })
          .limit(8)
          .select("_id title author image price totalSold genre publishedAt")
          .lean();

        const [mostSoldBooks, trendingBooks, metrics] = await Promise.all([
          getTopSoldBooks({ controllerStartTimeMs }),
          getTrendingBooks({ controllerStartTimeMs }),
          getMetrics({ controllerStartTimeMs }),
        ]);

        return { newlyBooks, mostSoldBooks, trendingBooks, metrics };
      }
    });

    res.status(200).json({
      success: true,
      message: "Home data fetched successfully",
      data: homeData,
    });
  } catch (error) {
    console.error("Error fetching home data:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
});

router.post("/api/logout", (req, res) => {
  const sameSite = process.env.NODE_ENV === "production" ? "none" : "lax";

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

router.get(["/ready", "/health", "/api/ready"], (req, res) => {
  res.status(200).json({
    success: true,
    message: "READY",
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

router.post("/api/analytics/visit", async (req, res) => {
  try {
    const userId = req.body.deviceId || req.user?.id || req.ip;
    await recordVisit(userId);
    res.status(200).json({
      success: true,
      message: "Visit recorded",
      data: null,
    });
  } catch (error) {
    console.error("Error recording visit:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
});

router.get("/api/system/stats", async (req, res) => {
  try {
    const controllerStartTimeMs = Date.now();
    const cacheKey = buildCacheKey("home:system-stats", { endpoint: "/api/system/stats" });
    const stats = await getOrSetCache({
      key: cacheKey,
      ttlSeconds: 30,
      label: "Homepage System Stats",
      controllerStartTimeMs,
      getter: async () => await getStats()
    });

    res.status(200).json({
      success: true,
      message: "Stats fetched successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
});

export default router;
