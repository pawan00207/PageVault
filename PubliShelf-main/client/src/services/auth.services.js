//client/src/services/auth.services.js
import axiosInstance from "../utils/axiosInstance.util.js";

export const login = async (credentials) => {
  const response = await axiosInstance.post("auth/login", credentials);
  return response.data;
};

export const signupUser = async (payload) => {
  const response = await axiosInstance.post("auth/signup", payload);
  return response.data;
};

export const googleAuth = async (payload) => {
  const response = await axiosInstance.post("auth/google", payload);
  return response.data;
};

export const sendOtp = async (payload) => {
  const response = await axiosInstance.post("auth/send-otp", payload);
  return response.data;
};

export const verifyOtp = async (payload) => {
  const response = await axiosInstance.post("auth/verify-otp", payload);
  return response.data;
};

export const resendOtp = async (payload) => {
  const response = await axiosInstance.post("auth/resend-otp", payload);
  return response.data;
};

export const forgotPassword = async (payload) => {
  const response = await axiosInstance.post("auth/forgot-password", payload);
  return response.data;
};

export const verifyResetOtp = async (payload) => {
  const response = await axiosInstance.post("auth/verify-reset-otp", payload);
  return response.data;
};

export const resetPassword = async (payload) => {
  const response = await axiosInstance.post("auth/reset-password", payload);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get("auth/me");
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("auth/logout");
  return response.data;
};