// services/auth.services.js
import bcrypt from "bcrypt";
import Buyer from "../models/Buyer.model.js";
import Publisher from "../models/Publisher.model.js";
import Manager from "../models/Manager.model.js";
import { generateToken } from "../utils/jwt.js";
import { issueOtp, resendOtp, signupUser, verifyOtp } from "./otp.services.js";

export const loginUser = async (email, password) => {
  try {
    // Try to find a buyer first (only one DB hit if found)
    const buyerDoc = await Buyer.findOne({ email })
      .populate("cart.book")
      .populate("wishlist")
      .lean();

    if (buyerDoc) {
      if (buyerDoc.isVerified === false) {
        return { token: null, user: null, code: 403, message: "Please verify your email before logging in." };
      }

      if (!buyerDoc.password) {
        return { token: null, user: null, code: 403, message: "Please continue with Google to sign in." };
      }

      const isPasswordValid = await bcrypt.compare(password, buyerDoc.password);
      if (!isPasswordValid) return { token: null, user: null, code: 401 };
      const { password: _pw, ...userWithoutPassword } = buyerDoc;
      const user = { ...userWithoutPassword, role: "buyer" };

      const token = generateToken(user);
      return { token, user, code: 0 };
    }

    const publisherDoc = await Publisher.findOne({ email })
      .populate("books")
      .populate("moderation.by", "firstname lastname email")
      .populate("account.by", "firstname lastname email")
      .lean();

    if (publisherDoc) {
      if (publisherDoc.isVerified === false) {
        return { token: null, user: null, code: 403, message: "Please verify your email before logging in." };
      }

      if (!publisherDoc.password) {
        return { token: null, user: null, code: 403, message: "Please continue with Google to sign in." };
      }

      // Check if publisher is banned (new schema or legacy)
      const isBanned = publisherDoc.account?.status === "banned" || publisherDoc.banned === true;
      if (isBanned) {
        const banReason = publisherDoc.account?.reason || publisherDoc.banReason || "policy violation";
        const bannedBy = publisherDoc.account?.by;
        
        // Build manager info with proper null checks
        let managerInfo = "Platform Admin";
        if (bannedBy && bannedBy.firstname && bannedBy.lastname) {
          managerInfo = `${bannedBy.firstname} ${bannedBy.lastname}${bannedBy.email ? ` (${bannedBy.email})` : ''}`;
        }
        
        return { 
          token: null, 
          user: null, 
          code: 403, 
          message: "Your account has been banned. Please contact support.",
          details: {
            reason: banReason,
            actionBy: managerInfo,
            actionDate: publisherDoc.account?.at || publisherDoc.bannedAt || null
          }
        };
      }
      
      // Check verification status (support both new and legacy schema)
      const isApproved = publisherDoc.moderation?.status === "approved" || publisherDoc.isVerified === true;
      const isPending = publisherDoc.moderation?.status === "pending" || 
                        (!publisherDoc.moderation?.status && !publisherDoc.isVerified);
      const isRejected = publisherDoc.moderation?.status === "rejected";
      
      if (isPending) {
        return { token: null, user: null, code: 403, message: "Your account is pending verification. Please wait for manager approval." };
      }
      
      if (isRejected) {
        const reason = publisherDoc.moderation?.reason || publisherDoc.rejectionReason || "verification requirements not met";
        const rejectedBy = publisherDoc.moderation?.by;
        
        // Build manager info with proper null checks
        let managerInfo = "Platform Manager";
        if (rejectedBy && rejectedBy.firstname && rejectedBy.lastname) {
          managerInfo = `${rejectedBy.firstname} ${rejectedBy.lastname}${rejectedBy.email ? ` (${rejectedBy.email})` : ''}`;
        }
        
        return { 
          token: null, 
          user: null, 
          code: 403, 
          message: "Your account was rejected. Please contact support.",
          details: {
            reason: reason,
            actionBy: managerInfo,
            actionDate: publisherDoc.moderation?.at || null
          }
        };
      }
      
      if (!isApproved) {
        return { token: null, user: null, code: 403, message: "Your account is under review. Please wait for approval." };
      }

      const isPasswordValid = await bcrypt.compare(password, publisherDoc.password);
      if (!isPasswordValid) return { token: null, user: null, code: 401 };

      const { password: _pw, ...userWithoutPassword } = publisherDoc;
      const user = { ...userWithoutPassword, role: "publisher" };

      const token = generateToken(user);
      return { token, user, code: 0 };
    }

    const managerDoc = await Manager.findOne({ email })
      .populate("moderation.by", "name email")
      .populate("account.by", "name email")
      .lean();

    if (managerDoc) {
      if (managerDoc.isVerified === false) {
        return { token: null, user: null, code: 403, message: "Please verify your email before logging in." };
      }

      if (!managerDoc.password) {
        return { token: null, user: null, code: 403, message: "Please continue with Google to sign in." };
      }

      // Check if manager is banned
      const isBanned = managerDoc.account?.status === "banned";
      if (isBanned) {
        const banReason = managerDoc.account?.reason || "policy violation";
        const bannedBy = managerDoc.account?.by;
        
        // Build admin info with proper null checks
        let adminInfo = "Platform Admin";
        if (bannedBy && bannedBy.name) {
          adminInfo = `${bannedBy.name}${bannedBy.email ? ` (${bannedBy.email})` : ''}`;
        }
        
        return { 
          token: null, 
          user: null, 
          code: 403, 
          message: "Your account has been banned. Please contact support.",
          details: {
            reason: banReason,
            actionBy: adminInfo,
            actionDate: managerDoc.account?.at || null
          }
        };
      }
      
      // Check verification status
      const isApproved = managerDoc.moderation?.status === "approved";
      const isPending = managerDoc.moderation?.status === "pending";
      const isRejected = managerDoc.moderation?.status === "rejected";
      
      if (isPending) {
        return { token: null, user: null, code: 403, message: "Your account is pending verification. Please wait for admin approval." };
      }
      
      if (isRejected) {
        const reason = managerDoc.moderation?.reason || "verification requirements not met";
        const rejectedBy = managerDoc.moderation?.by;
        
        // Build admin info with proper null checks
        let adminInfo = "Platform Admin";
        if (rejectedBy && rejectedBy.name) {
          adminInfo = `${rejectedBy.name}${rejectedBy.email ? ` (${rejectedBy.email})` : ''}`;
        }
        
        return { 
          token: null, 
          user: null, 
          code: 403, 
          message: "Your account was rejected. Please contact support.",
          details: {
            reason: reason,
            actionBy: adminInfo,
            actionDate: managerDoc.moderation?.at || null
          }
        };
      }
      
      if (!isApproved) {
        return { token: null, user: null, code: 403, message: "Your account is under review. Please wait for approval." };
      }

      const isPasswordValid = await bcrypt.compare(password, managerDoc.password);
      if (!isPasswordValid) return { token: null, user: null, code: 401 };

      const { password: _pw, ...userWithoutPassword } = managerDoc;
      const user = { ...userWithoutPassword, role: "manager" };

      const token = generateToken(user);
      return { token, user, code: 0 };
    }

    return { token: null, user: null, code: 403 };
  } catch (error) {
    console.error("Error logging in user:", error);  
    throw new Error("Error logging in user");
  }
};

export { issueOtp, resendOtp, signupUser, verifyOtp };
