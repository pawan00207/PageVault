import mongoose from "mongoose";

const biddingHistorySchema = new mongoose.Schema({
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Buyer",
    required: true,
  },
  bidAmount: { type: Number, required: true },
  bidTime: { type: Date, default: Date.now },
});

const antiqueBookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: String, required: true },
  condition: {
    type: String,
    required: true,
    enum: ["Mint", "Near Mint", "Excellent", "Very Good", "Good", "Fair"],
  },
  basePrice: { type: Number, required: true },
  currentPrice: { type: Number, default: 0 },
  biddingHistory: [biddingHistorySchema],
  auctionStart: { type: Date, required: true },
  auctionEnd: { type: Date, required: true },
  image: { type: String },
  // New: support multiple authentication documents
  authenticationImages: [{ type: String }],
  // Legacy single field kept for backward compatibility (may be null on new records)
  authenticationImage: { type: String },
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Publisher",
    required: true,
  },
  publishedAt: { type: Date, default: Date.now },

  // Verification / moderation state
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved", // legacy items treated as approved
    index: true,
  },
  rejectionReason: { type: String, default: null },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Manager",
    default: null,
  },
}, { timestamps: true });

// With enum-only status, no boolean sync hook is needed

const AntiqueBook = mongoose.model("AntiqueBook", antiqueBookSchema);
export default AntiqueBook;
