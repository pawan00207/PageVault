import { jest } from "@jest/globals";

const loggerMock = {
  error: jest.fn()
};

jest.unstable_mockModule("../../config/logger.js", () => ({
  default: loggerMock
}));

const { default: errorHandler } = await import("../../middleware/errorHandler.middleware.js");

const createRes = () => {
  const res = { statusCode: 200 };
  res.status = jest.fn().mockImplementation((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("errorHandler middleware", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "test";
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("logs error and returns statusCode from error", () => {
    const err = new Error("Invalid payload");
    err.statusCode = 400;

    const req = { method: "POST", url: "/api/test", ip: "127.0.0.1" };
    const res = createRes();

    errorHandler(err, req, res, jest.fn());

    expect(loggerMock.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Invalid payload",
        method: "POST",
        url: "/api/test",
        ip: "127.0.0.1"
      })
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid payload",
        data: null,
        stack: expect.any(String)
      })
    );
  });

  it("uses existing response status when no error statusCode", () => {
    const err = new Error("Not found");
    const req = { method: "GET", url: "/missing", ip: "127.0.0.1" };
    const res = createRes();
    res.statusCode = 404;

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
