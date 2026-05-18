import { jest } from "@jest/globals";
import notFoundHandler from "../../middleware/notFoundHandler.middleware.js";

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("notFoundHandler middleware", () => {
  it("returns 404 with route info", () => {
    const req = { method: "GET", originalUrl: "/missing" };
    const res = createRes();

    notFoundHandler(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Route GET /missing not found",
      data: null
    });
  });
});
