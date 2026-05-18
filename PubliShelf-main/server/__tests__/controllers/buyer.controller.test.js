import { jest } from "@jest/globals";

const getAllBooksMock = jest.fn();
const getBookByIdMock = jest.fn();
const searchBooksMock = jest.fn();
const filterBooksMock = jest.fn();
const getBuyerByIdMock = jest.fn();
const createBuyerMock = jest.fn();
const updateBuyerDetailsMock = jest.fn();
const getTopSoldBooksMock = jest.fn();
const getTrendingBooksMock = jest.fn();
const placeOrderMock = jest.fn();
const prepareCheckoutDataMock = jest.fn();
const getOngoingAuctionsMock = jest.fn();
const getFutureAuctionsMock = jest.fn();
const getEndedAuctionsMock = jest.fn();
const getAuctionItemByIdMock = jest.fn();
const addBidMock = jest.fn();
const bcryptMock = { hash: jest.fn() };

jest.unstable_mockModule("../../services/book.services.js", () => ({
  getAllBooks: getAllBooksMock,
  getBookById: getBookByIdMock,
  searchBooks: searchBooksMock,
  filterBooks: filterBooksMock
}));

jest.unstable_mockModule("../../services/buyer.services.js", () => ({
  getBuyerById: getBuyerByIdMock,
  createBuyer: createBuyerMock,
  updateBuyerDetails: updateBuyerDetailsMock,
  getTopSoldBooks: getTopSoldBooksMock,
  getTrendingBooks: getTrendingBooksMock,
  placeOrder: placeOrderMock,
  prepareCheckoutData: prepareCheckoutDataMock
}));

jest.unstable_mockModule("../../services/antiqueBook.services.js", () => ({
  getOngoingAuctions: getOngoingAuctionsMock,
  getFutureAuctions: getFutureAuctionsMock,
  getEndedAuctions: getEndedAuctionsMock,
  getAuctionItemById: getAuctionItemByIdMock,
  addBid: addBidMock
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: bcryptMock
}));

const {
  getBuyerSearchPage,
  searchBooksHandler,
  filterBooksHandler,
  createBuyerSignup
} = await import("../../controllers/buyer.controller.js");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("buyer.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns search page data", async () => {
    getAllBooksMock.mockResolvedValue([{ _id: "b1" }]);

    const req = {};
    const res = createRes();

    await getBuyerSearchPage(req, res);

    expect(getAllBooksMock).toHaveBeenCalledWith({ isDeleted: false });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Search page data fetched successfully",
      data: { books: [{ _id: "b1" }] }
    });
  });

  it("returns search results", async () => {
    searchBooksMock.mockResolvedValue([{ _id: "b2" }]);

    const req = { query: { q: "history" } };
    const res = createRes();

    await searchBooksHandler(req, res);

    expect(searchBooksMock).toHaveBeenCalledWith("history");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Search results fetched successfully",
      data: { books: [{ _id: "b2" }] }
    });
  });

  it("returns filtered books", async () => {
    filterBooksMock.mockResolvedValue([{ _id: "b3" }]);

    const req = {
      query: {
        category: "Fantasy",
        sort: "priceLowToHigh",
        condition: "New",
        priceRange: "10-50"
      }
    };
    const res = createRes();

    await filterBooksHandler(req, res);

    expect(filterBooksMock).toHaveBeenCalledWith({
      category: "Fantasy",
      sort: "priceLowToHigh",
      condition: "New",
      priceRange: "10-50"
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Filtered books fetched successfully",
      data: { books: [{ _id: "b3" }] }
    });
  });

  it("creates buyer signup with hashed password", async () => {
    bcryptMock.hash.mockResolvedValue("hashed");
    createBuyerMock.mockResolvedValue({ _id: "buyer-1" });

    const req = {
      body: { firstname: "Alex", lastname: "Smith", email: "a@test.com", password: "pass" }
    };
    const res = createRes();

    await createBuyerSignup(req, res);

    expect(bcryptMock.hash).toHaveBeenCalledWith("pass", 10);
    expect(createBuyerMock).toHaveBeenCalledWith({
      firstname: "Alex",
      lastname: "Smith",
      email: "a@test.com",
      password: "hashed"
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Buyer account created successfully",
      data: null
    });
  });

  it("returns 400 when email already exists", async () => {
    bcryptMock.hash.mockResolvedValue("hashed");
    createBuyerMock.mockRejectedValue({ code: 11000 });

    const req = {
      body: { firstname: "Alex", lastname: "Smith", email: "a@test.com", password: "pass" }
    };
    const res = createRes();

    await createBuyerSignup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Email already exists",
      data: null
    });
  });
});
