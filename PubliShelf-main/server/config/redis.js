import { createClient } from "redis";
import logger from "./logger.js";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redisClient = null;
let isConnected = false;

const connectRedis = async () => {
  if (redisClient && isConnected) {
    return redisClient;
  }

  try {
    redisClient = createClient({ url: REDIS_URL });

    redisClient.on("error", (err) => {
      logger.error("Redis Client Error:", err);
      isConnected = false;
    });

    redisClient.on("connect", () => {
      logger.debug("Redis connected successfully");
      isConnected = true;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error("Failed to connect to Redis:", error);
    redisClient = null;
    isConnected = false;
    return null;
  }
};

const getRedisClient = () => {
  return isConnected ? redisClient : null;
};

const safeRedisOperation = async (operation) => {
  const client = getRedisClient();
  if (!client) {
    return null;
  }
  try {
    return await operation(client);
  } catch (error) {
    logger.error("Redis operation failed:", error);
    return null;
  }
};

export { connectRedis, getRedisClient, safeRedisOperation };
