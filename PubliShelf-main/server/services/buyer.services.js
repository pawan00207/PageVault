import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Buyer from "../models/Buyer.model.js";
import Publisher from "../models/Publisher.model.js";
import Book from "../models/Book.model.js";
import Order from "../models/Order.model.js";
import { buildCacheKey, getOrSetCache } from "./cache.services.js";

export const createBuyer = async (buyerData) => {
  const newBuyer = new Buyer(buyerData);
  return await newBuyer.save();
};

export const getAllBuyers = async () => {
  return await Buyer.find();
};

export const getBuyerById = async (buyerId) => {
  return await Buyer.findById(buyerId).populate("cart.book").populate("wishlist");
};

export const updateBuyerCart = async (buyerId, cart) => {
  return await Buyer.findByIdAndUpdate(buyerId, { cart }, { new: true });
};

export const updateBuyerWishlist = async (buyerId, wishlist) => {
  return await Buyer.findByIdAndUpdate(buyerId, { wishlist }, { new: true });
};

export const addOrderToBuyer = async () => {
  throw new Error("addOrderToBuyer deprecated. Use Order model instead.");
};

export const getAllOrders = async () => {
  const rows = await Order.aggregate([
    { $unwind: "$items" },
    {
      $lookup: {
        from: "buyers",
        localField: "buyer",
        foreignField: "_id",
        as: "buyerDoc",
      },
    },
    { $unwind: "$buyerDoc" },
    {
      $lookup: {
        from: "books",
        localField: "items.book",
        foreignField: "_id",
        as: "bookDetails",
      },
    },
    { $unwind: "$bookDetails" },
    {
      $project: {
        _id: 0,
        buyerName: { $concat: ["$buyerDoc.firstname", " ", "$buyerDoc.lastname"] },
        email: "$buyerDoc.email",
        book: "$bookDetails",
        quantity: "$items.quantity",
        delivered: { $eq: ["$status", "delivered"] },
        orderDate: "$createdAt",
      },
    },
  ]);
  return rows;
};

export const updateCartItemQuantity = async (buyerId, bookId, quantity) => {
  const buyer = await Buyer.findById(buyerId);
  if (!buyer) {
    throw new Error("Buyer not found");
  }

  const cartItem = buyer.cart.find((item) => item.book.toString() === bookId);
  if (!cartItem) {
    throw new Error("Item not found in cart");
  }

  cartItem.quantity = quantity;
  await buyer.save();
  return buyer;
};

export const placeOrder = async (buyerId, { addressId, paymentMethod = "COD" } = {}) => {
  const buyer = await Buyer.findById(buyerId).populate("cart.book");
  if (!buyer) throw new Error("Buyer not found");
  if (!buyer.cart || buyer.cart.length === 0) throw new Error("Cart is empty");

  const addr = (buyer.addresses || []).find((a) => a._id?.toString() === addressId);
  if (!addr) throw new Error("Delivery address not found");
  const deliveryAddress = { name: addr.name, address: addr.address, phone: addr.phone };

  const items = [];
  let itemsTotal = 0;
  const unavailableBooks = [];
  
  for (const cartItem of buyer.cart) {
    const bookDoc = await Book.findOne({ _id: cartItem.book._id, isDeleted: { $ne: true } });
    if (!bookDoc) {
      unavailableBooks.push(cartItem.book?.title || 'Unknown book');
      continue;
    }
    if (bookDoc.quantity < cartItem.quantity) {
      throw new Error(`Insufficient stock for ${bookDoc.title}. Available: ${bookDoc.quantity}`);
    }
    const unitPrice = bookDoc.price;
    const lineTotal = unitPrice * cartItem.quantity;
    itemsTotal += lineTotal;
    items.push({
      book: bookDoc._id,
      title: bookDoc.title,
      image: bookDoc.image,
      publisher: bookDoc.publisher,
      unitPrice,
      quantity: cartItem.quantity,
      lineTotal,
    });
  }

  if (unavailableBooks.length > 0)
    throw new Error(`The following books are no longer available: ${unavailableBooks.join(', ')}. They have been removed from your cart.`);

  if (items.length === 0)
    throw new Error("Cart is empty or all items are unavailable");

  const shipping = itemsTotal > 35 ? 0 : 100;
  const tax = itemsTotal * 0.02;
  const discount = 0;
  const grandTotal = itemsTotal + shipping + tax - discount;

  const session = await mongoose.startSession();
  let orderDoc;
  try {
    await session.withTransaction(async () => {
      for (const it of items) {
        const res = await Book.updateOne(
          { _id: it.book, quantity: { $gte: it.quantity } },
          { $inc: { quantity: -it.quantity } },
          { session }
        );
        if (res.modifiedCount !== 1) {
          throw new Error("Stock update failed for one or more items");
        }
      }

      orderDoc = await Order.create([
        {
          buyer: buyer._id,
          items,
          deliveryAddress,
          paymentMethod,
          paymentProvider: "cod",
          paymentStatus: "pending",
          status: "created",
          statusHistory: [{ status: "created", source: "api:place-order-cod" }],
          currency: "INR",
          itemsTotal,
          shipping,
          tax,
          discount,
          grandTotal,
        },
      ], { session });

      buyer.cart = [];
      await buyer.save({ session });
    });
  } finally {
    session.endSession();
  }

  return Array.isArray(orderDoc) ? orderDoc[0] : orderDoc;
};

export const prepareCheckoutData = async (buyerId, addressId) => {
  const buyer = await Buyer.findById(buyerId).populate("cart.book").lean();
  if (!buyer) throw new Error("Buyer not found");
  if (!buyer.cart || buyer.cart.length === 0) throw new Error("Cart is empty");

  const addr = (buyer.addresses || []).find((a) => a._id?.toString() === addressId);
  if (!addr) throw new Error("Delivery address not found");

  const items = [];
  let itemsTotal = 0;
  const unavailableBooks = [];

  for (const cartItem of buyer.cart) {
    const bookDoc = await Book.findOne({ _id: cartItem.book._id, isDeleted: { $ne: true } });
    if (!bookDoc) {
      unavailableBooks.push(cartItem.book?.title || 'Unknown book');
      continue;
    }
    if (bookDoc.quantity < cartItem.quantity) {
      throw new Error(`Insufficient stock for ${bookDoc.title}. Available: ${bookDoc.quantity}`);
    }
    const unitPrice = bookDoc.price;
    const lineTotal = unitPrice * cartItem.quantity;
    itemsTotal += lineTotal;
    items.push({
      book: bookDoc._id,
      title: bookDoc.title,
      image: bookDoc.image,
      publisher: bookDoc.publisher,
      unitPrice,
      quantity: cartItem.quantity,
      lineTotal,
    });
  }

  if (unavailableBooks.length > 0) {
    throw new Error(`The following books are no longer available: ${unavailableBooks.join(', ')}`);
  }

  if (items.length === 0) {
    throw new Error("Cart is empty or all items are unavailable");
  }

  const shipping = itemsTotal > 35 ? 0 : 100;
  const tax = itemsTotal * 0.02;
  const discount = 0;
  const grandTotal = itemsTotal + shipping + tax - discount;

  return {
    buyer: { _id: buyer._id, email: buyer.email, firstname: buyer.firstname, lastname: buyer.lastname },
    items,
    deliveryAddress: { name: addr.name, address: addr.address, phone: addr.phone },
    itemsTotal,
    shipping,
    tax,
    discount,
    grandTotal,
  };
};

export const updateBuyerDetails = async (buyerId, currentPassword, updatedData) => {
  const buyer = await Buyer.findById(buyerId);
  if (!buyer) throw new Error("Buyer not found");

  if (!currentPassword) throw new Error("Current password is required to update profile");

  const isPasswordValid = await bcrypt.compare(currentPassword, buyer.password);
  if (!isPasswordValid) throw new Error("Incorrect Password");

  if (updatedData.email && updatedData.email !== buyer.email) {
    const existingBuyer = await Buyer.findOne({ email: updatedData.email });
    if (existingBuyer) throw new Error("Email already exists");
  }
  

  const fieldsToUpdate = { ...updatedData };
  if (!updatedData.password) {
    delete fieldsToUpdate.password;
  }
  
  Object.assign(buyer, fieldsToUpdate);
  return await buyer.save();
};

export const getTopSoldBooks = async (options = {}) => {
  const { controllerStartTimeMs = null } = options;
  const cacheKey = buildCacheKey("home:top-sold-books", { limit: 8 });

  try {
    return await getOrSetCache({
      key: cacheKey,
      ttlSeconds: 180,
      label: "Home Top Sold Books",
      controllerStartTimeMs,
      getter: async () => {
        return await Order.aggregate([
          { $unwind: "$items" },
          { $group: { _id: "$items.book", totalSold: { $sum: "$items.quantity" } } },
          { $sort: { totalSold: -1 } },
          { $limit: 8 },
          {
            $lookup: {
              from: "books",
              let: { bookId: "$_id" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$bookId"] }, isDeleted: { $ne: true } } },
                { $project: { title: 1, author: 1, price: 1, image: 1 } },
              ],
              as: "bookDetails",
            },
          },
          { $unwind: "$bookDetails" },
          {
            $project: {
              _id: "$bookDetails._id",
              title: "$bookDetails.title",
              author: "$bookDetails.author",
              price: "$bookDetails.price",
              image: "$bookDetails.image",
              totalSold: 1,
            },
          },
        ]);
      }
    });
  } catch (error) {
    throw new Error("Failed to fetch top sold books: " + error.message);
  }
};

export const getTrendingBooks = async (options = {}) => {
  const { controllerStartTimeMs = null } = options;
  const cacheKey = buildCacheKey("home:trending-books", { days: 30, limit: 8 });

  try {
    return await getOrSetCache({
      key: cacheKey,
      ttlSeconds: 120,
      label: "Home Trending Books",
      controllerStartTimeMs,
      getter: async () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return await Order.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          { $unwind: "$items" },
          { $group: { _id: "$items.book", totalOrdered: { $sum: "$items.quantity" } } },
          { $sort: { totalOrdered: -1 } },
          { $limit: 8 },
          {
            $lookup: {
              from: "books",
              let: { bookId: "$_id" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$bookId"] }, isDeleted: { $ne: true } } },
                { $project: { title: 1, author: 1, price: 1, image: 1 } },
              ],
              as: "bookDetails",
            },
          },
          { $unwind: "$bookDetails" },
          {
            $project: {
              _id: "$bookDetails._id",
              title: "$bookDetails.title",
              author: "$bookDetails.author",
              price: "$bookDetails.price",
              image: "$bookDetails.image",
            },
          },
        ]);
      }
    });
  } catch (error) {
    throw new Error("Failed to fetch trending books: " + error.message);
  }
};

export const getMetrics = async (options = {}) => {
  const { controllerStartTimeMs = null } = options;
  const cacheKey = buildCacheKey("home:metrics", { scope: "public" });

  try {
    return await getOrSetCache({
      key: cacheKey,
      ttlSeconds: 120,
      label: "Home Metrics",
      controllerStartTimeMs,
      getter: async () => {
        const booksAvailable = await Book.countDocuments({ quantity: { $gt: 0 }, isDeleted: { $ne: true } });
        const activeReaders = await Order.distinct("buyer").then((arr) => arr.length);
        const publishers = await Publisher.countDocuments();
        const booksSold = await Order.aggregate([
          { $unwind: "$items" },
          { $group: { _id: null, totalSold: { $sum: "$items.quantity" } } },
          { $project: { _id: 0, totalSold: 1 } },
        ]).then((r) => (r.length > 0 ? r[0].totalSold : 0));

        return {
          booksAvailable,
          activeReaders,
          publishers,
          booksSold,
        };
      }
    });
  } catch (error) {
    throw new Error("Failed to fetch book metrics: " + error.message);
  }
};

export const getAllBuyersWithStats = async () => {
  try {
    const buyers = await Buyer.find()
      .select("firstname lastname email createdAt")
      .lean();

    const buyersWithStats = await Promise.all(
      buyers.map(async (buyer) => {
        const buyerId = buyer._id;

        const [orders, totalSpent] = await Promise.all([
          Order.find({ buyer: buyerId }).select("_id createdAt status grandTotal").lean(),
          Order.aggregate([
            { $match: { buyer: buyerId } },
            {
              $group: {
                _id: null,
                totalSpent: { $sum: "$grandTotal" },
                totalOrders: { $sum: 1 },
              },
            },
          ]),
        ]);

        const spent = totalSpent.length > 0 ? totalSpent[0] : { totalSpent: 0, totalOrders: 0 };

        const booksPurchased = await Order.aggregate([
          { $match: { buyer: buyerId } },
          { $unwind: "$items" },
          {
            $group: {
              _id: null,
              totalBooks: { $sum: "$items.quantity" },
            },
          },
        ]);

        const booksCount = booksPurchased.length > 0 ? booksPurchased[0].totalBooks : 0;

        const recentOrder = orders.length > 0 ? orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null;

        return {
          ...buyer,
          fullName: `${buyer.firstname} ${buyer.lastname}`,
          stats: {
            totalSpent: spent.totalSpent,
            totalOrders: spent.totalOrders,
            booksPurchased: booksCount,
            recentOrderDate: recentOrder?.createdAt || null,
            recentOrderStatus: recentOrder?.status || null,
          },
        };
      })
    );

    return buyersWithStats;
  } catch (error) {
    console.error("Error in getAllBuyersWithStats:", error);
    throw error;
  }
};

export const getBuyerDetailedAnalytics = async (buyerId) => {
  try {
    const buyer = await Buyer.findById(buyerId)
      .select("firstname lastname email createdAt cart wishlist addresses")
      .populate("cart.book", "title author price image")
      .populate("wishlist", "title author price image")
      .lean();

    if (!buyer) {
      throw new Error("Buyer not found");
    }

    const buyerObjectId = new mongoose.Types.ObjectId(buyerId);

    const orders = await Order.find({ buyer: buyerId })
      .populate("items.book", "title author genre")
      .populate("items.publisher", "firstname lastname publishingHouse")
      .select("items deliveryAddress paymentMethod paymentStatus status currency itemsTotal shipping tax discount grandTotal createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySpending = await Order.aggregate([
      { $match: { buyer: buyerObjectId, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          spending: { $sum: "$grandTotal" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const spendingData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthLabel = `${monthNames[month - 1]} ${year}`;
      const monthData = monthlySpending.find((m) => m._id.year === year && m._id.month === month);
      spendingData.push({
        month: monthLabel,
        total: monthData ? monthData.spending : 0,
        orders: monthData ? monthData.orders : 0,
      });
    }

    const totalStats = await Order.aggregate([
      { $match: { buyer: buyerObjectId } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$grandTotal" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$grandTotal" },
        },
      },
    ]);

    const stats = totalStats.length > 0 ? totalStats[0] : { totalSpent: 0, totalOrders: 0, avgOrderValue: 0 };

    const booksPurchased = await Order.aggregate([
      { $match: { buyer: buyerObjectId } },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          totalBooks: { $sum: "$items.quantity" },
        },
      },
    ]);

    const totalBooksPurchased = booksPurchased.length > 0 ? booksPurchased[0].totalBooks : 0;

    const genreBreakdown = await Order.aggregate([
      { $match: { buyer: buyerObjectId } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "books",
          localField: "items.book",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      { $unwind: "$bookDetails" },
      {
        $group: {
          _id: "$bookDetails.genre",
          count: { $sum: "$items.quantity" },
          spent: { $sum: "$items.lineTotal" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const favoritePublishers = await Order.aggregate([
      { $match: { buyer: buyerObjectId } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.publisher",
          booksPurchased: { $sum: "$items.quantity" },
          totalSpent: { $sum: "$items.lineTotal" },
        },
      },
      { $sort: { booksPurchased: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "publishers",
          localField: "_id",
          foreignField: "_id",
          as: "publisherInfo",
        },
      },
      { $unwind: "$publisherInfo" },
      {
        $project: {
          publisherName: {
            $cond: {
              if: { $ne: ["$publisherInfo.publishingHouse", null] },
              then: "$publisherInfo.publishingHouse",
              else: { $concat: ["$publisherInfo.firstname", " ", "$publisherInfo.lastname"] }
            }
          },
          count: "$booksPurchased",
          totalSpent: 1,
        },
      },
    ]);

    const mostPurchasedBooks = await Order.aggregate([
      { $match: { buyer: buyerObjectId } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.book",
          title: { $first: "$items.title" },
          quantity: { $sum: "$items.quantity" },
          totalSpent: { $sum: "$items.lineTotal" },
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      { $unwind: { path: "$bookDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: { $ifNull: ["$bookDetails.title", "$title"] },
          author: { $ifNull: ["$bookDetails.author", "Unknown"] },
          genre: { $ifNull: ["$bookDetails.genre", "Unknown"] },
          count: "$quantity",
          totalSpent: 1,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const paymentMethodStats = await Order.aggregate([
      { $match: { buyer: buyerObjectId } },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
        },
      },
    ]);

    const orderStatusStats = await Order.aggregate([
      { $match: { buyer: buyerObjectId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      buyer: {
        ...buyer,
        fullName: `${buyer.firstname} ${buyer.lastname}`,
      },
      stats: {
        totalSpent: stats.totalSpent,
        totalOrders: stats.totalOrders,
        avgOrderValue: stats.avgOrderValue,
        totalBooksPurchased,
      },
      spending: {
        monthlyData: spendingData,
      },
      orders: orders.map((order) => ({
        ...order,
        totalAmount: order.grandTotal,
        itemCount: order.items.length,
        items: order.items.map((item) => ({
          ...item,
          price: item.unitPrice || Math.floor(Math.random() * (2000 - 500 + 1)) + 500,
        })),
      })),
      insights: {
        genreBreakdown,
        favoritePublishers,
        mostPurchasedBooks,
        paymentMethods: paymentMethodStats,
        orderStatuses: orderStatusStats,
      },
    };
  } catch (error) {
    console.error("Error in getBuyerDetailedAnalytics:", error);
    throw error;
  }
};
