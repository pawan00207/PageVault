//controllers/buyer.controller.js
import bcrypt from "bcrypt";
import { getBuyerById, createBuyer, updateBuyerDetails, getTopSoldBooks, getTrendingBooks, placeOrder, prepareCheckoutData } from "../services/buyer.services.js";
import { getAllBooks, getBookById, searchBooks, filterBooks} from "../services/book.services.js";
import { getOngoingAuctions, getFutureAuctions, getEndedAuctions, getAuctionItemById, addBid } from "../services/antiqueBook.services.js";
import { createStripeCheckoutSession } from "../services/stripe.services.js";
import { buildCacheKey, getOrSetCache } from "../services/cache.services.js";
import Buyer from "../models/Buyer.model.js";
import Book from "../models/Book.model.js";
import Order from "../models/Order.model.js";

export const getBuyerDashboard = async (req, res) => {
  try {
    const controllerStartTimeMs = Date.now();
    // Only select needed fields for books
    const newlyBooks = await Book.find({isDeleted: { $ne: true }})
      .sort({ publishedAt: -1 })
      .limit(8)
      .select('_id title author image price totalSold');

    const mostSoldBooksRaw = await getTopSoldBooks({ controllerStartTimeMs });
    const mostSoldBooks = mostSoldBooksRaw.map(book => ({
      _id: book._id,
      title: book.title,
      author: book.author,
      image: book.image,
      price: book.price,
      totalSold: book.totalSold
    }));

    const trendingBooksRaw = await getTrendingBooks({ controllerStartTimeMs });
    const trendingBooks = trendingBooksRaw.map(book => ({
      _id: book._id,
      title: book.title,
      author: book.author,
      image: book.image,
      price: book.price
    }));

    // Fetch ongoing and upcoming auctions for dashboard
    const ongoingAuctionsRaw = await getOngoingAuctions();
    const futureAuctionsRaw = await getFutureAuctions();

    // Only select needed fields for auctions
    const auctionFields = auction => ({
      _id: auction._id,
      title: auction.title,
      author: auction.author,
      image: auction.image,
      auctionStart: auction.auctionStart,
      auctionEnd: auction.auctionEnd,
      currentPrice: auction.currentPrice,
      basePrice: auction.basePrice
    });

    const ongoingAuctions = ongoingAuctionsRaw.slice(0, 6).map(auctionFields);
    const futureAuctions = futureAuctionsRaw.slice(0, 6).map(auctionFields);

    // Combine and limit auctions for hero carousel and countdown cards
    const featuredAuctions = [
      ...ongoingAuctionsRaw.slice(0, 3).map(auctionFields),
      ...futureAuctionsRaw.slice(0, 3).map(auctionFields)
    ];

    // Get recent bids from all ongoing auctions for activity feed
    const recentBidsData = [];
    for (const auction of ongoingAuctionsRaw.slice(0, 10)) {
      const auctionWithBids = await getAuctionItemById(auction._id);
      if (auctionWithBids.biddingHistory && auctionWithBids.biddingHistory.length > 0) {
        // Get last 3 bids from each auction
        const lastBids = auctionWithBids.biddingHistory
          .slice(-3)
          .reverse()
          .map(bid => ({
            _id: bid._id,
            bidder: bid.bidder,
            bookTitle: auctionWithBids.title,
            bidAmount: bid.bidAmount,
            bidTime: bid.bidTime,
            auctionId: auctionWithBids._id
          }));
        recentBidsData.push(...lastBids);
      }
    }
    // Sort all bids by time and take top 10
    const recentBids = recentBidsData
      .sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime))
      .slice(0, 10);

    res.status(200).json({
      success: true,
      message: "Buyer dashboard data fetched successfully",
      data: { 
        newlyBooks, 
        mostSoldBooks, 
        trendingBooks,
        featuredAuctions,
        ongoingAuctions,
        upcomingAuctions: futureAuctions,
        recentBids
      }
    });
  } catch (error) {
    console.error("Error loading buyer dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Error loading dashboard",
      data: null
    });
  }
};

export const getBuyerSearchPage = async (req, res) => {
  try {
    const controllerStartTimeMs = Date.now();
    const cacheKey = buildCacheKey("buyer:search-page", { endpoint: "search-page" });
    const books = await getOrSetCache({
      key: cacheKey,
      ttlSeconds: 180,
      label: "Book Search",
      controllerStartTimeMs,
      getter: async () => await getAllBooks({ isDeleted: false })
    });

    res.status(200).json({
      success: true,
      message: "Search page data fetched successfully",
      data: { books }
    });
  } catch (error) {
    console.error("Error loading buyer search page:", error);
    res.status(500).json({
      success: false,
      message: "Error loading search page",
      data: null
    });
  }
};

export const searchBooksHandler = async (req, res) => {
  const { q: searchQuery } = req.query;
  try {
    const controllerStartTimeMs = Date.now();
    const cacheKey = buildCacheKey("buyer:search", { q: searchQuery || "" });
    const books = await getOrSetCache({
      key: cacheKey,
      ttlSeconds: 120,
      label: "Buyer Book Search",
      controllerStartTimeMs,
      getter: async () => await searchBooks(searchQuery)
    });

    res.status(200).json({
      success: true,
      message: "Search results fetched successfully",
      data: { books }
    });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({
      success: false,
      message: "Error during search",
      data: null
    });
  }
};

export const filterBooksHandler = async (req, res) => {
  const { category, sort, condition, priceRange } = req.query;
  try {
    const controllerStartTimeMs = Date.now();
    const filters = { category, sort, condition, priceRange };
    const cacheKey = buildCacheKey("buyer:filter", filters);
    const books = await getOrSetCache({
      key: cacheKey,
      ttlSeconds: 120,
      label: "Buyer Book Filter",
      controllerStartTimeMs,
      getter: async () => await filterBooks(filters)
    });

    res.status(200).json({
      success: true,
      message: "Filtered books fetched successfully",
      data: { books }
    });
  } catch (error) {
    console.error("Error during filter search:", error);
    res.status(500).json({
      success: false,
      message: "Error during filter search",
      data: null
    });
  }
};

export const createBuyerSignup = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await createBuyer({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });
    res.status(201).json({
      success: true,
      message: "Buyer account created successfully",
      data: null
    });
  } catch (error) {
    console.error("Error during buyer signup:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        data: null
      });
    }
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while creating the buyer account",
      data: null
    });
  }
};

export const getProductDetail = async (req, res) => {
  try {
    const { id: bookId } = req.params;
    const book = await getBookById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
        data: null
      });
    }

    const buyer = await getBuyerById(req.user.id);
    const isInCart = buyer.cart.some(
      (item) => item.book._id.toString() === bookId
    );

    const similarBooks = await Book.find({
      genre: book.genre,
      _id: { $ne: bookId },
      isDeleted: { $ne: true }
    }).limit(4);

    res.status(200).json({
      success: true,
      message: "Product details fetched successfully",
      data: { book, similarBooks, isInCart }
    });
  } catch (error) {
    console.error("Error loading product details:", error);
    res.status(500).json({
      success: false,
      message: "Error loading product details",
      data: null
    });
  }
};

export const getBuyerCart = async (req, res) => {
  try {
    const buyer = await getBuyerById(req.user.id);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
        data: null
      });
    }

    const cart = buyer.cart;
    const wishlist = buyer.wishlist;

    const calculateOrderSummary = (cart) => {
      const subtotal = cart.reduce(
        (sum, item) => sum + item.book.price * item.quantity,
        0
      );
      const shipping = subtotal >= 35 ? 0 : 5.99;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;
      return { subtotal, shipping, tax, total };
    };

    const orderSummary = calculateOrderSummary(cart);

    res.status(200).json({
      success: true,
      message: "Cart data fetched successfully",
      data: { cart, wishlist, ...orderSummary }
    });
  } catch (error) {
    console.error("Error loading cart:", error);
    res.status(500).json({
      success: false,
      message: "Error loading cart",
      data: null
    });
  }
};

export const addToCart = async (req, res) => {
  const { bookId, quantity } = req.body;
  try {
    const buyer = await getBuyerById(req.user.id);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
        data: null
      });
    }

    const existingCartItem = buyer.cart.find(
      (item) => item.book.toString() === bookId
    );

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      buyer.cart.push({ book: bookId, quantity });
    }

    await buyer.save();

    res.status(200).json({
      success: true,
      message: "Book added to cart successfully",
      data: null
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding to the cart",
      data: null
    });
  }
};

export const removeFromCart = async (req, res) => {
  const { bookId } = req.body;
  try {
    const buyer = await getBuyerById(req.user.id);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
        data: null
      });
    }

    const cartItemIndex = buyer.cart.findIndex(
      (item) => item.book._id.toString() === bookId
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
        data: null
      });
    }

    buyer.cart.splice(cartItemIndex, 1);
    await buyer.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: null
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while removing the item from the cart",
      data: null
    });
  }
};

export const addToWishlist = async (req, res) => {
  const { bookId } = req.body;
  try {
    const buyer = await getBuyerById(req.user.id);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
        data: null
      });
    }

    if (buyer.wishlist.includes(bookId)) {
      return res.status(400).json({
        success: false,
        message: "Book is already in the wishlist",
        data: null
      });
    }

    buyer.wishlist.push(bookId);
    await buyer.save();

    res.status(200).json({
      success: true,
      message: "Book added to wishlist successfully",
      data: null
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding to the wishlist",
      data: null
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  const bookId = req.params.bookId;
  try {
    const buyer = await Buyer.findById(req.user.id);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
        data: null
      });
    }

    const beforeCount = buyer.wishlist.length;
    buyer.wishlist = buyer.wishlist.filter((id) => id.toString() !== bookId.toString());

    if (buyer.wishlist.length === beforeCount) {
      return res.status(404).json({
        success: false,
        message: "Book not found in wishlist",
        data: null
      });
    }

    await buyer.save();

    res.status(200).json({
      success: true,
      message: "Book removed from wishlist successfully",
      data: null
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while removing from the wishlist",
      data: null
    });
  }
};

export const updateCartQuantity = async (req, res) => {
  const { bookId, quantity } = req.body;
  try {
    const buyer = await getBuyerById(req.user.id);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
        data: null
      });
    }

    const cartItem = buyer.cart.find(
      (item) => item.book._id.toString() === bookId
    );
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
        data: null
      });
    }

    cartItem.quantity = quantity;
    await buyer.save();

    res.status(200).json({
      success: true,
      message: "Quantity updated successfully",
      data: null
    });
  } catch (error) {
    console.error("Error updating quantity:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the quantity",
      data: null
    });
  }
};

export const placeOrderController = async (req, res) => {
  try {
    const { addressId, paymentMethod } = req.body;

    if (paymentMethod === "ONLINE") {
      return res.status(400).json({
        success: false,
        message: "For online payment, use the /payments/stripe/create-checkout-session endpoint",
        data: null
      });
    }

    const order = await placeOrder(req.user.id, { addressId, paymentMethod });
    res.status(200).json({
      success: true,
      message: "Order placed successfully",
      data: { orderId: order._id }
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(400).json({
      success: false,
      message: error.message || "An error occurred while placing the order",
      data: null
    });
  }
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { addressId, idempotencyKey } = req.body;

    if (!addressId) {
      return res.status(400).json({ success: false, message: "addressId is required" });
    }

    const checkoutData = await prepareCheckoutData(req.user.id, addressId);

    const baseClientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const successUrl = `${baseClientUrl}/buyer/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseClientUrl}/buyer/checkout?paymentCancelled=true`;

    const { sessionUrl, sessionId, orderId } = await createStripeCheckoutSession({
      ...checkoutData,
      successUrl,
      cancelUrl,
      idempotencyKey,
    });

    const buyer = await getBuyerById(req.user.id);
    buyer.cart = [];
    await buyer.save();

    return res.status(200).json({ success: true, url: sessionUrl, sessionId, orderId });
  } catch (error) {
    console.error("Error creating Stripe Checkout session:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create Stripe Checkout session" });
  }
};

export const getBuyerAuctionPage = async (req, res) => {
  try {
    const ongoingAuctions = await getOngoingAuctions();
    const futureAuctions = await getFutureAuctions();
    const endedAuctions = await getEndedAuctions();

    res.status(200).json({
      success: true,
      message: "Auction page data fetched successfully",
      data: { ongoingAuctions, futureAuctions, endedAuctions }
    });
  } catch (error) {
    console.error("Error fetching auction data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching auction data",
      data: null
    });
  }
};

export const getAuctionItemDetail = async (req, res) => {
  try {
    const { id: auctionId } = req.params;
    const book = await getAuctionItemById(auctionId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Auction item not found",
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: "Auction item details fetched successfully",
      data: { book }
    });
  } catch (error) {
    console.error("Error loading auction item details:", error);
    res.status(500).json({
      success: false,
      message: "Error loading auction item details",
      data: null
    });
  }
};

export const getAuctionOngoing = async (req, res) => {
  try {
    const { id: auctionId } = req.params;
    const book = await getAuctionItemById(auctionId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Auction item not found",
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: "Ongoing auction data fetched successfully",
      data: { book }
    });
  } catch (error) {
    console.error("Error fetching auction item details:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching auction item details",
      data: null
    });
  }
};

export const placeBid = async (req, res) => {
  try {
    const { id: auctionId } = req.params;
    const { bidAmount } = req.body;
    const bidderId = req.user.id;
    const updatedBook = await addBid(auctionId, bidderId, bidAmount);

    // Return only the new bid (last entry) to reduce data transfer
    const newBid = updatedBook.biddingHistory[updatedBook.biddingHistory.length - 1];
    
    res.status(200).json({
      success: true,
      message: "Bid placed successfully",
      data: {
        currentPrice: updatedBook.currentPrice,
        newBid: {
          _id: newBid._id,
          bidder: newBid.bidder,
          bidAmount: newBid.bidAmount,
          bidTime: newBid.bidTime
        }
      }
    });
  } catch (error) {
    console.error("Error placing bid:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while placing the bid",
      data: null
    });
  }
};

export const getBuyerProfile = async (req, res) => {
  try {
    const user = await Buyer.findById(req.user.id)
      .populate("wishlist")
      .lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null
      });
    }
    // Fetch orders from Order collection and attach as user.orders for backward compatibility
    const ordersDocs = await Order.find({ buyer: req.user.id })
      .sort({ createdAt: -1 })
      .populate({ path: "items.book", select: "title author price image genre description" })
      .lean();
    const flatOrders = ordersDocs.flatMap((o) =>
      (o.items || []).map((it) => ({
        _id: it._id,
        book: it.book || { title: it.title, image: it.image },
        quantity: it.quantity,
        delivered: o.status === "delivered",
        orderDate: o.createdAt,
      }))
    );
    user.orders = flatOrders;

    // Calculate analytics metrics efficiently
    const analytics = {
      totalOrders: ordersDocs.length,
      totalItemsPurchased: flatOrders.reduce((sum, order) => sum + (order.quantity || 0), 0),
      totalSpent: ordersDocs.reduce((sum, order) => sum + (order.grandTotal || 0), 0),
      wishlistCount: user.wishlist?.length || 0,
      deliveredOrders: ordersDocs.filter(o => o.status === "delivered").length,
      pendingOrders: ordersDocs.filter(o => o.status === "pending").length,
    };

    // Calculate favorite genres from purchased books with spending
    const genreData = {};
    flatOrders.forEach(order => {
      if (order.book?.genre) {
        if (!genreData[order.book.genre]) {
          genreData[order.book.genre] = { count: 0, totalSpent: 0 };
        }
        genreData[order.book.genre].count += order.quantity;
      }
    });
    
    // Add spending per genre
    ordersDocs.forEach(order => {
      order.items?.forEach(item => {
        if (item.book?.genre) {
          if (genreData[item.book.genre]) {
            genreData[item.book.genre].totalSpent += item.lineTotal || 0;
          }
        }
      });
    });
    
    analytics.favoriteGenres = Object.entries(genreData)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([genre, data]) => ({ 
        _id: genre, 
        count: data.count,
        totalSpent: data.totalSpent
      }));

    // Calculate monthly spending for the last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlySpending = {};
    
    ordersDocs.forEach(order => {
      const orderDate = new Date(order.createdAt);
      if (orderDate >= sixMonthsAgo) {
        const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + (order.grandTotal || 0);
      }
    });
    
    analytics.monthlySpending = Object.entries(monthlySpending)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, amount]) => ({ month, amount }));

    // Recent activity (last 5 orders) with book names
    analytics.recentActivity = ordersDocs.slice(0, 5).map(order => ({
      date: order.createdAt,
      books: order.items?.map(item => item.book?.title || item.title).filter(Boolean) || [],
      itemCount: order.items?.length || 0,
      total: order.grandTotal || 0,
      status: order.status
    }));

    // Average order value
    analytics.averageOrderValue = analytics.totalOrders > 0 
      ? (analytics.totalSpent / analytics.totalOrders).toFixed(2) 
      : 0;

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: { user, analytics }
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null
    });
  }
};

export const updateBuyerProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, currentPassword, newPassword } = req.body;
    const buyerId = req.user.id;

    const updatedBuyer = await updateBuyerDetails(buyerId, {
      firstName,
      lastName,
      email,
      currentPassword,
      newPassword,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { buyer: updatedBuyer }
    });
  } catch (error) {
    if (error.message === "Incorrect password") {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
        data: null
      });
    }
    if (error.message === "Email already exists") {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        data: null
      });
    }
    console.error("Error updating profile:", error);
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

export const updateBuyerProfileById = async (req, res) => {
  const { id: buyerId } = req.params;
  const { currentPassword, firstname, lastname, email, confirmPassword } = req.body;
  try {
    // Build update data - only hash password if provided
    const updateData = {
      firstname,
      lastname,
      email,
    };
    
    // Only include password in update if user wants to change it
    if (confirmPassword) {
      updateData.password = await bcrypt.hash(confirmPassword, 10);
    }
    
    const updatedBuyer = await updateBuyerDetails(buyerId, currentPassword, updateData);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { buyer: updatedBuyer }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
      data: null
    });
  }
};

// Address CRUD
export const getBuyerAddresses = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.user.id);
    if (!buyer) return res.status(404).json({ success: false, message: "Buyer not found" });
    res.status(200).json({ success: true, addresses: buyer.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching addresses" });
  }
};

export const addBuyerAddress = async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    const buyer = await Buyer.findById(req.user.id);
    if (!buyer) return res.status(404).json({ success: false, message: "Buyer not found" });
    const newAddr = { name, address, phone };
    buyer.addresses.push(newAddr);
    await buyer.save();
    // Return the last address (with _id)
    const createdAddr = buyer.addresses[buyer.addresses.length - 1];
    res.status(201).json({ success: true, address: createdAddr });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding address" });
  }
};

export const updateBuyerAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone } = req.body;
    const buyer = await Buyer.findById(req.user.id);
    if (!buyer) return res.status(404).json({ success: false, message: "Buyer not found" });
    const addr = buyer.addresses.id(id);
    if (!addr) return res.status(404).json({ success: false, message: "Address not found" });
    addr.name = name;
    addr.address = address;
    addr.phone = phone;
    await buyer.save();
    res.status(200).json({ success: true, address: addr });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating address" });
  }
};

export const deleteBuyerAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const buyer = await Buyer.findById(req.user.id);
    if (!buyer) return res.status(404).json({ success: false, message: "Buyer not found" });
    const beforeCount = buyer.addresses.length;
    // Use filter instead of deprecated subdocument .remove() for Mongoose 7/8 compatibility
    buyer.addresses = buyer.addresses.filter((addr) => addr._id.toString() !== id.toString());
    if (buyer.addresses.length === beforeCount) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    await buyer.save();
    res.status(200).json({ success: true, message: "Address deleted" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ success: false, message: "Error deleting address" });
  }
};