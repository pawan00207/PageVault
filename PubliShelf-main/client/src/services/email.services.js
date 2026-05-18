import axiosInstance from "../utils/axiosInstance.util.js";

export const sendContactEmail = async (emailData) => {
  const response = await axiosInstance.post(
    "https://api.emailjs.com/api/v1.0/email/send",
    emailData,
    { withCredentials: false }
  );
  return response.data;
};
