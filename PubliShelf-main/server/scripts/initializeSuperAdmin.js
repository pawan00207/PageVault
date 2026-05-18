// server/scripts/initializeSuperAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/";

const initializeSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ isSuperAdmin: true });
    if (existingSuperAdmin) {
      console.log("ℹ️  Super admin already exists:");
      console.log(`   Name: ${existingSuperAdmin.name}`);
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log("\n⚠️  To create a new super admin, delete the existing one first.");
      process.exit(0);
    }

    // Create super admin
    const superAdmin = new Admin({
      name: "Vitesh Reddy",
      email: "superadmin@publishelf.com",
      adminKey: "123456", // Will be hashed by pre-save hook
      isSuperAdmin: true,
      createdBy: null,
      isActive: true,
    });

    await superAdmin.save();

    console.log("\n✅ Super Admin created successfully!");
    console.log("================================");
    console.log("📧 Email: superadmin@publishelf.com");
    console.log("🔑 Admin Key: 123456");
    console.log("================================");
    console.log("\n⚠️  IMPORTANT: Change the admin key after first login!");
    console.log("📍 Login at: http://localhost:5173/admin/login\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing super admin:", error);
    process.exit(1);
  }
};

initializeSuperAdmin();
