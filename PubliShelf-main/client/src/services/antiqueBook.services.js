//client/src/services/antiqueBook.services.js
import axiosInstance from "../utils/axiosInstance.util.js";

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