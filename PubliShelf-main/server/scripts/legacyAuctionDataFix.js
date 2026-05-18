// legacyDataFix.js
import AntiqueBook from "../models/AntiqueBook.model.js";

export async function fixLegacyAntiqueBooks() {
  try {
    console.log("🛠️ Starting legacy antique book update...");

    const managerIds = [
      "69135df98cdcfaec6e937e3d",
      "69136e4d9fd6b65dbe47f208",
    ];

    // Hardcoded legacy book IDs
    const bookIds = [
      "681c80dd12bfe08de12d61ac",
      "681c80dd12bfe08de12d61c8",
      "681c80dd12bfe08de12d61e3",
      "681c80dd12bfe08de12d61ea",
      "681c80dd12bfe08de12d61f0",
      "681c80dd12bfe08de12d61f1",
      "681c80dd12bfe08de12d61ff",
      "681c80dd12bfe08de12d6207",
      "681c80dd12bfe08de12d61f6",
      "681c80dd12bfe08de12d61c0",
      "681c80dd12bfe08de12d61d4",
      "681c80dd12bfe08de12d61c9",
      "681c80dd12bfe08de12d61e4",
      "681c80dd12bfe08de12d61b7",
      "681c80dd12bfe08de12d61d5",
      "681c80dd12bfe08de12d61fe",
      "681c80dd12bfe08de12d61b1",
      "681c80dd12bfe08de12d61b8",
      "681c80dd12bfe08de12d61d0",
      "681c80dd12bfe08de12d61db",
      "681ca4fa4defdcd37b0b2f72",
      "681d92b94504901df07e1dca",
      "682f6e7412de8fa3b85e316e",
      "682f6f5912de8fa3b85e319a",
      "682f705e12de8fa3b85e31c3",
      "6883b5b95f76067b6115a95a",
      "68c268483a52380aedcc6b30",
      "68ea9e3ffe3b0214d220b11c",
      "68eb664155e9b5687f8963e5",
      "68eb6d7355e9b5687f89654c",
      "68eb721355e9b5687f8965e1",
      "68eb745855e9b5687f896675",
      "68eb762d55e9b5687f896709",
      "68eb7d24a2381d82fecfe7b1",
      "68eb9af6eca7b68605140edb",
      "68eb9f1c92c3078498fd0780",
      "68ebec2f17cc791cca69327b",
      "68ebed0b17cc791cca6933b5",
      "68f731774ee7c915fda5f2c4",
      "69137dccc19ff2737c65d0de",
      "6914713f9334b990e46f9583",
      "6914757eced60d07fd62e6a1",
      "691479d8407e1fae9a8a35b6",
    ];

    // Hardcoded deterministic mapping of book ID → status
    const statusMap = {
      "681c80dd12bfe08de12d61ac": "approved",
      "681c80dd12bfe08de12d61c8": "pending",
      "681c80dd12bfe08de12d61e3": "rejected",
      "681c80dd12bfe08de12d61ea": "approved",
      "681c80dd12bfe08de12d61f0": "pending",
      "681c80dd12bfe08de12d61f1": "approved",
      "681c80dd12bfe08de12d61ff": "rejected",
      "681c80dd12bfe08de12d6207": "approved",
      "681c80dd12bfe08de12d61f6": "approved",
      "681c80dd12bfe08de12d61c0": "pending",
      "681c80dd12bfe08de12d61d4": "approved",
      "681c80dd12bfe08de12d61c9": "rejected",
      "681c80dd12bfe08de12d61e4": "approved",
      "681c80dd12bfe08de12d61b7": "approved",
      "681c80dd12bfe08de12d61d5": "pending",
      "681c80dd12bfe08de12d61fe": "approved",
      "681c80dd12bfe08de12d61b1": "rejected",
      "681c80dd12bfe08de12d61b8": "approved",
      "681c80dd12bfe08de12d61d0": "pending",
      "681c80dd12bfe08de12d61db": "approved",
      "681ca4fa4defdcd37b0b2f72": "rejected",
      "681d92b94504901df07e1dca": "approved",
      "682f6e7412de8fa3b85e316e": "pending",
      "682f6f5912de8fa3b85e319a": "approved",
      "682f705e12de8fa3b85e31c3": "approved",
      "6883b5b95f76067b6115a95a": "rejected",
      "68c268483a52380aedcc6b30": "approved",
      "68ea9e3ffe3b0214d220b11c": "approved",
      "68eb664155e9b5687f8963e5": "pending",
      "68eb6d7355e9b5687f89654c": "approved",
      "68eb721355e9b5687f8965e1": "approved",
      "68eb745855e9b5687f896675": "rejected",
      "68eb762d55e9b5687f896709": "approved",
      "68eb7d24a2381d82fecfe7b1": "pending",
      "68eb9af6eca7b68605140edb": "approved",
      "68eb9f1c92c3078498fd0780": "approved",
      "68ebec2f17cc791cca69327b": "rejected",
      "68ebed0b17cc791cca6933b5": "approved",
      "68f731774ee7c915fda5f2c4": "approved",
      "69137dccc19ff2737c65d0de": "pending",
      "6914713f9334b990e46f9583": "rejected",
      "6914757eced60d07fd62e6a1": "approved",
      "691479d8407e1fae9a8a35b6": "approved",
    };

    const rejectionReasons = [
      "Insufficient documentation",
      "Image verification failed",
      "Unclear authenticity proof",
      "Incomplete metadata",
      "Failed initial quality check",
    ];

    const books = await AntiqueBook.find({ _id: { $in: bookIds } });

    let updates = [];

    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      const managerId = managerIds[i % 2];
      let status = statusMap[book._id.toString()] || "approved";

      // If bidding history exists, force status to approved
      if (book.biddingHistory && book.biddingHistory.length > 0) {
        status = "approved";
      }

      const rejectionReason =
        status === "rejected"
          ? rejectionReasons[i % rejectionReasons.length]
          : null;

      updates.push({
        updateOne: {
          filter: { _id: book._id },
          update: {
            $set: {
              reviewedBy: managerId,
              status,
              rejectionReason,
            },
          },
        },
      });
    }

    if (updates.length > 0) {
      await AntiqueBook.bulkWrite(updates);
      console.log(`✅ Updated ${updates.length} antique books successfully.`);
    } else {
      console.log("⚠️ No antique books found for update.");
    }
  } catch (err) {
    console.error("❌ Error updating legacy antique books:", err);
  }
}
