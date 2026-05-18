import { jest } from "@jest/globals";
import bcrypt from "bcrypt";

const buyerMock = { findOne: jest.fn() };
const publisherMock = { findOne: jest.fn() };
const managerMock = { findOne: jest.fn() };
const generateTokenMock = jest.fn();

jest.unstable_mockModule("../../models/Buyer.model.js", () => ({
  default: buyerMock
}));
jest.unstable_mockModule("../../models/Publisher.model.js", () => ({
  default: publisherMock
}));
jest.unstable_mockModule("../../models/Manager.model.js", () => ({
  default: managerMock
}));
jest.unstable_mockModule("../../utils/jwt.js", () => ({
  generateToken: generateTokenMock
}));

const { loginUser } = await import("../../services/auth.services.js");

const createQuery = (result) => ({
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(result)
});

describe("auth.services loginUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("authenticates a buyer and returns a token", async () => {
    const buyerDoc = { _id: "buyer-1", email: "buyer@test.com", password: "hash" };
    buyerMock.findOne.mockReturnValue(createQuery(buyerDoc));
    publisherMock.findOne.mockReturnValue(createQuery(null));
    managerMock.findOne.mockReturnValue(createQuery(null));
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
    generateTokenMock.mockReturnValue("token-abc");

    const result = await loginUser("buyer@test.com", "secret");

    expect(buyerMock.findOne).toHaveBeenCalledWith({ email: "buyer@test.com" });
    expect(result.code).toBe(0);
    expect(result.token).toBe("token-abc");
    expect(result.user.role).toBe("buyer");
  });

  it("returns 401 when buyer password is invalid", async () => {
    const buyerDoc = { _id: "buyer-1", email: "buyer@test.com", password: "hash" };
    buyerMock.findOne.mockReturnValue(createQuery(buyerDoc));
    publisherMock.findOne.mockReturnValue(createQuery(null));
    managerMock.findOne.mockReturnValue(createQuery(null));
    jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

    const result = await loginUser("buyer@test.com", "bad");

    expect(result.code).toBe(401);
    expect(result.token).toBeNull();
  });

  it("returns 403 when no user is found", async () => {
    buyerMock.findOne.mockReturnValue(createQuery(null));
    publisherMock.findOne.mockReturnValue(createQuery(null));
    managerMock.findOne.mockReturnValue(createQuery(null));

    const result = await loginUser("missing@test.com", "secret");

    expect(result.code).toBe(403);
    expect(result.token).toBeNull();
  });
});
