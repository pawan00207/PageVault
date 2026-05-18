import mongoose from "mongoose";

const publisherSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    publishingHouse: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false, default: null },
    authProvider: { type: String, enum: ["local", "google"], default: "local", index: true },
    googleId: { type: String, default: "", index: true },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    otpExpiry: { type: Date, default: null },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],

    // Optional contact/business fields used by Admin UI
    phoneNumber: { type: String, default: "" },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },
    gstNumber: { type: String, default: "" },

    // Compact, clear status fields
    moderation: {
      status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
      by: { type: mongoose.Schema.Types.ObjectId, default: null },
      at: { type: Date, default: null, index: true },
      reason: { type: String, default: null },
    },
    account: {
      status: { type: String, enum: ["active", "banned"], default: "active", index: true },
      by: { type: mongoose.Schema.Types.ObjectId, default: null },
      at: { type: Date, default: null, index: true },
      reason: { type: String, default: null },
    },
  },
  { timestamps: true }
);

const Publisher = mongoose.model("Publisher", publisherSchema);
export default Publisher;