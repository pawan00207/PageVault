//client/src/services/publisher.services.js
import axiosInstance from "../utils/axiosInstance.util.js";

export const getDashboard = async () => {
  const response = await axiosInstance.get("/publisher/dashboard");
  return response.data;
};

export const getProfile = async () => {
  const response = await axiosInstance.get("/publisher/profile");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await axiosInstance.put("/publisher/profile", profileData);
  return response.data;
};

export const signupPublisher = async (userData) => {
  const response = await axiosInstance.post("/publisher/signup", userData);
  return response.data;
};

export const publishBook = async (formData) => {
  const response = await axiosInstance.post("/publisher/publish-book", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const sellAntique = async (formData) => {
  const response = await axiosInstance.post("/publisher/sell-antique", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getBook = async (bookId) => {
  const response = await axiosInstance.get(`/publisher/book/${bookId}`);
  return response.data;
};

export const updateBook = async (bookId, data) => {
  const config = data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
  const response = await axiosInstance.put(`/publisher/book/${bookId}`, data, config);
  return response.data;
};

export const softDeleteBook = async (bookId) => {
  const response = await axiosInstance.delete(`/publisher/book/${bookId}`);
  return response.data;
};

export const restoreBook = async (bookId) => {
  const response = await axiosInstance.put(`/publisher/book/${bookId}/restore`);
  return response.data;
};