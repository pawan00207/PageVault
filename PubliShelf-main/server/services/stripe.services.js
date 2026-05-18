import Stripe from "stripe";
import crypto from "crypto";
import Order from "../models/Order.model.js";
import Book from "../models/Book.model.js";
import mongoose from "mongoose";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn("STRIPE_SECRET_KEY is not set. Stripe payments will not work until configured.");
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

const reuseExistingOrderIfAny = async (idempotencyKey) => {
  const existingOrder = await Order.findOne({ idempotencyKey, paymentStatus: "pending" }).lean();
  if (!existingOrder?.stripeCheckoutSessionId) return null;

  const session = await stripe.checkout.sessions.retrieve(existingOrder.stripeCheckoutSessionId);
  return { sessionUrl: session.url, sessionId: session.id, orderId: existingOrder._id.toString() };
};

const persistPendingOrder = async (payload) => {
  try {
    const order = new Order(payload);
    await order.save();
    return order;
  } catch (error) {
    if (error.code === 11000 || error.code === 11001) {
      const existingOrder = await Order.findOne({
        idempotencyKey: payload.idempotencyKey,
      });

      if (!existingOrder) throw error;

      if (existingOrder.paymentStatus !== "pending") {
        throw new Error("Order attempt already finalized");
      }

      if (existingOrder.stripeCheckoutSessionId) {
        const session = await stripe.checkout.sessions.retrieve(existingOrder.stripeCheckoutSessionId);

        return {
          reused: true,
          response: {
            sessionUrl: session.url,
            sessionId: session.id,
            orderId: existingOrder._id.toString(),
          },
        };
      }
      return { recovered: true, order: existingOrder };
    }

    throw error;
  }
};

const buildLineItems = (items) => {
  return items.map((item) => ({
    price_data: {
      currency: "inr",
      product_data: { name: item.title },
      unit_amount: Math.round(item.unitPrice * 100),
    },
    quantity: item.quantity,
  }));
};

const handleSucceedEvent = async (session) => {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const order = await Order.findById(orderId);
  if (!order || ["paid", "refunded"].includes(order.paymentStatus)) return;

  order.paymentStatus = "paid";
  order.status = "paid";
  order.statusHistory.push({ status: "paid", source: "webhook:checkout.session.completed" });

  if (session.payment_intent) {
    order.stripePaymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id;
  }

  await order.save();
};

const handleFailedEvent = async (session) => {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const order = await Order.findById(orderId);
  if (!order || ["paid", "failed", "refunded"].includes(order.paymentStatus)) return;

  const session2 = await mongoose.startSession();
  try {
    await session2.withTransaction(async () => {
      for (const item of order.items) {
        await Book.updateOne(
          { _id: item.book },
          { $inc: { quantity: item.quantity } },
          { session: session2 }
        );
      }

      order.paymentStatus = "failed";
      order.status = "cancelled";
      order.statusHistory.push({
        status: "failed",
        source: "webhook:checkout.session.expired",
        reason: "session_expired",
      });

      await order.save({ session: session2 });
    });
  } finally {
    session2.endSession();
  }
};

export const createStripeCheckoutSession = async ({
  buyer,
  items,
  deliveryAddress,
  itemsTotal,
  shipping,
  tax,
  discount,
  grandTotal,
  successUrl,
  cancelUrl,
  idempotencyKey: requestIdempotencyKey,
}) => {
  if (!stripe) throw new Error("Stripe is not configured");

  const idempotencyKey = requestIdempotencyKey || crypto.randomUUID();

  if (requestIdempotencyKey) {
    const reused = await reuseExistingOrderIfAny(idempotencyKey);
    if (reused) return reused;
  }

  const persisted = await persistPendingOrder({
    buyer,
    items,
    deliveryAddress,
    paymentMethod: "ONLINE",
    paymentProvider: "stripe",
    paymentStatus: "pending",
    status: "created",
    statusHistory: [{ status: "pending", source: "api:create-checkout-session" }],
    currency: "INR",
    itemsTotal,
    shipping,
    tax,
    discount,
    grandTotal,
    idempotencyKey,
  });

  if (persisted?.reused) return persisted.response;

  const order = persisted.recovered ? persisted.order : persisted;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: buildLineItems(items),
    success_url: successUrl,
    cancel_url: cancelUrl,
    currency: "inr",
    customer_email: buyer.email,
    metadata: { orderId: order._id.toString() },
  });

  order.stripeCheckoutSessionId = session.id;
  if (session.payment_intent) {
    order.stripePaymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id;
  }

  await order.save();
  return { sessionUrl: session.url, sessionId: session.id, orderId: order._id.toString() };
};

export const handleStripeWebhook = async (request, signature, webhookSecret) => {
  if (!stripe) throw new Error("Stripe is not configured");

  let event;
  try {
    event = stripe.webhooks.constructEvent(request.body, signature, webhookSecret);
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    await handleSucceedEvent(event.data.object);
  } else if (event.type === "checkout.session.expired") {
    await handleFailedEvent(event.data.object);
  }
};

export const getStripeSessionAndOrder = async (sessionId) => {
  if (!stripe) throw new Error("Stripe is not configured");

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const orderId = session.metadata?.orderId;
  if (!orderId) return { session, order: null };

  const order = await Order.findById(orderId).lean();
  return { session, order };
};

export const refundOrder = async ({ orderId, adminId }) => {
  if (!stripe) throw new Error("Stripe is not configured");

  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  if (order.paymentStatus !== "paid") throw new Error("Only paid orders can be refunded");
  if (order.paymentStatus === "refunded") throw new Error("Order has already been refunded");
  if (!order.stripePaymentIntentId) throw new Error("Order is missing Stripe payment intent id");
  if (order.paymentMethod !== "ONLINE") throw new Error("Only online payments can be refunded through Stripe");

  const refund = await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId });

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      for (const item of order.items) {
        await Book.updateOne(
          { _id: item.book },
          { $inc: { quantity: item.quantity } },
          { session }
        );
      }

      order.paymentStatus = "refunded";
      order.status = "cancelled";
      order.statusHistory.push({
        status: "refunded",
        source: "admin:refund",
        reason: "full_refund",
        timestamp: new Date(),
      });

      await order.save({ session });
    });
  } finally {
    session.endSession();
  }

  return refund;
};
