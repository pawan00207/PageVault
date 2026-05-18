/* eslint-disable no-undef */
import { jest } from "@jest/globals";

jest.unstable_mockModule("../../utils/axiosInstance.util.js", () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    put: jest.fn()
  }
}));

const {
  getDashboard,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  placeOrder
} = await import("../../services/buyer.services.js");
const axiosInstance = (await import("../../utils/axiosInstance.util.js")).default;

describe("buyer.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches dashboard data", async () => {
    axiosInstance.get.mockResolvedValue({ data: { success: true } });

    const result = await getDashboard();

    expect(axiosInstance.get).toHaveBeenCalledWith("buyer/dashboard");
    expect(result).toEqual({ success: true });
  });

  it("adds item to cart", async () => {
    axiosInstance.post.mockResolvedValue({ data: { success: true } });

    const result = await addToCart({ bookId: "b1", quantity: 2 });

    expect(axiosInstance.post).toHaveBeenCalledWith("buyer/cart/add", { bookId: "b1", quantity: 2 });
    expect(result).toEqual({ success: true });
  });

  it("removes item from cart", async () => {
    axiosInstance.delete.mockResolvedValue({ data: { success: true } });

    const result = await removeFromCart("b2");

    expect(axiosInstance.delete).toHaveBeenCalledWith("buyer/cart/remove", { data: { bookId: "b2" } });
    expect(result).toEqual({ success: true });
  });

  it("updates cart quantity", async () => {
    axiosInstance.patch.mockResolvedValue({ data: { success: true } });

    const result = await updateCartQuantity({ bookId: "b3", quantity: 3 });

    expect(axiosInstance.patch).toHaveBeenCalledWith("buyer/cart/update-quantity", { bookId: "b3", quantity: 3 });
    expect(result).toEqual({ success: true });
  });

  it("places an order", async () => {
    axiosInstance.post.mockResolvedValue({ data: { success: true } });

    const result = await placeOrder({ addressId: "addr-1", paymentMethod: "COD" });

    expect(axiosInstance.post).toHaveBeenCalledWith("buyer/checkout/place-order", {
      addressId: "addr-1",
      paymentMethod: "COD"
    });
    expect(result).toEqual({ success: true });
  });
});
