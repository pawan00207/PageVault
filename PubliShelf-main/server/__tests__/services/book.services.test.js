import { jest } from "@jest/globals";

const bookMock = {
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn()
};
const orderMock = {
  aggregate: jest.fn()
};

jest.unstable_mockModule("../../models/Book.model.js", () => ({
  default: bookMock
}));

jest.unstable_mockModule("../../models/Order.model.js", () => ({
  default: orderMock
}));

const {
  getAllBooks,
  searchBooks,
  filterBooks,
  addReviewToBook
} = await import("../../services/book.services.js");

describe("book.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches all non-deleted books", async () => {
    const books = [{ _id: "b1" }];
    bookMock.find.mockResolvedValue(books);

    const result = await getAllBooks();

    expect(bookMock.find).toHaveBeenCalledWith({ isDeleted: { $ne: true } });
    expect(result).toEqual(books);
  });

  it("returns empty array for empty search query", async () => {
    const result = await searchBooks("");

    expect(result).toEqual([]);
    expect(bookMock.find).not.toHaveBeenCalled();
  });

  it("searches books by title/author/genre", async () => {
    const books = [{ _id: "b2", title: "Magic" }];
    bookMock.find.mockResolvedValue(books);

    const result = await searchBooks("magic");

    expect(bookMock.find).toHaveBeenCalledWith({
      isDeleted: { $ne: true },
      $or: [
        { title: { $regex: "magic", $options: "i" } },
        { author: { $regex: "magic", $options: "i" } },
        { genre: { $regex: "magic", $options: "i" } }
      ]
    });
    expect(result).toEqual(books);
  });

  it("filters and sorts books by price low to high", async () => {
    bookMock.find.mockResolvedValue([
      { _id: "b1", price: 30, createdAt: "2024-01-01" },
      { _id: "b2", price: 10, createdAt: "2023-01-01" }
    ]);

    const result = await filterBooks({
      category: "Fantasy",
      condition: "New",
      priceRange: "5-40",
      sort: "priceLowToHigh"
    });

    expect(bookMock.find).toHaveBeenCalledWith({
      isDeleted: { $ne: true },
      genre: "Fantasy",
      condition: "New",
      price: { $gte: 5, $lte: 40 }
    });
    expect(result.map((book) => book._id)).toEqual(["b2", "b1"]);
  });

  it("adds review and recalculates rating", async () => {
    const bookDoc = {
      reviews: [{ rating: 4 }],
      rating: 4,
      save: jest.fn().mockResolvedValue({ success: true })
    };
    bookMock.findById.mockResolvedValue(bookDoc);

    const review = { rating: 5, comment: "Great" };
    const result = await addReviewToBook("book-1", review);

    expect(bookDoc.reviews).toHaveLength(2);
    expect(bookDoc.rating).toBe(4.5);
    expect(bookDoc.save).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it("throws when adding review to missing book", async () => {
    bookMock.findById.mockResolvedValue(null);

    await expect(addReviewToBook("missing", { rating: 3 })).rejects.toThrow("Book not found");
  });
});
