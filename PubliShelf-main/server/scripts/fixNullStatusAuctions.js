//scripts/fixNullStatusAuctions.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AntiqueBook from '../models/AntiqueBook.model.js';

dotenv.config();

async function fixNullStatusAuctions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all auctions with null/undefined status
    const nullStatusCount = await AntiqueBook.countDocuments({
      $or: [{ status: null }, { status: { $exists: false } }]
    });

    console.log(`Found ${nullStatusCount} auctions with null/undefined status`);

    if (nullStatusCount === 0) {
      console.log('No auctions to fix!');
      await mongoose.disconnect();
      return;
    }

    // Set all null/undefined status to 'approved' (legacy auctions were already live)
    const result = await AntiqueBook.updateMany(
      {
        $or: [{ status: null }, { status: { $exists: false } }]
      },
      {
        $set: { status: 'approved' }
      }
    );

    console.log(`Updated ${result.modifiedCount} auctions to status: 'approved'`);

    // Verify the fix
    const approvedCount = await AntiqueBook.countDocuments({ status: 'approved' });
    const pendingCount = await AntiqueBook.countDocuments({ status: 'pending' });
    const rejectedCount = await AntiqueBook.countDocuments({ status: 'rejected' });
    const stillNull = await AntiqueBook.countDocuments({
      $or: [{ status: null }, { status: { $exists: false } }]
    });

    console.log('\n=== Final Status Distribution ===');
    console.log(`Approved: ${approvedCount}`);
    console.log(`Pending: ${pendingCount}`);
    console.log(`Rejected: ${rejectedCount}`);
    console.log(`Still null: ${stillNull}`);

    // Check time-based distribution
    const now = new Date();
    const ongoing = await AntiqueBook.countDocuments({
      status: 'approved',
      auctionStart: { $lte: now },
      auctionEnd: { $gte: now }
    });
    const future = await AntiqueBook.countDocuments({
      status: 'approved',
      auctionStart: { $gt: now }
    });
    const ended = await AntiqueBook.countDocuments({
      status: 'approved',
      auctionEnd: { $lt: now }
    });

    console.log('\n=== Time-based Distribution (Approved only) ===');
    console.log(`Ongoing: ${ongoing}`);
    console.log(`Future: ${future}`);
    console.log(`Ended: ${ended}`);

    await mongoose.disconnect();
    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

fixNullStatusAuctions();
