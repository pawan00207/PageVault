// client/src/services/buyer.services.js
import axiosInstance from "../utils/axiosInstance.util.js";

export const getDashboard = async () => {
  const response = await axiosInstance.get("buyer/dashboard");
  return response.data;
};

export const getSearchPage = async () => {
  const response = await axiosInstance.get("buyer/search-page");
  return response.data;
};

export const searchBooks = async (query) => {
  console.log(query)
  const response = await axiosInstance.get("buyer/search", { params: { q: query } });
  return response.data;
};

export const filterBooks = async (filters) => {
  const response = await axiosInstance.get("buyer/filter", { params: filters });
  return response.data;
};

export const signupBuyer = async (userData) => {
  const response = await axiosInstance.post("buyer/signup", userData);
  return response.data;
};

export const getProductDetail = async (bookId) => {
  const response = await axiosInstance.get(`buyer/product-detail/${bookId}`);
  return response.data;
};

export const getCart = async () => {
  const response = await axiosInstance.get("buyer/cart");
  return response.data;
};

export const addToCart = async ({ bookId, quantity = 1 }) => {
  const response = await axiosInstance.post("buyer/cart/add", { bookId, quantity });
  return response.data;
};

export const removeFromCart = async (bookId) => {
  const response = await axiosInstance.delete("buyer/cart/remove", { data: { bookId } });
  return response.data;
};

export const addToWishlist = async (bookId) => {
  const response = await axiosInstance.post("buyer/wishlist/add", { bookId });
  return response.data;
};

export const removeFromWishlist = async (bookId) => {
  const response = await axiosInstance.delete(`buyer/wishlist/${bookId}`);
  return response.data;
};

export const updateCartQuantity = async ({ bookId, quantity }) => {
  const response = await axiosInstance.patch("buyer/cart/update-quantity", { bookId, quantity });
  return response.data;
};

export const placeOrder = async ({ addressId, paymentMethod } = {}) => {
  const response = await axiosInstance.post("buyer/checkout/place-order", {
    addressId,
    paymentMethod,
  });
  return response.data;
};

export const getAuctionPage = async () => {
  const response = await axiosInstance.get("buyer/auction-page");
  return response.data;
};

export const getAuctionItemDetail = async (auctionId) => {
  const response = await axiosInstance.get(`buyer/auction-item-detail/${auctionId}`);
  return response.data;
};

export const getAuctionOngoing = async (auctionId) => {
  const response = await axiosInstance.get(`buyer/auction-ongoing/${auctionId}`);
  return response.data;
};

export const getProfile = async () => {
  const response = await axiosInstance.get("buyer/profile");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await axiosInstance.put("buyer/profile", profileData);
  return response.data;
};

export const updateProfileById = async ({ id, profileData }) => {
  const response = await axiosInstance.post(`buyer/update-profile/${id}`, profileData);
  return response.data;
};

// Address CRUD
export const getBuyerAddresses = async () => {
  const response = await axiosInstance.get("buyer/addresses");
  return response.data;
};

export const addBuyerAddress = async (addressData) => {
  const response = await axiosInstance.post("buyer/addresses", addressData);
  return response.data;
};

export const updateBuyerAddress = async (id, addressData) => {
  const response = await axiosInstance.put(`buyer/addresses/${id}`, addressData);
  return response.data;
};

export const deleteBuyerAddress = async (id) => {
  const response = await axiosInstance.delete(`buyer/addresses/${id}`);
  return response.data;
};

export const createCheckoutSession = async ({ addressId, idempotencyKey }) => {
  const response = await axiosInstance.post("buyer/checkout/create-session", { addressId, idempotencyKey });
  return response.data;
};