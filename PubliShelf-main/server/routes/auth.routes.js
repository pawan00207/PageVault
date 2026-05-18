//routes/auth.routes.js
import express from "express";
import { forgotPasswordController, getMeController, googleAuthController, loginPostController, logoutController, resendOtpController, resetPasswordController, sendOtpController, signupController, verifyOtpController, verifyResetOtpController } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/auth/login - Handles login with JSON response and JWT cookie
router.post("/login", loginPostController);

// POST /api/auth/signup - Create a pending account and send OTP
router.post("/signup", signupController);

// POST /api/auth/google - Sign in or sign up with Google OAuth
router.post("/google", googleAuthController);

// POST /api/auth/send-otp - Send a verification OTP
router.post("/send-otp", sendOtpController);

// POST /api/auth/verify-otp - Verify the OTP and activate the account
router.post("/verify-otp", verifyOtpController);

// POST /api/auth/resend-otp - Resend OTP with cooldown handling
router.post("/resend-otp", resendOtpController);

// POST /api/auth/forgot-password - Send reset-password OTP
router.post("/forgot-password", forgotPasswordController);

// POST /api/auth/verify-reset-otp - Verify reset-password OTP
router.post("/verify-reset-otp", verifyResetOtpController);

// POST /api/auth/reset-password - Verify OTP and reset password
router.post("/reset-password", resetPasswordController);

// GET /api/auth/me - Verify token and get current user
router.get("/me", protect, getMeController);

// POST /api/auth/logout - Clear token cookie
router.post("/logout", logoutController);

export default router;