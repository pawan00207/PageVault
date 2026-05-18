//routes/publisher.routes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { getPublisherDashboard, getPublisherProfile, updatePublisherProfile, createPublisherSignup, publishBook, sellAntique, getPublisherBook, updatePublisherBook, deletePublisherBook, restorePublisherBook } from "../controllers/publisher.controller.js";

// Storage for regular book images (restrict to images)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "publishelf/books",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

// Storage for antique uploads: allow images and documents (resource_type auto)
const antiqueStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: "publishelf/antique",
    resource_type: "auto",
    // Let Cloudinary auto-detect; do not restrict formats here
  }),
});

const uploadAntique = multer({ storage: antiqueStorage });

const router = express.Router();

router.get("/dashboard", protect, getPublisherDashboard);
router.get("/profile", protect, getPublisherProfile);
router.put("/profile", protect, updatePublisherProfile);
router.post("/signup", createPublisherSignup);
router.post("/publish-book", protect, upload.single("imageFile"), publishBook);
router.post("/sell-antique", protect, uploadAntique.fields([
  { name: "itemImage", maxCount: 1 },
  { name: "authenticationImages", maxCount: 5 },
]), sellAntique);

router.get('/book/:id', protect, getPublisherBook);
router.put('/book/:id', protect, upload.single('imageFile'), updatePublisherBook);
router.delete('/book/:id', protect, deletePublisherBook);
router.put('/book/:id/restore', protect, restorePublisherBook);

export default router;