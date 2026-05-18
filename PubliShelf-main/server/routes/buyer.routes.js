import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getBuyerDashboard, getBuyerSearchPage, searchBooksHandler, filterBooksHandler, createBuyerSignup, getProductDetail, getBuyerCart, addToCart, removeFromCart, addToWishlist, removeFromWishlist, updateCartQuantity, placeOrderController, createCheckoutSession, getBuyerAuctionPage, getAuctionItemDetail, getAuctionOngoing, placeBid, getBuyerProfile, updateBuyerProfile, updateBuyerProfileById, getBuyerAddresses, addBuyerAddress, updateBuyerAddress, deleteBuyerAddress } from "../controllers/buyer.controller.js";

const router = express.Router();

router.get("/dashboard", protect, getBuyerDashboard);
router.get("/search-page", protect, getBuyerSearchPage);
router.get("/search", protect, searchBooksHandler);
router.get("/filter", protect, filterBooksHandler);
router.post("/signup", createBuyerSignup);
router.get("/product-detail/:id", protect, getProductDetail);
router.get("/cart", protect, getBuyerCart);
router.post("/cart/add", protect, addToCart);
router.delete("/cart/remove", protect, removeFromCart);
router.post("/wishlist/add", protect, addToWishlist);
router.delete("/wishlist/:bookId", protect, removeFromWishlist);
router.patch("/cart/update-quantity", protect, updateCartQuantity);
router.post("/checkout/place-order", protect, placeOrderController);
router.post("/checkout/create-session", protect, createCheckoutSession);
router.get("/auction-page", protect, getBuyerAuctionPage);
router.get("/auction-item-detail/:id", protect, getAuctionItemDetail);
router.get("/auction-ongoing/:id", protect, getAuctionOngoing);
router.post("/auctions/:id/bid", protect, placeBid);
router.get("/profile", protect, getBuyerProfile);
router.put("/profile", protect, updateBuyerProfile);
router.post("/update-profile/:id", protect, updateBuyerProfileById);

router.get("/addresses", protect, getBuyerAddresses);
router.post("/addresses", protect, addBuyerAddress);
router.put("/addresses/:id", protect, updateBuyerAddress);
router.delete("/addresses/:id", protect, deleteBuyerAddress);

export default router;