/* eslint-disable no-undef */
import { jest } from "@jest/globals";

jest.unstable_mockModule("../../utils/axiosInstance.util.js", () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

const {
  getDashboard,
  signupPublisher,
  publishBook,
  updateBook
} = await import("../../services/publisher.services.js");
const axiosInstance = (await import("../../utils/axiosInstance.util.js")).default;

describe("publisher.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches publisher dashboard", async () => {
    axiosInstance.get.mockResolvedValue({ data: { success: true } });

    const result = await getDashboard();

    expect(axiosInstance.get).toHaveBeenCalledWith("/publisher/dashboard");
    expect(result).toEqual({ success: true });
  });

  it("signs up publisher", async () => {
    axiosInstance.post.mockResolvedValue({ data: { success: true } });

    const result = await signupPublisher({ email: "p@test.com" });

    expect(axiosInstance.post).toHaveBeenCalledWith("/publisher/signup", { email: "p@test.com" });
    expect(result).toEqual({ success: true });
  });

  it("publishes book with multipart", async () => {
    const formData = new FormData();
    axiosInstance.post.mockResolvedValue({ data: { success: true } });

    const result = await publishBook(formData);

    expect(axiosInstance.post).toHaveBeenCalledWith("/publisher/publish-book", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    expect(result).toEqual({ success: true });
  });

  it("updates book with form data headers", async () => {
    const formData = new FormData();
    axiosInstance.put.mockResolvedValue({ data: { success: true } });

    const result = await updateBook("book-1", formData);

    expect(axiosInstance.put).toHaveBeenCalledWith("/publisher/book/book-1", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    expect(result).toEqual({ success: true });
  });
});
