import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true }
}, { _id: true });

const buyerSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false, default: null },
  authProvider: { type: String, enum: ["local", "google"], default: "local", index: true },
  googleId: { type: String, default: "", index: true },
  isVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date, default: null },
  otpExpiry: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  cart: [
    {
      book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
      quantity: { type: Number, default: 1 },
    },
  ],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  orders: [
    {
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
      },
      quantity: { type: Number, default: 1 },
      delivered: { type: Boolean, default: false },
      orderDate: { type: Date, default: Date.now },
    },
  ],
  addresses: [AddressSchema]
});

const Buyer = mongoose.model("Buyer", buyerSchema);
export default Buyer;
