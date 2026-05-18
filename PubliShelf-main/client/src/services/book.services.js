//client/src/services/book.services.js
import axiosInstance from "../utils/axiosInstance.util.js";

export const getAllBooks = async () => {
  const response = await axiosInstance.get("buyer/search-page");
  return response.data.books;
};

export const getBookById = async (bookId) => {
  const response = await axiosInstance.get(`buyer/product-detail/${bookId}`);
  return response.data.book;
};

export const searchBooksApi = async (query) => {
  const response = await axiosInstance.get("buyer/search", { params: { q: query } });
  return response.data.books;
};

export const filterBooksApi = async (filters) => {
  const response = await axiosInstance.get("buyer/filter", { params: filters });
  return response.data.books;
};