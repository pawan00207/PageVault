import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getStripeSessionAndOrder } from "../services/stripe.services.js";

const router = express.Router();

router.get("/stripe/session/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { session, order } = await getStripeSessionAndOrder(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found for this session" });
    }

    return res.status(200).json({
      success: true,
      data: {
        paymentStatus: order.paymentStatus,
        order: {
          id: order._id,
          items: order.items,
          deliveryAddress: order.deliveryAddress,
          grandTotal: order.grandTotal,
          status: order.status,
        },
        session: {
          id: session.id,
          payment_status: session.payment_status,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching Stripe session/order:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch Stripe session" });
  }
});

export default router;
