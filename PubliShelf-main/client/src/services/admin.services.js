import axiosInstance from "../utils/axiosInstance.util.js";

const handle = (res) => {
  if (!res || res.status >= 400) {
    const err = new Error(res?.data?.message || "Request failed");
    err.response = res || { data: { message: "Request failed" } };
    throw err;
  }
  return res.data;
};

export const loginAdmin = async (credentials) => {
  const response = await axiosInstance.post('/admin/auth/login', credentials);
  return handle(response);
};

export const getAllAdmins = async () => {
  const response = await axiosInstance.get('/admin/admins');
  return handle(response);
};

export const getAdminById = async (adminId) => {
  const response = await axiosInstance.get(`/admin/admins/${adminId}`);
  return handle(response);
};

export const createAdmin = async (adminData) => {
  const response = await axiosInstance.post('/admin/admins', adminData);
  return handle(response);
};

export const updateAdminKey = async (currentKey, newKey) => {
  const response = await axiosInstance.put('/admin/admins/update-key', { currentKey, newKey });
  return handle(response);
};

export const deleteAdmin = async (adminId) => {
  const response = await axiosInstance.delete(`/admin/admins/${adminId}`);
  return handle(response);
};

export const changeAdminKey = async (adminId, newAdminKey) => {
  const response = await axiosInstance.put(`/admin/admins/${adminId}/change-key`, { newAdminKey });
  return handle(response);
};

export const getAllManagers = async () => {
  const response = await axiosInstance.get('/admin/managers');
  return handle(response);
};

export const getManagerById = async (managerId) => {
  const response = await axiosInstance.get(`/admin/managers/${managerId}`);
  return handle(response);
};

export const approveManager = async (managerId) => {
  const response = await axiosInstance.post(`/admin/managers/${managerId}/approve`);
  return handle(response);
};

export const rejectManager = async (managerId, reason) => {
  const response = await axiosInstance.post(`/admin/managers/${managerId}/reject`, { reason });
  return handle(response);
};

export const banManager = async (managerId, reason) => {
  const response = await axiosInstance.post(`/admin/managers/${managerId}/ban`, { reason });
  return handle(response);
};

export const reinstateManager = async (managerId) => {
  const response = await axiosInstance.post(`/admin/managers/${managerId}/reinstate`);
  return handle(response);
};

export const getPlatformAnalytics = async () => {
  const response = await axiosInstance.get('/admin/analytics');
  return handle(response);
};

export const getAllPublishersWithAnalytics = async () => {
  const response = await axiosInstance.get('/admin/publishers-analytics');
  return handle(response);
};

export const getPublisherAnalytics = async (publisherId) => {
  const response = await axiosInstance.get(`/admin/publishers-analytics/${publisherId}`);
  return handle(response);
};

export const getAllManagersWithAnalytics = async () => {
  const response = await axiosInstance.get('/admin/managers-analytics');
  return handle(response);
};

export const getManagerAnalytics = async (managerId) => {
  const response = await axiosInstance.get(`/admin/managers-analytics/${managerId}`);
  return handle(response);
};

export const getAllBuyersWithAnalytics = async () => {
  const response = await axiosInstance.get('/admin/buyers-analytics');
  return handle(response);
};

export const getBuyerAnalytics = async (buyerId) => {
  const response = await axiosInstance.get(`/admin/buyers-analytics/${buyerId}`);
  return handle(response);
};

export const getAllBooksWithAnalytics = async () => {
  const response = await axiosInstance.get('/admin/books-analytics');
  return handle(response);
};

export const getBookAnalytics = async (bookId) => {
  const response = await axiosInstance.get(`/admin/books-analytics/${bookId}`);
  return handle(response);
};

export const getAllAntiqueBooksWithAnalytics = async () => {
  const response = await axiosInstance.get('/admin/antique-books-analytics');
  return handle(response);
};

export const getAntiqueBookAnalytics = async (antiqueBookId) => {
  const response = await axiosInstance.get(`/admin/antique-books-analytics/${antiqueBookId}`);
  return handle(response);
};
