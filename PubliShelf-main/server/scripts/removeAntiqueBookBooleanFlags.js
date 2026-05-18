// Script: removeAntiqueBookBooleanFlags.js
// Purpose: Permanently remove deprecated boolean moderation flags from AntiqueBook documents.
// Usage: node server/scripts/removeAntiqueBookBooleanFlags.js
import dotenv from 'dotenv';
import db from '../config/db.js';
import AntiqueBook from '../models/AntiqueBook.model.js';

dotenv.config();

(async () => {
  try {
    await db();
    const res = await AntiqueBook.updateMany(
      { $or: [ { isApproved: { $exists: true } }, { isPending: { $exists: true } }, { isRejected: { $exists: true } } ] },
      { $unset: { isApproved: "", isPending: "", isRejected: "" } }
    );
    console.log(`Removed boolean flags from ${res.modifiedCount} documents.`);
  } catch (err) {
    console.error('Flag removal failed:', err);
    process.exit(1);
  }
  process.exit(0);
})();
