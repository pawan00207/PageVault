import { jest } from "@jest/globals";

const verifyTokenMock = jest.fn();

jest.unstable_mockModule("../../utils/jwt.js", () => ({
  verifyToken: verifyTokenMock
}));

const { protect, authorize, checkAdminKey } = await import("../../middleware/auth.middleware.js");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("auth.middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when no token is present", async () => {
    const req = { cookies: {} };
    const res = createRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Not authorized, no token",
      data: null
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token verification fails", async () => {
    verifyTokenMock.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const req = { cookies: { token: "bad" } };
    const res = createRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Not authorized, token failed",
      data: null
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("sets req.user and calls next on valid token", async () => {
    verifyTokenMock.mockReturnValue({ id: "user-1", role: "buyer" });

    const req = { cookies: { token: "good" } };
    const res = createRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(req.user).toEqual({ id: "user-1", role: "buyer" });
    expect(next).toHaveBeenCalled();
  });

  it("authorize blocks when role is not allowed", () => {
    const req = { user: { role: "buyer" } };
    const res = createRes();
    const next = jest.fn();

    authorize("admin")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User role buyer is not authorized to access this route",
      data: null
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("authorize allows matching role", () => {
    const req = { user: { role: "admin" } };
    const res = createRes();
    const next = jest.fn();

    authorize("admin", "manager")(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("checkAdminKey returns 401 for invalid key", () => {
    const req = { params: { key: "bad" } };
    const res = createRes();
    const next = jest.fn();

    checkAdminKey(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized access",
      data: null
    });
  });
});
