/* eslint-disable no-undef */
import { jest } from "@jest/globals";

jest.unstable_mockModule("../../utils/axiosInstance.util.js", () => ({
  default: {
    get: jest.fn()
  }
}));

const {
  getAllBooks,
  getBookById,
  searchBooksApi,
  filterBooksApi
} = await import("../../services/book.services.js");
const axiosInstance = (await import("../../utils/axiosInstance.util.js")).default;

describe("book.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches all books", async () => {
    axiosInstance.get.mockResolvedValue({ data: { books: [{ id: "b1" }] } });

    const result = await getAllBooks();

    expect(axiosInstance.get).toHaveBeenCalledWith("buyer/search-page");
    expect(result).toEqual([{ id: "b1" }]);
  });

  it("fetches a book by id", async () => {
    axiosInstance.get.mockResolvedValue({ data: { book: { id: "b2" } } });

    const result = await getBookById("b2");

    expect(axiosInstance.get).toHaveBeenCalledWith("buyer/product-detail/b2");
    expect(result).toEqual({ id: "b2" });
  });

  it("searches books with query", async () => {
    axiosInstance.get.mockResolvedValue({ data: { books: [{ id: "b3" }] } });

    const result = await searchBooksApi("magic");

    expect(axiosInstance.get).toHaveBeenCalledWith("buyer/search", { params: { q: "magic" } });
    expect(result).toEqual([{ id: "b3" }]);
  });

  it("filters books with params", async () => {
    axiosInstance.get.mockResolvedValue({ data: { books: [{ id: "b4" }] } });

    const result = await filterBooksApi({ category: "Fantasy" });

    expect(axiosInstance.get).toHaveBeenCalledWith("buyer/filter", { params: { category: "Fantasy" } });
    expect(result).toEqual([{ id: "b4" }]);
  });
});
