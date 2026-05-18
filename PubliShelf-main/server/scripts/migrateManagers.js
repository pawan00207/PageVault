import mongoose from "mongoose";
import Manager from "../models/Manager.model.js"; // adjust path if needed

/**
 * Migration: Add moderation/account fields to legacy manager data
 */
export async function migrateManagers() {
  try {
    const adminId = new mongoose.Types.ObjectId("69176fe8b9d108e78dc52586");

    const managers = await Manager.find();

    if (!managers.length) {
      console.log("No managers found — migration skipped.");
      return;
    }

    for (const m of managers) {

      // moderation logic
      let moderation = {
        status: "approved",
        by: adminId,
        at: new Date("2025-11-17T00:00:00.000Z")
      };

      // Vishnu → pending
      if (m.email === "man2@gmail.com") {
        moderation = {
          status: "pending",
          by: null,
          at: null
        };
      }

      // account always active
      const account = {
        status: "active",
        by: adminId,
        at: new Date("2025-11-17T00:00:00.000Z")
      };

      await Manager.updateOne(
        { _id: m._id },
        {
          $set: {
            moderation,
            account,
            lastLogin: null
          }
        }
      );
    }

    console.log("✔ Manager migration completed successfully!");

  } catch (err) {
    console.error("❌ Migration failed:", err);
  }
}
