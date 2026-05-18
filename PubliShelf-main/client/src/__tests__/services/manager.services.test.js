/* eslint-disable no-undef */
import { jest } from "@jest/globals";

jest.unstable_mockModule("../../utils/axiosInstance.util.js", () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn()
  }
}));

const {
  signupManager,
  getDashboard,
  updateProfile,
  getPendingBooks,
  approvePublisher
} = await import("../../services/manager.services.js");
const axiosInstance = (await import("../../utils/axiosInstance.util.js")).default;

describe("manager.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("signs up manager", async () => {
    axiosInstance.post.mockResolvedValue({ data: { success: true } });

    const result = await signupManager({ email: "m@test.com" });

    expect(axiosInstance.post).toHaveBeenCalledWith("manager/signup", { email: "m@test.com" });
    expect(result).toEqual({ success: true });
  });

  it("returns dashboard data", async () => {
    axiosInstance.get.mockResolvedValue({ data: { success: true } });

    const result = await getDashboard();

    expect(axiosInstance.get).toHaveBeenCalledWith("manager/dashboard");
    expect(result).toEqual({ success: true });
  });

  it("returns disabled message for book flows", async () => {
    const result = await getPendingBooks();

    expect(result).toEqual({
      success: false,
      message: "Manager book management is temporarily disabled"
    });
  });

  it("updates profile", async () => {
    axiosInstance.put.mockResolvedValue({ data: { success: true } });

    const result = await updateProfile({ firstname: "Alex" });

    expect(axiosInstance.put).toHaveBeenCalledWith("manager/profile", { firstname: "Alex" });
    expect(result).toEqual({ success: true });
  });

  it("approves publisher", async () => {
    axiosInstance.put.mockResolvedValue({ data: { success: true } });

    const result = await approvePublisher("publisher-1");

    expect(axiosInstance.put).toHaveBeenCalledWith("manager/publishers/publisher-1/approve");
    expect(result).toEqual({ success: true });
  });
});
