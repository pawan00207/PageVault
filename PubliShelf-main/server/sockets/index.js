import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { CLIENT_URL } from "../config/env.js";
import logger from "../config/logger.js";
import { initializeAuctionSocket } from "./auction/auction.socket.js";

export const initializeSocket = async (server) => {
  try {
    const io = new Server(server, {
      cors: {
        origin: CLIENT_URL,
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    logger.debug("Socket.IO initialized");

    await initializeRedisAdapter(io);
    initializeAuctionSocket(io);

    return io;
  } catch (error) {
    logger.error(`Failed to initialize Socket.IO: ${error.message}`);
    throw error;
  }
};

const initializeRedisAdapter = async (io) => {
  const REDIS_URL = process.env.REDIS_URL;

  if (!REDIS_URL) {
    logger.warn("REDIS_URL not configured. Socket.IO will run in single-instance mode.");
    return;
  }

  try {
    const pubClient = createClient({ url: REDIS_URL });
    const subClient = pubClient.duplicate();

    pubClient.on("error", (err) => {
      logger.error("Socket.IO Redis Pub Client Error:", err.message);
    });

    subClient.on("error", (err) => {
      logger.error("Socket.IO Redis Sub Client Error:", err.message);
    });

    await pubClient.connect();
    logger.debug("Socket.IO Redis pub client connected");

    await subClient.connect();
    logger.debug("Socket.IO Redis sub client connected");

    io.adapter(createAdapter(pubClient, subClient));
    logger.debug("Socket.IO Redis adapter attached successfully (multi-process mode enabled)");
  } catch (error) {
    logger.error(`Failed to initialize Redis adapter: ${error.message}`);
    logger.warn("Socket.IO will continue in single-instance mode");
  }
};
