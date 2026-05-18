import { OAuth2Client } from "google-auth-library";
import Buyer from "../models/Buyer.model.js";
import Publisher from "../models/Publisher.model.js";
import Manager from "../models/Manager.model.js";
import { generateToken } from "../utils/jwt.js";
import { findAnyUserByEmail } from "./otp.services.js";
import { GOOGLE_CLIENT_ID } from "../config/env.js";
import logger from "../config/logger.js";

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

const roleModels = {
  buyer: Buyer,
  publisher: Publisher,
  manager: Manager,
};

const toErrorResult = (code, message, extra = {}) => ({ success: false, code, message, ...extra });

const getRoleModel = (role) => roleModels[role] || null;

const normalizeProfileName = (profile) => {
  const emailPrefix = profile.email.split("@")[0] || "Google";
  const givenName = (profile.givenName || "").trim();
  const familyName = (profile.familyName || "").trim();
  const displayName = (profile.displayName || "").trim();
  const normalizedEmail = (profile.email || "").trim().toLowerCase();

  if (givenName || familyName) {
    return {
      email: normalizedEmail,
      firstname: givenName || displayName || emailPrefix,
      lastname: familyName || "User",
      displayName: displayName || `${givenName || emailPrefix} ${familyName || "User"}`.trim(),
    };
  }

  const parts = displayName.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return {
      email: normalizedEmail,
      firstname: parts[0],
      lastname: parts.slice(1).join(" "),
      displayName,
    };
  }

  return {
    email: normalizedEmail,
    firstname: displayName || emailPrefix,
    lastname: "User",
    displayName: displayName || `${emailPrefix} User`,
  };
};

const buildPublisherHouse = (profile) => {
  const fallback = profile.displayName || profile.firstname || profile.email.split("@")[0] || "Google Publisher";
  return fallback.trim() || "Google Publisher";
};

const buildUserSession = async (role, userId) => {
  if (role === "buyer") {
    const buyerDoc = await Buyer.findById(userId).populate("cart.book").populate("wishlist").lean();
    if (!buyerDoc) return null;
    const { password, ...userWithoutPassword } = buyerDoc;
    return { ...userWithoutPassword, role: "buyer" };
  }

  if (role === "publisher") {
    const publisherDoc = await Publisher.findById(userId)
      .populate("books")
      .populate("moderation.by", "firstname lastname email")
      .populate("account.by", "firstname lastname email")
      .lean();

    if (!publisherDoc) return null;
    const { password, ...userWithoutPassword } = publisherDoc;
    return { ...userWithoutPassword, role: "publisher" };
  }

  if (role === "manager") {
    const managerDoc = await Manager.findById(userId)
      .populate("moderation.by", "firstname lastname email")
      .populate("account.by", "name email")
      .lean();

    if (!managerDoc) return null;
    const { password, ...userWithoutPassword } = managerDoc;
    return { ...userWithoutPassword, role: "manager" };
  }

  return null;
};

const isBuyerAccessible = (buyerDoc) => buyerDoc?.isVerified !== false;

const isPublisherAccessible = (publisherDoc) => {
  const isBanned = publisherDoc.account?.status === "banned" || publisherDoc.banned === true;
  if (isBanned) {
    return { allowed: false, code: 403, message: "Your account has been banned. Please contact support." };
  }

  const isApproved = publisherDoc.moderation?.status === "approved" || publisherDoc.isVerified === true;
  const isPending = publisherDoc.moderation?.status === "pending" || (!publisherDoc.moderation?.status && !publisherDoc.isVerified);
  const isRejected = publisherDoc.moderation?.status === "rejected";

  if (isPending) {
    return { allowed: false, code: 403, message: "Your account is pending verification. Please wait for manager approval." };
  }

  if (isRejected) {
    return { allowed: false, code: 403, message: "Your account was rejected. Please contact support." };
  }

  if (!isApproved) {
    return { allowed: false, code: 403, message: "Your account is under review. Please wait for approval." };
  }

  return { allowed: true };
};

const isManagerAccessible = (managerDoc) => {
  const isBanned = managerDoc.account?.status === "banned";
  if (isBanned) {
    return { allowed: false, code: 403, message: "Your account has been banned. Please contact support." };
  }

  const isApproved = managerDoc.moderation?.status === "approved";
  const isPending = managerDoc.moderation?.status === "pending";
  const isRejected = managerDoc.moderation?.status === "rejected";

  if (isPending) {
    return { allowed: false, code: 403, message: "Your account is pending verification. Please wait for admin approval." };
  }

  if (isRejected) {
    return { allowed: false, code: 403, message: "Your account was rejected. Please contact support." };
  }

  if (!isApproved) {
    return { allowed: false, code: 403, message: "Your account is under review. Please wait for approval." };
  }

  return { allowed: true };
};

const createUserForRole = async ({ role, profile, googleId }) => {
  const Model = getRoleModel(role);

  if (!Model) {
    return toErrorResult(400, "Invalid account type");
  }

  const basePayload = {
    firstname: profile.firstname,
    lastname: profile.lastname,
    email: profile.email,
    password: null,
    authProvider: "google",
    googleId,
    isVerified: true,
    verifiedAt: new Date(),
    otpExpiry: null,
  };

  if (role === "buyer") {
    const createdUser = await Model.create(basePayload);
    return { success: true, user: createdUser, role };
  }

  if (role === "publisher") {
    const createdUser = await Model.create({
      ...basePayload,
      publishingHouse: buildPublisherHouse(profile),
    });
    return { success: true, user: createdUser, role };
  }

  if (role === "manager") {
    const createdUser = await Model.create(basePayload);
    return { success: true, user: createdUser, role };
  }

  return toErrorResult(400, "Invalid account type");
};

const updateExistingUserWithGoogle = async ({ user, googleId }) => {
  if (!user.googleId) {
    user.googleId = googleId;
  }

  if (!user.authProvider) {
    user.authProvider = "local";
  }

  if (user.isVerified !== true) {
    user.isVerified = true;
    user.verifiedAt = new Date();
    user.otpExpiry = null;
  }

  await user.save();
  return { success: true, user };
};

const maskEmail = (email = "") => {
  const [localPart = "", domain = ""] = String(email).split("@");
  if (!localPart || !domain) return "unknown";
  return `${localPart.slice(0, 2)}***@${domain}`;
};

export const googleAuthUser = async ({ credential, role = "" }) => {
  if (!googleClient) {
    logger.error("[google-auth] abort reason=missing_google_client_id envKey=GOOGLE_CLIENT_ID");
    return toErrorResult(500, "Google client ID is not configured");
  }

  if (!credential) {
    logger.warn("[google-auth] abort reason=missing_credential");
    return toErrorResult(400, "Google credential is required");
  }

  let ticket;

  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    logger.error(`[google-auth] token_verification_failed reason=${error?.message || "unknown_error"}`);
    return toErrorResult(401, "Invalid Google token");
  }

  const payload = ticket.getPayload();
  if (!payload) {
    return toErrorResult(401, "Invalid Google token");
  }

  if (!payload.email) {
    logger.warn("[google-auth] abort reason=missing_email_in_payload");
    return toErrorResult(400, "Google account does not provide an email address");
  }

  if (payload.email_verified !== true) {
    logger.warn(`[google-auth] abort reason=unverified_google_email email=${maskEmail(payload.email)}`);
    return toErrorResult(403, "Google email is not verified");
  }

  const normalizedEmail = payload.email.trim().toLowerCase();
  const profile = normalizeProfileName({
    email: normalizedEmail,
    displayName: payload.name || payload.given_name || normalizedEmail.split("@")[0],
    givenName: payload.given_name,
    familyName: payload.family_name,
  });
  const googleId = payload.sub;

  const existingAccount = await findAnyUserByEmail(normalizedEmail);

  if (existingAccount) {
    const { role: existingRole, user } = existingAccount;

    if (user.googleId && user.googleId !== googleId) {
      logger.warn(`[google-auth] abort reason=google_id_mismatch role=${existingRole} email=${maskEmail(normalizedEmail)}`);
      return toErrorResult(409, "This Google account is already linked to a different profile");
    }

    const updateResult = await updateExistingUserWithGoogle({ user, googleId });
    if (!updateResult.success) {
      return updateResult;
    }

    const accessibility =
      existingRole === "buyer"
        ? { allowed: isBuyerAccessible(updateResult.user) }
        : existingRole === "publisher"
          ? isPublisherAccessible(updateResult.user)
          : isManagerAccessible(updateResult.user);

    if (accessibility.allowed === false) {
      logger.warn(`[google-auth] access_denied_existing role=${existingRole} reason=${accessibility.message}`);
      return toErrorResult(accessibility.code || 403, accessibility.message);
    }

    const sessionResult = await buildUserSession(existingRole, updateResult.user._id);
    if (!sessionResult) {
      logger.error(`[google-auth] session_build_failed role=${existingRole} userId=${updateResult.user._id}`);
      return toErrorResult(500, "Unable to load user session");
    }

    const token = generateToken(sessionResult);
    return {
      success: true,
      code: 200,
      message: "Google sign-in successful",
      token,
      user: sessionResult,
    };
  }

  const targetRole = getRoleModel(role) ? role : "buyer";
  const creationResult = await createUserForRole({ role: targetRole, profile, googleId });

  if (!creationResult.success) {
    return creationResult;
  }

  const createdUser = creationResult.user;
  const accessibility =
    targetRole === "buyer"
      ? { allowed: isBuyerAccessible(createdUser) }
      : targetRole === "publisher"
        ? isPublisherAccessible(createdUser)
        : isManagerAccessible(createdUser);

  if (accessibility.allowed === false) {
    const sessionResult = await buildUserSession(targetRole, createdUser._id);
    return {
      success: true,
      code: 202,
      message: "Google account created. Your account is awaiting approval.",
      user: sessionResult,
    };
  }

  const sessionResult = await buildUserSession(targetRole, createdUser._id);
  if (!sessionResult) {
    logger.error(`[google-auth] session_build_failed role=${targetRole} userId=${createdUser._id}`);
    return toErrorResult(500, "Unable to load user session");
  }

  const token = generateToken(sessionResult);
  return {
    success: true,
    code: 200,
    message: "Google account created successfully",
    token,
    user: sessionResult,
  };
};