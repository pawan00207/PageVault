import { jest } from "@jest/globals";

const buyerMock = { findById: jest.fn() };
const bookMock = { findOne: jest.fn(), updateOne: jest.fn() };
const orderMock = { create: jest.fn() };
const publisherMock = {};
const mongooseMock = { startSession: jest.fn() };

jest.unstable_mockModule("../../models/Buyer.model.js", () => ({
  default: buyerMock
}));
jest.unstable_mockModule("../../models/Book.model.js", () => ({
  default: bookMock
}));
jest.unstable_mockModule("../../models/Publisher.model.js", () => ({
  default: publisherMock
}));
jest.unstable_mockModule("../../models/Order.model.js", () => ({
  default: orderMock
}));
jest.unstable_mockModule("mongoose", () => ({
  default: mongooseMock
}));

const { placeOrder } = await import("../../services/buyer.services.js");

const buildBuyer = ({ withAddress = true } = {}) => ({
  _id: "buyer-1",
  cart: [
    {
      book: { _id: "book-1", title: "Book One" },
      quantity: 1
    }
  ],
  addresses: withAddress
    ? [{ _id: "addr-1", name: "Alex", address: "Street 1", phone: "999" }]
    : [],
  save: jest.fn()
});

describe("buyer.services placeOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws when delivery address is missing", async () => {
    const buyerDoc = buildBuyer({ withAddress: false });
    buyerMock.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(buyerDoc)
    });

    await expect(placeOrder("buyer-1", { addressId: "addr-1" })).rejects.toThrow(
      "Delivery address not found"
    );
  });

  it("creates a COD order with pending payment status", async () => {
    const buyerDoc = buildBuyer({ withAddress: true });
    buyerMock.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(buyerDoc)
    });
    bookMock.findOne.mockResolvedValue({
      _id: "book-1",
      title: "Book One",
      price: 100,
      quantity: 5,
      image: "img",
      publisher: "pub-1"
    });
    bookMock.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const session = {
      withTransaction: jest.fn(async (fn) => fn()),
      endSession: jest.fn()
    };
    mongooseMock.startSession.mockResolvedValue(session);

    orderMock.create.mockResolvedValue([
      {
        _id: "order-1",
        paymentStatus: "pending",
        status: "created"
      }
    ]);

    const result = await placeOrder("buyer-1", {
      addressId: "addr-1",
      paymentMethod: "COD"
    });

    expect(result.paymentStatus).toBe("pending");
    expect(result.status).toBe("created");
    expect(bookMock.updateOne).toHaveBeenCalled();
    expect(orderMock.create).toHaveBeenCalled();
    expect(buyerDoc.save).toHaveBeenCalled();
  });
});
