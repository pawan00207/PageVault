/* eslint-disable no-undef */
import { jest } from "@jest/globals";

jest.unstable_mockModule("../../utils/axiosInstance.util.js", () => ({
  default: {
    post: jest.fn(),
    get: jest.fn()
  }
}));

const { login, logout, getCurrentUser } = await import("../../services/auth.services.js");
const axiosInstance = (await import("../../utils/axiosInstance.util.js")).default;

describe("auth.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls login endpoint with credentials", async () => {
    axiosInstance.post.mockResolvedValue({ data: { success: true } });

    await login({ email: "user@test.com", password: "secret" });

    expect(axiosInstance.post).toHaveBeenCalledWith("auth/login", {
      email: "user@test.com",
      password: "secret"
    });
  });

  it("fetches current user", async () => {
    axiosInstance.get.mockResolvedValue({ data: { success: true } });

    await getCurrentUser();

    expect(axiosInstance.get).toHaveBeenCalledWith("auth/me");
  });

  it("calls logout endpoint", async () => {
    axiosInstance.post.mockResolvedValue({ data: { success: true } });

    await logout();

    expect(axiosInstance.post).toHaveBeenCalledWith("auth/logout");
  });
});
