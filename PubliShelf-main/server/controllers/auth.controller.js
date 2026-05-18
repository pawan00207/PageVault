//controllers/auth.controller.js
import { loginUser } from "../services/auth.services.js";
import { googleAuthUser } from "../services/googleAuth.services.js";
import { issueOtp, resendOtp, requestPasswordResetOtp, resetPassword, signupUser, verifyOtp, verifyPasswordResetOtp } from "../services/otp.services.js";
import { getCookieOptions } from "../config/cookie.js";

export const loginPostController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    if (result.code === 403) {
      const message = result.message || "User not found";
      return res.status(403).json({
        success: false,
        message: message,
        data: result.details || null
      });
    }

    if (result.code === 401) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
        data: null
      });
    }

    res.cookie("token", result.token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user: result.user }
    });
  } catch (error) {
    console.error("Error in loginPostController:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      data: null
    });
  }
};

export const getMeController = async (req, res) => {
  try {
    // req.user is set by the protect middleware after verifying token
    console.log("auth controller getme", req?.body , req?.user);
    return res.status(200).json({
      success: true,
      message: "User verified",
      data: { 
        user: {
          id: req.user.id,
          role: req.user.role
        }
      }
    });
  } catch (error) {
    console.error("Error in getMeController:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      data: null
    });
  }
};

export const logoutController = async (req, res) => {
  try {
    res.clearCookie("token", getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
      data: null
    });
  } catch (error) {
    console.error("Error in logoutController:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      data: null
    });
  }
};

export const googleAuthController = async (req, res) => {
  try {
    const result = await googleAuthUser({
      credential: req.body?.credential,
      role: req.body?.role,
    });

    if (!result.success) {
      return res.status(result.code || 400).json({
        success: false,
        message: result.message,
        data: result.data || null,
      });
    }

    if (result.token) {
      res.cookie("token", result.token, getCookieOptions());
    }

    return res.status(result.code === 202 ? 202 : 200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
        authenticated: Boolean(result.token),
      },
    });
  } catch (error) {
    console.error("Error in googleAuthController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      data: null,
    });
  }
};

export const signupController = async (req, res) => {
  try {
    const result = await signupUser(req.body || {});

    if (!result.success) {
      return res.status(result.code || 400).json({
        success: false,
        message: result.message,
        data: result.data || null,
      });
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error in signupController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      data: null,
    });
  }
};

export const sendOtpController = async (req, res) => {
  try {
    const result = await issueOtp({
      email: req.body?.email,
      purpose: req.body?.purpose || "signup",
      role: req.body?.role,
      displayName: req.body?.name || req.body?.displayName || "",
    });

    if (!result.success) {
      return res.status(result.code || 400).json({
        success: false,
        message: result.message,
        data: result.data || null,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in sendOtpController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      data: null,
    });
  }
};

export const verifyOtpController = async (req, res) => {
  try {
    const result = await verifyOtp({
      email: req.body?.email,
      otp: req.body?.otp,
      purpose: req.body?.purpose || "signup",
      role: req.body?.role,
    });

    if (!result.success) {
      return res.status(result.code || 400).json({
        success: false,
        message: result.message,
        data: result.data || null,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in verifyOtpController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      data: null,
    });
  }
};

export const resendOtpController = async (req, res) => {
  try {
    const result = await resendOtp({
      email: req.body?.email,
      purpose: req.body?.purpose || "signup",
      role: req.body?.role,
    });

    if (!result.success) {
      return res.status(result.code || 400).json({
        success: false,
        message: result.message,
        data: result.data || null,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in resendOtpController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      data: null,
    });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const result = await requestPasswordResetOtp({ email: req.body?.email });

    if (!result.success) {
      return res.status(result.code || 400).json({
        success: false,
        message: result.message,
        data: result.data || null,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in forgotPasswordController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      data: null,
    });
  }
};

export const verifyResetOtpController = async (req, res) => {
  try {
    const result = await verifyPasswordResetOtp({ email: req.body?.email, otp: req.body?.otp });

    if (!result.success) {
      return res.status(result.code || 400).json({
        success: false,
        message: result.message,
        data: result.data || null,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in verifyResetOtpController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      data: null,
    });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const result = await resetPassword({
      email: req.body?.email,
      otp: req.body?.otp,
      newPassword: req.body?.newPassword,
    });

    if (!result.success) {
      return res.status(result.code || 400).json({
        success: false,
        message: result.message,
        data: result.data || null,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in resetPasswordController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      data: null,
    });
  }
};
