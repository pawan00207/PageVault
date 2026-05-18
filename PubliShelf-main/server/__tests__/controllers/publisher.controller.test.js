import { jest } from "@jest/globals";

const createPublisherMock = jest.fn();
const addBookToPublisherMock = jest.fn();
const getPublisherByIdMock = jest.fn();
const createBookMock = jest.fn();
const createAntiqueBookMock = jest.fn();
const bcryptMock = { hash: jest.fn() };

jest.unstable_mockModule("../../services/publisher.services.js", () => ({
  getPublisherById: getPublisherByIdMock,
  addBookToPublisher: addBookToPublisherMock,
  createPublisher: createPublisherMock
}));

jest.unstable_mockModule("../../services/book.services.js", () => ({
  createBook: createBookMock
}));

jest.unstable_mockModule("../../services/antiqueBook.services.js", () => ({
  createAntiqueBook: createAntiqueBookMock
}));

jest.unstable_mockModule("../../models/Book.model.js", () => ({ default: {} }));
jest.unstable_mockModule("../../models/Order.model.js", () => ({ default: {} }));
jest.unstable_mockModule("../../models/AntiqueBook.model.js", () => ({ default: {} }));
jest.unstable_mockModule("../../models/Publisher.model.js", () => ({ default: {} }));

jest.unstable_mockModule("bcrypt", () => ({
  default: bcryptMock
}));

const { createPublisherSignup, publishBook } = await import("../../controllers/publisher.controller.js");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("publisher.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates publisher signup", async () => {
    bcryptMock.hash.mockResolvedValue("hashed");
    createPublisherMock.mockResolvedValue({ _id: "publisher-1" });

    const req = {
      body: {
        firstname: "Alex",
        lastname: "Lee",
        publishingHouse: "House",
        email: "p@test.com",
        password: "secret"
      }
    };
    const res = createRes();

    await createPublisherSignup(req, res);

    expect(bcryptMock.hash).toHaveBeenCalledWith("secret", 10);
    expect(createPublisherMock).toHaveBeenCalledWith({
      firstname: "Alex",
      lastname: "Lee",
      publishingHouse: "House",
      email: "p@test.com",
      password: "hashed"
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("returns 400 when publisher email exists", async () => {
    bcryptMock.hash.mockResolvedValue("hashed");
    createPublisherMock.mockRejectedValue({ code: 11000 });

    const req = { body: { firstname: "Alex", lastname: "Lee", publishingHouse: "House", email: "p@test.com", password: "secret" } };
    const res = createRes();

    await createPublisherSignup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Email already exists",
      data: null
    });
  });

  it("returns 400 when publish book missing file", async () => {
    const req = { body: {}, file: null, user: { id: "publisher-1" } };
    const res = createRes();

    await publishBook(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "No file uploaded. Please upload a book cover image",
      data: null
    });
  });

  it("publishes book successfully", async () => {
    createBookMock.mockResolvedValue({ _id: "book-1" });
    addBookToPublisherMock.mockResolvedValue(true);

    const req = {
      body: { title: "Book", author: "Author", description: "Desc", genre: "Fantasy", price: 10, quantity: 2 },
      file: { path: "img" },
      user: { id: "publisher-1" }
    };
    const res = createRes();

    await publishBook(req, res);

    expect(createBookMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Book", author: "Author", image: "img", publisher: "publisher-1" })
    );
    expect(addBookToPublisherMock).toHaveBeenCalledWith("publisher-1", "book-1");
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
