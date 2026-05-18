import mongoose from "mongoose";

// Order Item subdocument
const orderItemSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    // Snapshot fields for resilience against later book edits
    title: { type: String, required: true },
    image: { type: String },
    publisher: { type: mongoose.Schema.Types.ObjectId, ref: "Publisher", required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "Buyer", required: true, index: true },
    items: { type: [orderItemSchema], required: true, validate: v => Array.isArray(v) && v.length > 0 },
    publishers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Publisher", index: true }],

    deliveryAddress: { type: deliveryAddressSchema, required: true },

    paymentMethod: { type: String, enum: ["COD", "ONLINE"], default: "COD" },
    paymentProvider: { type: String, enum: ["stripe", "cod"], default: "cod" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending", index: true },
    transactionId: { type: String },
    stripeCheckoutSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    idempotencyKey: { type: String, unique: true, sparse: true },

    statusHistory: [{
      status: { type: String },
      source: { type: String },
      reason: { type: String },
      timestamp: { type: Date, default: Date.now }
    }],

    status: {
      type: String,
      enum: ["created", "paid", "processing", "shipped", "delivered", "cancelled"],
      default: "created",
      index: true,
    },

    currency: { type: String, default: "INR" },
    itemsTotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0, default: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

// Indexes for common queries
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "items.book": 1 });
orderSchema.index({ "items.publisher": 1, createdAt: -1 });
orderSchema.index({ publishers: 1, createdAt: -1 });

// Pre-save hook to ensure publishers array is synced from items
orderSchema.pre("save", function (next) {
  if (this.items && this.items.length > 0) {
    const pubs = new Set();
    this.items.forEach((it) => it.publisher && pubs.add(it.publisher.toString()));
    this.publishers = Array.from(pubs);
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
