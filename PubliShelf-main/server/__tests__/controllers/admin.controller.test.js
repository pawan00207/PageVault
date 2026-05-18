import { jest } from "@jest/globals";

const adminModel = {
  find: jest.fn()
};
const managerModel = { countDocuments: jest.fn() };
const publisherModel = { countDocuments: jest.fn() };
const bookModel = { countDocuments: jest.fn() };
const orderModel = { aggregate: jest.fn() };
const jwtMock = { sign: jest.fn() };
const cookieOptionsMock = jest.fn();

jest.unstable_mockModule("../../models/Admin.model.js", () => ({
  default: adminModel
}));

jest.unstable_mockModule("../../models/Manager.model.js", () => ({
  default: managerModel
}));

jest.unstable_mockModule("../../models/Publisher.model.js", () => ({
  default: publisherModel
}));

jest.unstable_mockModule("../../models/Book.model.js", () => ({
  default: bookModel
}));

jest.unstable_mockModule("../../models/Order.model.js", () => ({
  default: orderModel
}));

jest.unstable_mockModule("../../services/buyer.services.js", () => ({
  getAllBuyers: jest.fn().mockResolvedValue([{ _id: "buyer-1" }]),
  getAllOrders: jest.fn().mockResolvedValue([]),
  getAllBuyersWithStats: jest.fn().mockResolvedValue([]),
  getBuyerDetailedAnalytics: jest.fn().mockResolvedValue({})
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: jwtMock
}));

jest.unstable_mockModule("../../config/cookie.js", () => ({
  getCookieOptions: cookieOptionsMock
}));

const { loginAdmin, getPlatformAnalytics } = await import("../../controllers/admin.controller.js");

const createRes = () => {
  const res = {};
  res.cookie = jest.fn();
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("admin.controller loginAdmin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1d";
  });

  it("returns 400 when admin key missing", async () => {
    const req = { body: {} };
    const res = createRes();

    await loginAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Admin key is required",
      data: null
    });
  });

  it("returns 401 for invalid key", async () => {
    const adminDoc = { compareAdminKey: jest.fn().mockResolvedValue(false) };
    adminModel.find.mockResolvedValue([adminDoc]);

    const req = { body: { adminKey: "bad" } };
    const res = createRes();

    await loginAdmin(req, res);

    expect(adminDoc.compareAdminKey).toHaveBeenCalledWith("bad");
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns token and admin data on success", async () => {
    const adminDoc = {
      _id: "admin-1",
      name: "Admin",
      email: "admin@test.com",
      isSuperAdmin: true,
      lastLogin: null,
      compareAdminKey: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true)
    };
    adminModel.find.mockResolvedValue([adminDoc]);
    jwtMock.sign.mockReturnValue("token-123");
    cookieOptionsMock.mockReturnValue({ httpOnly: true });

    const req = { body: { adminKey: "valid" } };
    const res = createRes();

    await loginAdmin(req, res);

    expect(jwtMock.sign).toHaveBeenCalledWith(
      expect.objectContaining({ id: "admin-1", role: "admin", isSuperAdmin: true }),
      expect.any(String),
      expect.any(Object)
    );
    expect(res.cookie).toHaveBeenCalledWith("token", "token-123", { httpOnly: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Admin login successful",
      data: {
        admin: {
          id: "admin-1",
          name: "Admin",
          email: "admin@test.com",
          isSuperAdmin: true,
          lastLogin: adminDoc.lastLogin
        }
      }
    });
  });

  it("returns platform analytics", async () => {
    managerModel.countDocuments.mockResolvedValue(2);
    publisherModel.countDocuments.mockResolvedValue(3);
    bookModel.countDocuments.mockResolvedValue(4);
    orderModel.aggregate.mockResolvedValue([]);

    const req = {};
    const res = createRes();

    await getPlatformAnalytics(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        managers: 2,
        publishers: 3,
        buyers: 1,
        books: 4,
        orders: 0
      })
    );
  });
});
