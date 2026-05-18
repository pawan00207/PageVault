// Script: Set status and boolean flags on AntiqueBook documents missing them
// Usage: node server/scripts/migrateAntiqueBooksStatus.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AntiqueBook from '../models/AntiqueBook.model.js';
import db from '../config/db.js';

dotenv.config();

async function run() {
  try {
    await db();
    // Ensure status is set for legacy documents
    const res1 = await AntiqueBook.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'approved' } }
    );
    console.log(`Set status on ${res1.modifiedCount} antique books to approved.`);

    // Remove deprecated boolean flags
    const res2 = await AntiqueBook.updateMany(
      { $or: [ { isApproved: { $exists: true } }, { isPending: { $exists: true } }, { isRejected: { $exists: true } } ] },
      { $unset: { isApproved: "", isPending: "", isRejected: "" } }
    );
    console.log(`Unset boolean flags on ${res2.modifiedCount} antique books.`);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
  process.exit(0);
}

run();
