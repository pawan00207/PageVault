import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const createAuctionSocket = () => {
  // No need to manually extract token - browser sends httpOnly cookie automatically
  const socket = io(`${SOCKET_URL}/auction`, {
    withCredentials: true, // Important: allows cookies to be sent
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
};
