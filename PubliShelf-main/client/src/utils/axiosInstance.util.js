import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) return Promise.resolve(error.response);
    return Promise.reject(error);
  }
);

export default axiosInstance;
