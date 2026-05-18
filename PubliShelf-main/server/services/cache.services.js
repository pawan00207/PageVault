import logger from "../config/logger.js";
import { safeRedisOperation } from "../config/redis.js";

const CACHE_PREFIX = "cache";

const normalizeForKey = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeForKey);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalizeForKey(value[key]);
        return acc;
      }, {});
  }

  return value;
};

export const buildCacheKey = (namespace, payload = {}) => {
  const normalizedPayload = normalizeForKey(payload);
  return `${CACHE_PREFIX}:${namespace}:${JSON.stringify(normalizedPayload)}`;
};

export const getOrSetCache = async ({ key, ttlSeconds, label, getter, controllerStartTimeMs = null }) => {
  const cachedRaw = await safeRedisOperation(async (client) => {
    return await client.get(key);
  });

  const buildControllerDurationLogPart = () => {
    if (!controllerStartTimeMs) {
      return "";
    }
    return ` | controllerMs=${Date.now() - controllerStartTimeMs}ms`;
  };

  if (cachedRaw !== null && cachedRaw !== undefined) {
    try {
      logger.info(`[REDIS CACHE HIT] ${label} | key=${key}${buildControllerDurationLogPart()}`);
      return JSON.parse(cachedRaw);
    } catch (error) {
      logger.warn(`[REDIS CACHE CORRUPT] ${label} | key=${key}${buildControllerDurationLogPart()}`);
    }
  }

  const freshData = await getter();

  await safeRedisOperation(async (client) => {
    await client.set(key, JSON.stringify(freshData), { EX: ttlSeconds });
    return true;
  });

  logger.info(`[REDIS CACHE MISS] ${label} | key=${key}${buildControllerDurationLogPart()}`);

  return freshData;
};
