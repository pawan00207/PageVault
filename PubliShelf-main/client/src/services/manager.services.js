import axiosInstance from "../utils/axiosInstance.util.js";

const API_BASE = "manager";

const BOOKS_DISABLED = { success: false, message: "Manager book management is temporarily disabled" };

// ===== Auth Services =====

export const signupManager = async (data) => {
  try {
    const response = await axiosInstance.post(`${API_BASE}/signup`, data);
    return response.data;
  } catch (error) {
    console.error("Error in signupManager:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create account"
    };
  }
};

// ===== Profile Services =====

export const getProfile = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/profile`);
    return response.data;
  } catch (error) {
    console.error("Error fetching manager profile:", error);
    return { success: false, message: "Failed to fetch profile", data: null };
  }
};

export const getDashboard = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/dashboard`);
    return response.data;
  } catch (error) {
    console.error("Error fetching manager dashboard:", error);
    return { success: false, message: "Failed to fetch dashboard", data: null };
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await axiosInstance.put(`${API_BASE}/profile`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating manager profile:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update profile"
    };
  }
};

// ===== Book Management Services (temporarily disabled) =====

export const getPendingBooks = async () => BOOKS_DISABLED;
export const getApprovedBooks = async () => BOOKS_DISABLED;
export const getRejectedBooks = async () => BOOKS_DISABLED;
export const approveBook = async () => BOOKS_DISABLED;
export const rejectBook = async () => BOOKS_DISABLED;
export const flagBook = async () => BOOKS_DISABLED;

// ===== Auction Management Services =====

export const getPendingAuctions = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/auctions/pending`);
    return response.data;
  } catch (error) {
    console.error("Error fetching pending auctions:", error);
    return { success: false, message: "Failed to fetch pending auctions", data: null };
  }
};

export const getApprovedAuctions = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/auctions/approved`);
    return response.data;
  } catch (error) {
    console.error("Error fetching approved auctions:", error);
    return { success: false, message: "Failed to fetch approved auctions", data: null };
  }
};

export const getRejectedAuctions = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/auctions/rejected`);
    return response.data;
  } catch (error) {
    console.error("Error fetching rejected auctions:", error);
    return { success: false, message: "Failed to fetch rejected auctions", data: null };
  }
};

export const getAuctionAnalytics = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/auctions/analytics`);
    return response.data;
  } catch (error) {
    console.error("Error fetching auction analytics:", error);
    return { success: false, message: "Failed to fetch auction analytics", data: null };
  }
};

export const getAuctionOverview = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/auctions/overview`);
    return response.data;
  } catch (error) {
    console.error("Error fetching auction overview:", error);
    return { success: false, message: "Failed to fetch auction overview", data: null };
  }
};

export const getAuctionById = async (auctionId) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/auctions/${auctionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching auction details:", error);
    return { success: false, message: "Failed to fetch auction details", data: null };
  }
};

export const approveAuction = async (auctionId) => {
  try {
    const response = await axiosInstance.put(`${API_BASE}/auctions/${auctionId}/approve`);
    return response.data;
  } catch (error) {
    console.error("Error approving auction:", error);
    return { success: false, message: "Failed to approve auction", data: null };
  }
};

export const rejectAuction = async (auctionId, reason) => {
  try {
    const response = await axiosInstance.put(`${API_BASE}/auctions/${auctionId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error("Error rejecting auction:", error);
    return { success: false, message: "Failed to reject auction", data: null };
  }
};

// ===== Publisher Management Services =====

export const getPendingPublishers = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/publishers/pending`);
    return response.data;
  } catch (error) {
    console.error("Error fetching pending publishers:", error);
    return { success: false, message: "Failed to fetch pending publishers", data: null };
  }
};

export const getActivePublishers = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/publishers/active`);
    return response.data;
  } catch (error) {
    console.error("Error fetching active publishers:", error);
    return { success: false, message: "Failed to fetch active publishers", data: null };
  }
};

export const getBannedPublishers = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/publishers/banned`);
    return response.data;
  } catch (error) {
    console.error("Error fetching banned publishers:", error);
    return { success: false, message: "Failed to fetch banned publishers", data: null };
  }
};

export const approvePublisher = async (publisherId) => {
  try {
    const response = await axiosInstance.put(`${API_BASE}/publishers/${publisherId}/approve`);
    return response.data;
  } catch (error) {
    console.error("Error approving publisher:", error);
    return { success: false, message: "Failed to approve publisher", data: null };
  }
};

export const rejectPublisher = async (publisherId, reason) => {
  try {
    const response = await axiosInstance.put(`${API_BASE}/publishers/${publisherId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error("Error rejecting publisher:", error);
    return { success: false, message: "Failed to reject publisher", data: null };
  }
};

export const banPublisher = async (publisherId, reason) => {
  try {
    const response = await axiosInstance.put(`${API_BASE}/publishers/${publisherId}/ban`, { reason });
    return response.data;
  } catch (error) {
    console.error("Error banning publisher:", error);
    return { success: false, message: "Failed to ban publisher", data: null };
  }
};

export const reinstatePublisher = async (publisherId) => {
  try {
    const response = await axiosInstance.put(`${API_BASE}/publishers/${publisherId}/reinstate`);
    return response.data;
  } catch (error) {
    console.error("Error reinstating publisher:", error);
    return { success: false, message: "Failed to reinstate publisher", data: null };
  }
};

export const getPublisherById = async (publisherId) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/publishers/${publisherId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching publisher details:", error);
    return { success: false, message: "Failed to fetch publisher details", data: null };
  }
};
