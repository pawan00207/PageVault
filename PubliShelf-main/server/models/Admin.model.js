import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    adminKey: { type: String, required: true }, // Hashed admin key
    isSuperAdmin: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }, // null for super admin
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Validate admin key uniqueness before hashing
adminSchema.pre("save", async function (next) {
  if (!this.isModified("adminKey")) return next();
  
  try {
    // Store the plain text key temporarily to check uniqueness
    const plainKey = this.adminKey;
    
    // Check if any other admin has this key (by comparing hashed values)
    const allAdmins = await this.constructor.find({ _id: { $ne: this._id } });
    for (const admin of allAdmins) {
      const matches = await bcrypt.compare(plainKey, admin.adminKey);
      if (matches) {
        const error = new Error("Admin key already exists. Please choose a unique key.");
        error.code = "DUPLICATE_ADMIN_KEY";
        return next(error);
      }
    }
    
    // Hash the admin key
    const salt = await bcrypt.genSalt(10);
    this.adminKey = await bcrypt.hash(plainKey, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare admin key
adminSchema.methods.compareAdminKey = async function (candidateKey) {
  return await bcrypt.compare(candidateKey, this.adminKey);
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
