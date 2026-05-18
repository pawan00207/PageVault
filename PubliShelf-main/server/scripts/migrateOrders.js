// /scripts/migrateOrders.js
import mongoose from "mongoose";
import Buyer from "../models/Buyer.model.js";
import Book from "../models/Book.model.js";
import Order from "../models/Order.model.js";

export const migrateBuyerOrders = async () => {
  try {
    console.log("🚀 Starting Buyer → Order migration...");
    const buyers = await Buyer.find().populate("orders.book");
    if (!buyers.length) {
      console.log("⚠️ No buyers found.");
      return;
    }

    const addressPool = [
      { address: "12 Beach Road, Visakhapatnam, Andhra Pradesh", phone: "9848012345" },
      { address: "89 MG Street, Vijayawada, Andhra Pradesh", phone: "9876543210" },
      { address: "45 Hill Colony, Hyderabad, Telangana", phone: "9012345678" },
      { address: "23 Lake View, Warangal, Telangana", phone: "9500011223" },
      { address: "102 Green Park, Tirupati, Andhra Pradesh", phone: "9988776655" },
      { address: "78 Sunrise Enclave, Karimnagar, Telangana", phone: "9123456789" },
    ];

    const paymentMethods = ["COD", "CARD", "UPI"];
    let migratedCount = 0;

    for (const buyer of buyers) {
      if (!buyer.orders || buyer.orders.length === 0) continue;

      for (const oldOrder of buyer.orders) {
        const bookDoc = await Book.findById(oldOrder.book).populate("publisher");
        if (!bookDoc) {
          console.log(`⚠️ Skipping order (missing book) for buyer ${buyer._id}`);
          continue;
        }

        // Snapshot book details
        const unitPrice = bookDoc.price || Math.floor(Math.random() * 500) + 100;
        const quantity = oldOrder.quantity || 1;
        const subtotal = unitPrice * quantity;

        // Follow your frontend logic for shipping, tax, and total
        const shipping = subtotal > 35 ? 0 : 100;
        const tax = subtotal * 0.02;
        const total = subtotal + shipping + tax;

        // Random address selection
        const randAddr = addressPool[Math.floor(Math.random() * addressPool.length)];

        const deliveryAddress = {
          name: `${buyer.firstname} ${buyer.lastname}`,
          address: randAddr.address,
          phone: randAddr.phone,
        };

        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        const itemSnapshot = {
          book: bookDoc._id,
          title: bookDoc.title || "Unknown Title",
          image: bookDoc.image || "",
          publisher: bookDoc.publisher?._id || new mongoose.Types.ObjectId(),
          unitPrice,
          quantity,
          lineTotal: subtotal,
        };

        const newOrder = new Order({
          buyer: buyer._id,
          items: [itemSnapshot],
          deliveryAddress,
          paymentMethod,
          paymentStatus: "paid", // fixed as per your request
          transactionId: `TXN${Math.floor(Math.random() * 1e12)}`,
          status: oldOrder.delivered ? "delivered" : "processing",
          currency: "INR",
          itemsTotal: subtotal,
          shipping,
          tax,
          discount: 0,
          grandTotal: total,
          createdAt: oldOrder.orderDate || new Date(),
          updatedAt: oldOrder.orderDate || new Date(),
        });

        await newOrder.save();
        migratedCount++;
      }

      // Optional cleanup after migration
      buyer.orders = [];
      await buyer.save();
    }

    console.log(`✅ Migration complete. ${migratedCount} orders migrated successfully.`);
  } catch (error) {
    console.error("❌ Error during migration:", error);
  }
};
