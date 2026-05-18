// scripts/verifyLegacyPublishers.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import Publisher from '../models/Publisher.model.js';
import Manager from '../models/Manager.model.js';

// Ensure we load the server/.env even if run from another cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  const managers = await Manager.find().lean();
  const managerIds = managers.map(m => m._id);

    if (managerIds.length === 0) {
      console.log('No managers found. Please create at least one manager before running migration.');
      return;
    }

  const publishers = await Publisher.find().lean();
  let updated = 0;
  const distribution = new Map();

    for (const p of publishers) {
      const randomManager = managerIds[Math.floor(Math.random() * managerIds.length)];
      await Publisher.findByIdAndUpdate(p._id, {
        isVerified: true,
        verifiedBy: randomManager,
        rejectionReason: null
      });
      updated++;
      const key = String(randomManager);
      distribution.set(key, (distribution.get(key) || 0) + 1);
    }

    console.log(`Legacy migration complete: marked ${updated} publishers as verified.`);
    console.log('\nDistribution by managerId:');
    for (const mId of managerIds) {
      console.log(`  ${mId}: ${distribution.get(String(mId)) || 0}`);
    }
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
