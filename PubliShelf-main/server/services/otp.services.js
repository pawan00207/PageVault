import bcrypt from "bcrypt";
import Buyer from "../models/Buyer.model.js";
import Publisher from "../models/Publisher.model.js";
import Manager from "../models/Manager.model.js";
import EmailOtp from "../models/EmailOtp.model.js";
import { generateNumericOtp, normalizeEmail } from "../utils/otp.js";
import { sendOtpEmail } from "./email.service.js";

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_MAX_RESENDS = 5;

const roleModels = {
  buyer: Buyer,
  publisher: Publisher,
  manager: Manager,
};

const normalizePurpose = (purpose) => (purpose === "forgot-password" ? "reset_password" : purpose || "signup");

const getRoleModel = (role) => roleModels[role] || null;

const buildDisplayName = (userData) => {
  if (!userData) return "there";

  if (userData.firstname && userData.lastname) {
    return `${userData.firstname} ${userData.lastname}`.trim();
  }

  return userData.name || userData.publishingHouse || userData.email || "there";
};

const toErrorResult = (code, message, extra = {}) => ({ success: false, code, message, ...extra });

export const findAnyUserByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  for (const [role, Model] of Object.entries(roleModels)) {
    const user = await Model.findOne({ email: normalizedEmail });
    if (user) {
      return { role, user };
    }
  }

  return null;
};

export const signupUser = async ({ role, firstname, lastname, publishingHouse, email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const Model = getRoleModel(role);

  if (!Model) {
    return toErrorResult(400, "Invalid account type");
  }

  if (!firstname || !lastname || !normalizedEmail || !password) {
    return toErrorResult(400, "Firstname, lastname, email, and password are required");
  }

  if (role === "publisher" && !publishingHouse) {
    return toErrorResult(400, "Publishing house is required");
  }

  const existingAccount = await findAnyUserByEmail(normalizedEmail);
  if (existingAccount && existingAccount.user?.isVerified === true) {
    return toErrorResult(409, "Email is already registered and verified");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const payload = {
    firstname: firstname.trim(),
    lastname: lastname.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    isVerified: false,
    verifiedAt: null,
    otpExpiry: new Date(Date.now() + OTP_EXPIRY_MS),
  };

  if (role === "publisher") {
    payload.publishingHouse = publishingHouse.trim();
  }

  let user;
  if (existingAccount && existingAccount.role === role) {
    existingAccount.user.set(payload);
    user = await existingAccount.user.save();
  } else if (existingAccount && existingAccount.role !== role) {
    return toErrorResult(409, "Email is already in use");
  } else {
    user = await Model.create(payload);
  }

  const otpResult = await issueOtp({
    email: normalizedEmail,
    purpose: "signup",
    role,
    displayName: buildDisplayName(user),
  });

  if (!otpResult.success) {
    return otpResult;
  }

  return {
    success: true,
    code: 201,
    message: "Registration started. Check your email for the verification code.",
    data: {
      email: normalizedEmail,
      role,
      otpExpiresAt: otpResult.data.expiresAt,
    },
  };
};

export const issueOtp = async ({ email, purpose = "signup", role = "", displayName = "", force = false }) => {
  const normalizedPurpose = normalizePurpose(purpose);
  const normalizedEmail = normalizeEmail(email);
  const now = new Date();
  const existingOtp = await EmailOtp.findOne({ email: normalizedEmail, purpose: normalizedPurpose });

  if (existingOtp && !force) {
    const timeSinceLastSend = existingOtp.lastSentAt ? now.getTime() - existingOtp.lastSentAt.getTime() : OTP_RESEND_COOLDOWN_MS;
    if (timeSinceLastSend < OTP_RESEND_COOLDOWN_MS) {
      return toErrorResult(429, "Please wait before requesting another OTP", {
        retryAfterSeconds: Math.ceil((OTP_RESEND_COOLDOWN_MS - timeSinceLastSend) / 1000),
      });
    }

    if (existingOtp.resendCount >= OTP_MAX_RESENDS) {
      return toErrorResult(429, "Too many resend attempts. Please try again later.");
    }
  }

  const otp = generateNumericOtp(6);
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);

  const otpDoc = await EmailOtp.findOneAndUpdate(
    { email: normalizedEmail, purpose: normalizedPurpose },
    {
      email: normalizedEmail,
      purpose: normalizedPurpose,
      otpHash,
      expiresAt,
      attempts: 0,
      resendCount: existingOtp ? existingOtp.resendCount + 1 : 0,
      lastSentAt: now,
      displayName,
      role,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  try {
    await sendOtpEmail({
      to: normalizedEmail,
      name: displayName,
      otp,
      purpose: normalizedPurpose,
      expiresInMinutes: 10,
    });
  } catch (error) {
    console.error("OTP email send failed:", error);
    await EmailOtp.deleteOne({ _id: otpDoc._id });
    return toErrorResult(500, error.message || "Failed to send OTP email");
  }

  return {
    success: true,
    code: 200,
    message: normalizedPurpose === "reset_password" ? "OTP sent for password reset" : "OTP sent successfully",
    data: {
      email: normalizedEmail,
      purpose: normalizedPurpose,
      expiresAt,
      resendCooldownSeconds: Math.ceil(OTP_RESEND_COOLDOWN_MS / 1000),
    },
  };
};

export const verifyOtp = async ({ email, otp, purpose = "signup", role, consume = true }) => {
  const normalizedPurpose = normalizePurpose(purpose);
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !otp) {
    return toErrorResult(400, "Email and OTP are required");
  }

  const otpRecord = await EmailOtp.findOne({ email: normalizedEmail, purpose: normalizedPurpose });
  if (!otpRecord) {
    return toErrorResult(404, "OTP expired or not found. Please resend the code.");
  }

  if (otpRecord.expiresAt.getTime() < Date.now()) {
    await EmailOtp.deleteOne({ _id: otpRecord._id });
    return toErrorResult(400, "OTP has expired. Please resend the code.");
  }

  if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
    await EmailOtp.deleteOne({ _id: otpRecord._id });
    return toErrorResult(429, "Too many invalid OTP attempts. Please resend the code.");
  }

  const isOtpValid = await bcrypt.compare(String(otp), otpRecord.otpHash);
  if (!isOtpValid) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    return toErrorResult(400, "Invalid OTP");
  }

  if (normalizedPurpose === "signup") {
    const targetRole = role || otpRecord.role;
    const Model = getRoleModel(targetRole);

    if (!Model) {
      return toErrorResult(400, "Invalid account type");
    }

    const user = await Model.findOne({ email: normalizedEmail });
    if (!user) {
      return toErrorResult(404, "Account not found. Please sign up again.");
    }

    if (user.isVerified === true) {
      await EmailOtp.deleteOne({ _id: otpRecord._id });
      return toErrorResult(409, "Account is already verified");
    }

    user.isVerified = true;
    user.verifiedAt = new Date();
    user.otpExpiry = null;
    await user.save();
  }

  if (consume) {
    await EmailOtp.deleteOne({ _id: otpRecord._id });
  }

  return {
    success: true,
    code: 200,
    message: normalizedPurpose === "reset_password" ? "OTP verified" : "Email verified successfully",
  };
};

export const resendOtp = async ({ email, purpose = "signup", role }) => {
  const normalizedPurpose = normalizePurpose(purpose);
  const normalizedEmail = normalizeEmail(email);
  const existingAccount = await findAnyUserByEmail(normalizedEmail);

  if (normalizedPurpose === "signup") {
    if (!existingAccount) {
      return toErrorResult(404, "Account not found. Please sign up again.");
    }

    if (existingAccount.user?.isVerified === true) {
      return toErrorResult(409, "Account is already verified");
    }
  } else if (normalizedPurpose === "reset_password" && !existingAccount) {
    return toErrorResult(404, "Email is not registered");
  }

  const displayName = existingAccount?.user ? buildDisplayName(existingAccount.user) : "there";

  return issueOtp({
    email: normalizedEmail,
    purpose: normalizedPurpose,
    role: role || existingAccount?.role || "",
    displayName,
  });
};

const findUserModelByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  for (const [role, Model] of Object.entries(roleModels)) {
    const user = await Model.findOne({ email: normalizedEmail });
    if (user) {
      return { role, Model, user };
    }
  }

  return null;
};

export const requestPasswordResetOtp = async ({ email }) => {
  const normalizedEmail = normalizeEmail(email);
  const userRecord = await findUserModelByEmail(normalizedEmail);

  if (!userRecord) {
    return toErrorResult(404, "Email is not registered");
  }

  return issueOtp({
    email: normalizedEmail,
    purpose: "reset_password",
    role: userRecord.role,
    displayName: buildDisplayName(userRecord.user),
  });
};

export const verifyPasswordResetOtp = async ({ email, otp }) => {
  return verifyOtp({ email, otp, purpose: "reset_password", consume: false });
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const normalizedEmail = normalizeEmail(email);

  if (!newPassword || newPassword.trim().length < 3) {
    return toErrorResult(400, "Password must be at least 3 characters long");
  }

  const otpCheck = await verifyOtp({ email: normalizedEmail, otp, purpose: "reset_password", consume: true });
  if (!otpCheck.success) {
    return otpCheck;
  }

  const userRecord = await findUserModelByEmail(normalizedEmail);
  if (!userRecord) {
    return toErrorResult(404, "Email is not registered");
  }

  userRecord.user.password = await bcrypt.hash(newPassword, 10);
  await userRecord.user.save();

  return {
    success: true,
    code: 200,
    message: "Password reset successfully",
  };
};
