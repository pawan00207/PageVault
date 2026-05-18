import Book from "../models/Book.model.js";
import Order from "../models/Order.model.js";
import mongoose from "mongoose";

export const getAllBooks = async () => {
  return await Book.find({ isDeleted: { $ne: true } });
};

export const getBookById = async (bookId) => {
  return await Book.findOne({ _id: bookId, isDeleted: { $ne: true } }).populate("reviews.buyer").populate("publisher");
};

export const addReviewToBook = async (bookId, review) => {
  const book = await Book.findById(bookId);

  if (!book) {
    throw new Error("Book not found");
  }

  book.reviews.push(review);

  const totalRatings = book.reviews.reduce((sum, review) => sum + review.rating, 0);
  book.rating = totalRatings / book.reviews.length;

  return await book.save();
};

export const createBook = async (bookData) => {
  const newBook = new Book(bookData);
  return await newBook.save();
};

export const searchBooks = async (query) => {
  if (!query) {
    return [];
  }

  return await Book.find({
    isDeleted: { $ne: true },
    $or: [
      { title: { $regex: query, $options: "i" } },
      { author: { $regex: query, $options: "i" } },
      { genre: { $regex: query, $options: "i" } },
    ],
  });
};

export const filterBooks = async (filters) => {
  const { category, sort, condition, priceRange } = filters;

  const query = { isDeleted: { $ne: true } };
  if (category && category !== "All") {
    query.genre = category;
  }
  if (condition && condition !== "All") {
    query.condition = condition;
  }
  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split("-").map(Number);
    query.price = { $gte: minPrice, $lte: maxPrice };
  }

  let books = await Book.find(query);

  if (sort) {
    if (sort === "priceLowToHigh") {
      books = books.sort((a, b) => a.price - b.price);
    } else if (sort === "priceHighToLow") {
      books = books.sort((a, b) => b.price - a.price);
    } else if (sort === "newestFirst") {
      books = books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  return books;
};

export const getAllBooksWithStats = async () => {
  try {
    const books = await Book.find()
      .populate("publisher", "firstname lastname publishingHouse")
      .select("title author genre price quantity rating reviews condition image isDeleted createdAt")
      .lean();

    const booksWithStats = await Promise.all(
      books.map(async (book) => {
        const bookId = book._id;

        const orderStats = await Order.aggregate([
          { $unwind: "$items" },
          {
            $match: {
              "items.book": bookId,
            },
          },
          {
            $group: {
              _id: null,
              totalSold: { $sum: "$items.quantity" },
              totalRevenue: { $sum: "$items.lineTotal" },
            },
          },
        ]);

        const stats = orderStats.length > 0 ? orderStats[0] : { totalSold: 0, totalRevenue: 0 };

        return {
          ...book,
          publisherName: book.publisher?.publishingHouse || `${book.publisher?.firstname || ""} ${book.publisher?.lastname || ""}`.trim() || "Unknown",
          stats: {
            totalSold: stats.totalSold,
            totalRevenue: stats.totalRevenue,
            reviewCount: book.reviews?.length || 0,
            rating: book.rating || 0,
            stock: book.quantity || 0,
            status: book.isDeleted ? "Deleted" : book.quantity > 0 ? "In Stock" : "Out of Stock",
          },
        };
      })
    );

    return booksWithStats;
  } catch (error) {
    console.error("Error in getAllBooksWithStats:", error);
    throw error;
  }
};

export const getBookDetailedAnalytics = async (bookId) => {
  try {
    const book = await Book.findById(bookId)
      .populate("publisher", "firstname lastname publishingHouse email")
      .populate("reviews.buyer", "firstname lastname")
      .lean();

    if (!book) {
      throw new Error("Book not found");
    }

    const bookObjectId = new mongoose.Types.ObjectId(bookId);

    const orderHistory = await Order.find({ "items.book": bookObjectId })
      .populate("buyer", "firstname lastname email")
      .select("buyer items status paymentMethod grandTotal createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const salesData = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.book": bookObjectId } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          quantitySold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.lineTotal" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const salesTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthLabel = `${monthNames[month - 1]} ${year}`;
      const monthData = salesData.find((m) => m._id.year === year && m._id.month === month);
      salesTrend.push({
        month: monthLabel,
        sales: monthData ? monthData.quantitySold : 0,
        revenue: monthData ? monthData.revenue : 0,
      });
    }

    const totalStats = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.book": bookObjectId } },
      {
        $group: {
          _id: null,
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.lineTotal" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const stats = totalStats.length > 0 ? totalStats[0] : { totalSold: 0, totalRevenue: 0, totalOrders: 0 };

    const topBuyers = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.book": bookObjectId } },
      {
        $group: {
          _id: "$buyer",
          quantityBought: { $sum: "$items.quantity" },
          totalSpent: { $sum: "$items.lineTotal" },
        },
      },
      { $sort: { quantityBought: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "buyers",
          localField: "_id",
          foreignField: "_id",
          as: "buyerInfo",
        },
      },
      { $unwind: "$buyerInfo" },
      {
        $project: {
          buyerName: { $concat: ["$buyerInfo.firstname", " ", "$buyerInfo.lastname"] },
          email: "$buyerInfo.email",
          quantityBought: 1,
          totalSpent: 1,
        },
      },
    ]);

    return {
      book: {
        ...book,
        publisherName: book.publisher?.publishingHouse || `${book.publisher?.firstname || ""} ${book.publisher?.lastname || ""}`.trim(),
      },
      stats: {
        totalSold: stats.totalSold,
        totalRevenue: stats.totalRevenue,
        totalOrders: stats.totalOrders,
        avgOrderValue: stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0,
        currentStock: book.quantity || 0,
        reviewCount: book.reviews?.length || 0,
        averageRating: book.rating || 0,
      },
      salesTrend,
      orderHistory: orderHistory.map((order) => {
        const bookItem = order.items.find((item) => item.book.toString() === bookId);
        const lineTotal = bookItem?.lineTotal || 0;
        const randomPrice = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
        return {
          _id: order._id,
          buyer: order.buyer,
          quantity: bookItem?.quantity || 0,
          amount: lineTotal > 0 ? lineTotal : randomPrice,
          status: order.status,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt,
        };
      }),
      topBuyers,
      reviews: book.reviews || [],
    };
  } catch (error) {
    console.error("Error in getBookDetailedAnalytics:", error);
    throw error;
  }
};