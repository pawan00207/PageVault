import Buyer from "../models/Buyer.model.js";

export const deduplicateWishlist = async () => {
  try {
    console.log("Starting wishlist deduplication...");

    const buyers = await Buyer.find({});
    if (!buyers.length) {
      console.log("No buyers found in the database.");
      return;
    }

    for (const buyer of buyers) {
      if (buyer.wishlist && buyer.wishlist.length > 0) {
        const originalCount = buyer.wishlist.length;

        const uniqueWishlist = [
          ...new Set(buyer.wishlist.map((id) => id.toString())),
        ];

        if (uniqueWishlist.length !== originalCount) {
          buyer.wishlist = uniqueWishlist;
          await buyer.save();
          console.log(
            `✅ Buyer (${buyer.email}) wishlist deduplicated: ${originalCount} → ${uniqueWishlist.length}`
          );
        } else {
          console.log(`ℹ️ Buyer (${buyer.email}) wishlist already unique.`);
        }
      }
    }

    console.log("Wishlist deduplication completed successfully.");
  } catch (error) {
    console.error("❌ Error while deduplicating wishlist:", error);
  }
};
