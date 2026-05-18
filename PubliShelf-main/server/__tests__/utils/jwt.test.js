import { generateToken, verifyToken } from "../../utils/jwt.js";

describe("jwt utils", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1h";
  });

  it("generates and verifies token", () => {
    const token = generateToken({
      _id: "user-1",
      role: "buyer",
      firstname: "Alex",
      lastname: "Morgan",
      email: "alex@test.com"
    });

    const decoded = verifyToken(token);

    expect(decoded).toMatchObject({
      id: "user-1",
      role: "buyer",
      firstname: "Alex",
      lastname: "Morgan",
      email: "alex@test.com"
    });
  });
});
