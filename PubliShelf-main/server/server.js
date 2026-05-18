import 'dotenv/config'
import http from "http";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { UAParser } from 'ua-parser-js';
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { PORT, MONGODB_URI, CLIENT_URL } from "./config/env.js";
import logger from "./config/logger.js";
import { securityConfig } from "./config/security.js";
import { apiLimiter } from "./config/rateLimiter.js";
import swaggerSpec from "./config/swagger.js";
import { initializeAnalytics } from "./services/analytics.services.js";
import { initializeSocket } from "./sockets/index.js";

import buyerRoutes from "./routes/buyer.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import publisherRoutes from "./routes/publisher.routes.js";
import managerRoutes from "./routes/manager.routes.js";
import authRoutes from "./routes/auth.routes.js";
import systemRoutes from "./routes/system.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import { handleStripeWebhook } from "./services/stripe.services.js";
import errorHandler from "./middleware/errorHandler.middleware.js";
import notFoundHandler from "./middleware/notFoundHandler.middleware.js";

connectDB(MONGODB_URI);
connectRedis().then(() => {
  initializeAnalytics();
});

const app = express();

app.use(securityConfig);
app.set('trust proxy', 1);
app.use('/api/', apiLimiter);

morgan.token('device', (req) => {
  const ua = new UAParser(req.headers['user-agent']);
  const device = ua.getDevice();
  return device.model ? `${device.vendor || ''} ${device.model}`.trim() : 'Desktop';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :device', { stream: logger.stream }));

app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error("STRIPE_WEBHOOK_SECRET is not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  try {
    await handleStripeWebhook(req, signature, webhookSecret);
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error(`Webhook error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

app.use(cors({ origin: true, credentials: true}));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use("/api/buyer", buyerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/publisher", publisherRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use(systemRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const httpServer = http.createServer(app);

initializeSocket(httpServer).then(() => {
  httpServer.listen(PORT, '0.0.0.0', () => { 
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Socket.IO enabled on port ${PORT}`);
  });
}).catch((error) => {
  logger.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});