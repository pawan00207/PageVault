import Analytics from "../models/Analytics.model.js";
import { safeRedisOperation } from "../config/redis.js";
import logger from "../config/logger.js";

const TOTAL_VIEWS_KEY = "analytics:views:total";
const TOTAL_USERS_KEY = "analytics:users:total";
const DAILY_VIEWS_KEY_PREFIX = "analytics:views";
const DAILY_USERS_KEY_PREFIX = "analytics:users";

const DAILY_KEY_TTL = 86400 * 3;

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const recordVisit = async (userId) => {
  const today = getTodayDate();
  const userIdentifier = userId || "anonymous";

  const success = await safeRedisOperation(async (client) => {
    await client.incr(TOTAL_VIEWS_KEY);
    await client.incr(`${DAILY_VIEWS_KEY_PREFIX}:${today}`);
    await client.sAdd(`${DAILY_USERS_KEY_PREFIX}:${today}`, userIdentifier);
    await client.sAdd(TOTAL_USERS_KEY, userIdentifier);
    await client.expire(`${DAILY_VIEWS_KEY_PREFIX}:${today}`, DAILY_KEY_TTL);
    await client.expire(`${DAILY_USERS_KEY_PREFIX}:${today}`, DAILY_KEY_TTL);
    return true;
  });

  if (!success) {
    logger.warn("Redis unavailable for visit recording, falling back to MongoDB");
    try {
      await Analytics.findOneAndUpdate(
        { date: today },
        { $inc: { viewsToday: 1 } },
        { upsert: true }
      );
    } catch (error) {
      logger.error("Failed to record visit to MongoDB:", error);
    }
  }
};

const persistSnapshotToMongoDB = async () => {
  const today = getTodayDate();

  try {
    const stats = await safeRedisOperation(async (client) => {
      const [totalViews, todayViews, todayUsers] = await Promise.all([
        client.get(TOTAL_VIEWS_KEY),
        client.get(`${DAILY_VIEWS_KEY_PREFIX}:${today}`),
        client.sCard(`${DAILY_USERS_KEY_PREFIX}:${today}`),
      ]);
      return {
        totalViews: parseInt(totalViews) || 0,
        viewsToday: parseInt(todayViews) || 0,
        usersToday: todayUsers || 0,
      };
    });

    if (!stats) {
      return;
    }

    await Analytics.findOneAndUpdate(
      { date: today },
      {
        viewsToday: stats.viewsToday,
        usersToday: stats.usersToday,
      },
      { upsert: true }
    );

    logger.info(`Persisted analytics snapshot for ${today}`);
  } catch (error) {
    logger.error("Failed to persist snapshot to MongoDB:", error);
  }
};

export const getStats = async () => {
  const today = getTodayDate();

  let totalViews = 0;
  let totalUsers = 0;
  let viewsToday = 0;
  let usersToday = 0;

  const redisStats = await safeRedisOperation(async (client) => {
    const [total, totalUsersCount, todayViews, todayUsers] = await Promise.all([
      client.get(TOTAL_VIEWS_KEY),
      client.sCard(TOTAL_USERS_KEY),
      client.get(`${DAILY_VIEWS_KEY_PREFIX}:${today}`),
      client.sCard(`${DAILY_USERS_KEY_PREFIX}:${today}`),
    ]);
    return {
      totalViews: parseInt(total) || 0,
      totalUsers: totalUsersCount || 0,
      viewsToday: parseInt(todayViews) || 0,
      usersToday: todayUsers || 0,
    };
  });

  if (redisStats) {
    totalViews = redisStats.totalViews;
    totalUsers = redisStats.totalUsers;
    viewsToday = redisStats.viewsToday;
    usersToday = redisStats.usersToday;

    persistSnapshotToMongoDB().catch((err) => {
      logger.error("Background persistence failed:", err);
    });
  } else {
    try {
      const todayDoc = await Analytics.findOne({ date: today });

      if (todayDoc) {
        totalViews = todayDoc.viewsToday || 0;
        viewsToday = todayDoc.viewsToday || 0;
        usersToday = todayDoc.usersToday || 0;

        await safeRedisOperation(async (client) => {
          await client.set(TOTAL_VIEWS_KEY, totalViews.toString());
          await client.set(`${DAILY_VIEWS_KEY_PREFIX}:${today}`, viewsToday.toString());
          await client.expire(`${DAILY_VIEWS_KEY_PREFIX}:${today}`, DAILY_KEY_TTL);
        });
      }
    } catch (error) {
      logger.error("Failed to fetch analytics from MongoDB:", error);
    }
  }

  return {
    totalViews,
    totalUsers,
    viewsToday,
    usersToday,
  };
};

export const initializeAnalytics = async () => {
  const today = getTodayDate();

  try {
    const existingTotal = await safeRedisOperation(async (client) => {
      return await client.get(TOTAL_VIEWS_KEY);
    });

    if (!existingTotal) {
      const todayDoc = await Analytics.findOne({ date: today });

      if (todayDoc) {
        await safeRedisOperation(async (client) => {
          await client.set(TOTAL_VIEWS_KEY, (todayDoc.viewsToday || 0).toString());
          await client.set(`${DAILY_VIEWS_KEY_PREFIX}:${today}`, (todayDoc.viewsToday || 0).toString());
          await client.expire(`${DAILY_VIEWS_KEY_PREFIX}:${today}`, DAILY_KEY_TTL);
        });
        logger.info(`Initialized analytics from MongoDB for ${today}`);
      }
    }
  } catch (error) {
    logger.error("Failed to initialize analytics:", error);
  }
};
