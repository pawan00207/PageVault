import { jest } from "@jest/globals";

const loginUserMock = jest.fn();

jest.unstable_mockModule("../../services/auth.services.js", () => ({
  loginUser: loginUserMock
}));

const { loginPostController, logoutController } = await import("../../controllers/auth.controller.js");

const createRes = () => {
  const res = {};
  res.cookie = jest.fn();
  res.clearCookie = jest.fn();
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("auth.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 and sets cookie on successful login", async () => {
    loginUserMock.mockResolvedValue({
      code: 0,
      token: "token-123",
      user: { id: "buyer-1" }
    });

    const req = { body: { email: "a@b.com", password: "pass" } };
    const res = createRes();

    await loginPostController(req, res);

    expect(loginUserMock).toHaveBeenCalledWith("a@b.com", "pass");
    expect(res.cookie).toHaveBeenCalledWith("token", "token-123", expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Login successful",
      data: { user: { id: "buyer-1" } }
    });
  });

  it("returns 401 for invalid password", async () => {
    loginUserMock.mockResolvedValue({ code: 401 });

    const req = { body: { email: "a@b.com", password: "bad" } };
    const res = createRes();

    await loginPostController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid password",
      data: null
    });
  });

  it("returns 403 when user is not found", async () => {
    loginUserMock.mockResolvedValue({ code: 403, message: "User not found" });

    const req = { body: { email: "missing@b.com", password: "pass" } };
    const res = createRes();

    await loginPostController(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
      data: null
    });
  });

  it("clears cookie on logout", async () => {
    const req = {};
    const res = createRes();

    await logoutController(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith("token", expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Logged out successfully",
      data: null
    });
  });
});
