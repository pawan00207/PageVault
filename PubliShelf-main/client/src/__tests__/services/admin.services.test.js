/* eslint-disable no-undef */
import { jest } from "@jest/globals";

jest.unstable_mockModule("../../utils/axiosInstance.util.js", () => ({
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

const {
  loginAdmin,
  getAllAdmins,
  approveManager,
  getPlatformAnalytics
} = await import("../../services/admin.services.js");
const axiosInstance = (await import("../../utils/axiosInstance.util.js")).default;

describe("admin.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs in admin", async () => {
    axiosInstance.post.mockResolvedValue({ status: 200, data: { success: true } });

    const result = await loginAdmin({ adminKey: "key" });

    expect(axiosInstance.post).toHaveBeenCalledWith("/admin/auth/login", { adminKey: "key" });
    expect(result).toEqual({ success: true });
  });

  it("throws for failed request", async () => {
    axiosInstance.get.mockResolvedValue({ status: 500, data: { message: "fail" } });

    await expect(getAllAdmins()).rejects.toThrow("fail");
  });

  it("approves manager", async () => {
    axiosInstance.post.mockResolvedValue({ status: 200, data: { success: true } });

    const result = await approveManager("manager-1");

    expect(axiosInstance.post).toHaveBeenCalledWith("/admin/managers/manager-1/approve");
    expect(result).toEqual({ success: true });
  });

  it("fetches platform analytics", async () => {
    axiosInstance.get.mockResolvedValue({ status: 200, data: { totals: 1 } });

    const result = await getPlatformAnalytics();

    expect(axiosInstance.get).toHaveBeenCalledWith("/admin/analytics");
    expect(result).toEqual({ totals: 1 });
  });
});
