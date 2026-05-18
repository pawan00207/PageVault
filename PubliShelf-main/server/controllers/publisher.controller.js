//controllers/publisher.controller.js
import { getPublisherById, addBookToPublisher, createPublisher } from "../services/publisher.services.js";
import { createBook } from "../services/book.services.js";
import { createAntiqueBook } from "../services/antiqueBook.services.js";
import Book from "../models/Book.model.js";
import Order from "../models/Order.model.js";
import AntiqueBook from "../models/AntiqueBook.model.js";
import Publisher from "../models/Publisher.model.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { buildCacheKey, getOrSetCache } from "../services/cache.services.js";

export const getPublisherProfile = async (req, res) => {
  try {
    const controllerStartTimeMs = Date.now();
    const cacheKey = buildCacheKey("publisher:profile", { publisherId: req.user.id });
    const profileData = await getOrSetCache({
      key: cacheKey,
      ttlSeconds: 180,
      label: "Publisher Profile",
      controllerStartTimeMs,
      getter: async () => {
        const publisher = await getPublisherById(req.user.id);
        if (!publisher) {
          return null;
        }

        const allBooks = await Book.find({ publisher: req.user.id }).sort({ publishedAt: -1 });
        const books = allBooks.filter(book => !book.isDeleted);

        const ordersDocs = await Order.find({ publishers: req.user.id })
          .select("items createdAt status buyer grandTotal")
          .populate({ path: "items.book", select: "title price genre" })
          .populate({ path: "buyer", select: "firstname lastname email" })
          .lean();

        const orders = ordersDocs.flatMap((o) =>
          (o.items || [])
            .filter((it) => it.publisher?.toString() === req.user.id)
            .map((it) => ({
              book: it.book?._id || it.book,
              title: it.book?.title || it.title,
              genre: it.book?.genre,
              price: it.unitPrice,
              quantity: it.quantity,
              lineTotal: it.lineTotal || (it.unitPrice * it.quantity),
              orderDate: o.createdAt,
              status: o.status,
              buyer: o.buyer,
            }))
        );

        const totalBooksSold = orders.reduce((sum, order) => sum + order.quantity, 0);
        const totalRevenue = orders.reduce((sum, order) => sum + order.lineTotal, 0);

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const publisherObjectId = new mongoose.Types.ObjectId(req.user.id);

        const monthlyRevenue = await Order.aggregate([
          { $match: { publishers: publisherObjectId, createdAt: { $gte: sixMonthsAgo } } },
          { $unwind: "$items" },
          { $match: { "items.publisher": publisherObjectId } },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
              },
              revenue: { $sum: "$items.lineTotal" }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const revenueMap = new Map();

        monthlyRevenue.forEach(item => {
          const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
          revenueMap.set(key, item.revenue);
        });

        const revenueData = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const key = `${year}-${String(month).padStart(2, '0')}`;
          const monthLabel = `${monthNames[month - 1]} ${year}`;

          revenueData.push({
            month: monthLabel,
            revenue: revenueMap.get(key) || 0
          });
        }

        const genreData = orders.reduce((acc, order) => {
          const genre = order.genre || 'Unknown';
          if (!acc[genre]) {
            acc[genre] = { genre, quantity: 0, revenue: 0 };
          }
          acc[genre].quantity += order.quantity;
          acc[genre].revenue += order.lineTotal;
          return acc;
        }, {});

        const genreBreakdown = Object.values(genreData)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        const bookSalesMap = orders.reduce((acc, order) => {
          const bookId = order.book.toString();
          if (!acc[bookId]) {
            acc[bookId] = { title: order.title, quantity: 0, revenue: 0 };
          }
          acc[bookId].quantity += order.quantity;
          acc[bookId].revenue += order.lineTotal;
          return acc;
        }, {});

        const topSellingBooks = Object.values(bookSalesMap)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);

        const buyerInteractions = ordersDocs
          .filter(o => o.buyer)
          .map(o => ({
            buyer: {
              name: `${o.buyer.firstname} ${o.buyer.lastname}`,
              email: o.buyer.email,
            },
            books: o.items
              .filter(it => it.publisher?.toString() === req.user.id)
              .map(it => it.book?.title || it.title),
            totalAmount: o.items
              .filter(it => it.publisher?.toString() === req.user.id)
              .reduce((sum, it) => sum + (it.lineTotal || 0), 0),
            orderDate: o.createdAt,
            status: o.status,
          }))
          .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
          .slice(0, 10);

        const lowStockBooks = books
          .filter(book => book.quantity > 0 && book.quantity <= 5)
          .map(book => ({
            title: book.title,
            quantity: book.quantity,
            _id: book._id,
          }));

        return {
          user: {
            firstname: publisher.firstname,
            lastname: publisher.lastname,
            email: publisher.email,
            publishingHouse: publisher.publishingHouse,
          },
          analytics: {
            totalBooksSold,
            totalRevenue,
            activeBooks: books.length,
            totalBooks: allBooks.length,
            revenueData,
            genreBreakdown,
            topSellingBooks,
            buyerInteractions,
            lowStockBooks,
          },
        };
      }
    });

    if (!profileData) {
      return res.status(404).json({ success: false, message: "Publisher not found" });
    }

    res.status(200).json({
      success: true,
      message: "Publisher profile fetched successfully",
      data: profileData,
    });
  } catch (error) {
    console.error("Error fetching publisher profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPublisherDashboard = async (req, res) => {
  try {
    const publisher = await getPublisherById(req.user.id);

    if (!publisher) {
      console.error("Publisher not found for ID:", req.user.id);
      return res.status(404).json({
        success: false,
        message: "Publisher not found",
        data: null
      });
    }

    // Split books into active and deleted
    const allBooks = await Book.find({ publisher: req.user.id })
      .sort({ publishedAt: -1 });
    const books = allBooks.filter(book => !book.isDeleted);
    const deletedBooks = allBooks.filter(book => book.isDeleted);
    
    const auctions = await AntiqueBook.find({ publisher: req.user.id })
      .sort({ auctionStart: -1 })
    
    // Fetch orders including this publisher via items array
    const ordersDocs = await Order.find({ publishers: req.user.id })
      .select("items createdAt status")
      .populate({ path: "items.book", select: "title price genre" })
      .lean();
    // Flatten relevant items for this publisher
    const orders = ordersDocs.flatMap((o) =>
      (o.items || []).filter((it) => it.publisher?.toString() === req.user.id).map((it) => ({
        book: it.book?._id || it.book,
        title: it.book?.title || it.title,
        genre: it.book?.genre,
        price: it.unitPrice,
        quantity: it.quantity,
        orderDate: o.createdAt,
      }))
    );

    const booksSold = orders.reduce((sum, order) => sum + order.quantity, 0);
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (order.price * order.quantity);
    }, 0);

    const bookSales = books.map((book) => {
      const sales = orders
  .filter((order) => order.book.toString() === book._id.toString())
        .reduce((sum, order) => sum + order.quantity, 0);
      return { book, sales };
    });

    const mostSoldBook = bookSales.reduce(
      (max, current) => (current.sales > max.sales ? current : max),
      { sales: 0 }
    );

    const genreCounts = orders.reduce((acc, order) => {
      const book = books.find(
        (b) => b._id.toString() === order.book.toString()
      );
      if (book) {
        acc[book.genre] = (acc[book.genre] || 0) + order.quantity;
      }
      return acc;
    }, {});

    const topGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const analytics = {
      booksSold,
      totalRevenue,
      mostSoldBook: mostSoldBook.book
        ? { title: mostSoldBook.book.title, count: mostSoldBook.sales }
        : null,
      topGenres,
    };

    const activities = orders.map((order) => ({
      action: `Ordered ${order.quantity} copies of ${order.title}`,
      timestamp: order.orderDate,
    })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const availableBooks = await Book.find({ publisher: req.user.id });

    res.status(200).json({
      success: true,
      message: "Publisher dashboard data fetched successfully",
      data: {
        publisher: { ...publisher.toObject(), status: "approved" },
        analytics,
        books,
        deletedBooks,
        auctions,
        activities,
        availableBooks,
      }
    });
  } catch (error) {
    console.error("Error fetching publisher dashboard:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the dashboard",
      data: null
    });
  }
};

export const createPublisherSignup = async (req, res) => {
  const { firstname, lastname, publishingHouse, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newPublisher = await createPublisher({
      firstname,
      lastname,
      publishingHouse,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Publisher account created successfully",
      data: null
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        data: null
      });
    }
    res.status(500).json({
      success: false,
      message: "Error creating publisher",
      data: null
    });
  }
};

export const publishBook = async (req, res) => {
  try {
    const { title, author, description, genre, price, quantity } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please upload a book cover image",
        data: null
      });
    }

    const imageUrl = req.file.path;
    const newBook = await createBook({
      title,
      author,
      description,
      genre,
      price,
      quantity,
      image: imageUrl,
      publisher: req.user.id,
      publishedAt: new Date(),
    });

    await addBookToPublisher(req.user.id, newBook._id);

    res.status(201).json({
      success: true,
      message: "Book published successfully",
      data: { book: newBook }
    });
  } catch (error) {
    console.error("Error publishing book:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while publishing the book",
      data: null
    });
  }
};

export const sellAntique = async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      genre,
      condition,
      basePrice,
      auctionStart,
      auctionEnd,
    } = req.body;
    const authFiles = req.files?.authenticationImages || req.files?.authenticationImage;
    if (!req.files || !req.files.itemImage || !authFiles) {
      return res.status(400).json({
        success: false,
        message: "Please upload item image and at least one authentication document",
        data: null
      });
    }

    const itemImageUrl = req.files.itemImage[0].path;
    // Normalize authentication files array (support legacy single name)
    const authArray = Array.isArray(authFiles) ? authFiles : [authFiles];
    const authenticationImages = authArray.map((f) => f.path).filter(Boolean);

    const newAntiqueBook = await createAntiqueBook({
      title,
      author,
      description,
      genre,
      condition,
      basePrice,
      auctionStart,
      auctionEnd,
      image: itemImageUrl,
      authenticationImages,
      publisher: req.user.id,
      publishedAt: new Date(),
      // Moderation flags: send for verification
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: "Antique book submitted for verification",
      data: { antiqueBook: newAntiqueBook }
    });
  } catch (error) {
    console.error("Error listing antique book:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while submitting the antique book for verification",
      data: null
    });
  }
};

export const getPublisherBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found', data: null });
    if (book.publisher.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized', data: null });
    res.status(200).json({ success: true, message: 'Book fetched', data: book });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ success: false, message: 'Error fetching book', data: null });
  }
};

export const updatePublisherBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found', data: null });
    if (book.publisher.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized', data: null });

    const allowed = ["title", "author", "description", "genre", "price", "quantity"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        book[field] = req.body[field];
      }
    });

    if (req.file && req.file.path) {
      book.image = req.file.path;
    }

    await book.save();

    res.status(200).json({ success: true, message: 'Book updated', data: book });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ success: false, message: 'Error updating book', data: null });
  }
};

export const deletePublisherBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found', data: null });
    if (book.publisher.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized', data: null });

    book.isDeleted = true;
    await book.save();

    const Buyer = (await import('../models/Buyer.model.js')).default;
    await Buyer.updateMany(
      { $or: [ { 'cart.book': book._id }, { wishlist: book._id } ] },
      { $pull: { cart: { book: book._id }, wishlist: book._id } }
    );

    res.status(200).json({ success: true, message: 'Book soft-deleted and buyers updated', data: null });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ success: false, message: 'Error deleting book', data: null });
  }
};

export const restorePublisherBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found', data: null });
    if (book.publisher.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized', data: null });

    book.isDeleted = false;
    await book.save();

    res.status(200).json({ success: true, message: 'Book restored successfully', data: book });
  } catch (error) {
    console.error('Error restoring book:', error);
    res.status(500).json({ success: false, message: 'Error restoring book', data: null });
  }
};

export const updatePublisherProfile = async (req, res) => {
  try {
    const publisher = await getPublisherById(req.user.id);
    if (!publisher) {
      return res.status(404).json({ success: false, message: "Publisher not found" });
    }

    const { firstname, lastname, publishingHouse, email, currentPassword, newPassword } = req.body;

    // Verify current password is provided for any changes
    if (!currentPassword) {
      return res.status(400).json({ success: false, message: "Current password is required to update profile" });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, publisher.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    // Update basic info
    if (firstname) publisher.firstname = firstname;
    if (lastname) publisher.lastname = lastname;
    if (publishingHouse) publisher.publishingHouse = publishingHouse;

    // Handle email change
    if (email && email !== publisher.email) {
      const existingPublisher = await Publisher.findOne({ email });
      if (existingPublisher) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
      publisher.email = email;
    }

    // Handle password change (optional)
    if (newPassword) {
      publisher.password = await bcrypt.hash(newPassword, 10);
    }

    await publisher.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        firstname: publisher.firstname,
        lastname: publisher.lastname,
        email: publisher.email,
        publishingHouse: publisher.publishingHouse,
      },
    });
  } catch (error) {
    console.error("Error updating publisher profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};