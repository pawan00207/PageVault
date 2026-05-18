// scripts/attributeLegacyPublishers.js
// Simple script to attribute legacy verified/banned publishers to existing managers
// WITHOUT changing their isVerified/banned status - just adds the manager attribution

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import Publisher from '../models/Publisher.model.js';
import Manager from '../models/Manager.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB\n');

    // Get all managers
    const managers = await Manager.find().sort({ createdAt: 1 }).lean();
    if (managers.length === 0) {
      console.log('❌ No managers found. Create at least one manager account first.');
      await mongoose.disconnect();
      return;
    }

    console.log(`✅ Found ${managers.length} manager(s)\n`);

    // Find publishers that need attribution
    const publishers = await Publisher.find().sort({ createdAt: 1 }).lean();
    console.log(`📚 Total publishers: ${publishers.length}\n`);

    let verifiedAttributed = 0;
    let bannedAttributed = 0;
    let skipped = 0;
    let managerIndex = 0;

    for (const pub of publishers) {
      const needsVerifiedAttribution = pub.isVerified === true && !pub.verifiedBy;
      const needsBannedAttribution = pub.banned === true && (!pub.account?.by);
      
      if (!needsVerifiedAttribution && !needsBannedAttribution) {
        skipped++;
        continue;
      }

      // Round-robin manager selection
      const assignedManager = managers[managerIndex % managers.length]._id;
      managerIndex++;

      const updates = {};

      // Add verifiedBy if needed
      if (needsVerifiedAttribution) {
        updates.verifiedBy = assignedManager;
        if (!pub.verifiedAt) {
          // Add a past verification date (90-365 days ago)
          updates.verifiedAt = daysAgo(randomInt(90, 365));
        }
        verifiedAttributed++;
      }

      // Add account.by if banned and needs attribution
      if (needsBannedAttribution) {
        const banDate = pub.bannedAt || daysAgo(randomInt(15, 90));
        updates.account = {
          status: 'banned',
          by: assignedManager,
          at: banDate,
          reason: pub.banReason || 'Policy violation'
        };
        bannedAttributed++;
      }

      await Publisher.findByIdAndUpdate(pub._id, updates);
    }

    console.log('✨ Attribution complete!\n');
    console.log('📊 Summary:');
    console.log(`   ✓ Verified attributed: ${verifiedAttributed}`);
    console.log(`   ✓ Banned attributed:   ${bannedAttributed}`);
    console.log(`   ⊘ Skipped (already attributed): ${skipped}`);
    console.log(`   📈 Total processed: ${publishers.length}\n`);

    // Show distribution per manager
    const distribution = {};
    for (const mgr of managers) {
      const count = await Publisher.countDocuments({ verifiedBy: mgr._id });
      distribution[mgr.email || mgr._id] = count;
    }
    
    console.log('👥 Distribution by manager:');
    for (const [email, count] of Object.entries(distribution)) {
      console.log(`   ${email}: ${count} publishers`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

run();
