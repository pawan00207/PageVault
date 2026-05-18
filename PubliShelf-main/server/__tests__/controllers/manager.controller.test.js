import { jest } from "@jest/globals";

const getManagerByIdMock = jest.fn();
const createManagerMock = jest.fn();
const updateManagerProfileMock = jest.fn();
const getManagerDashboardAnalyticsMock = jest.fn();
const getAllPendingBooksMock = jest.fn();
const getAllApprovedBooksMock = jest.fn();
const getAllRejectedBooksMock = jest.fn();
const approveBookMock = jest.fn();
const rejectBookMock = jest.fn();
const flagBookMock = jest.fn();
const getAllPendingAuctionsMock = jest.fn();
const getAllApprovedAuctionsMock = jest.fn();
const getAllRejectedAuctionsMock = jest.fn();
const getAuctionByIdMock = jest.fn();
const approveAuctionMock = jest.fn();
const rejectAuctionMock = jest.fn();
const getAuctionsOverviewMock = jest.fn();
const getAllPendingPublishersMock = jest.fn();
const getAllActivePublishersMock = jest.fn();
const approvePublisherMock = jest.fn();
const rejectPublisherMock = jest.fn();
const banPublisherMock = jest.fn();
const reinstatePublisherMock = jest.fn();
const getAuctionAnalyticsMock = jest.fn();
const getAllBannedPublishersMock = jest.fn();
const getPublisherDetailsMock = jest.fn();

jest.unstable_mockModule("../../services/manager.services.js", () => ({
  getManagerById: getManagerByIdMock,
  createManager: createManagerMock,
  updateManagerProfile: updateManagerProfileMock,
  getAllPendingBooks: getAllPendingBooksMock,
  getAllApprovedBooks: getAllApprovedBooksMock,
  getAllRejectedBooks: getAllRejectedBooksMock,
  approveBook: approveBookMock,
  rejectBook: rejectBookMock,
  flagBook: flagBookMock,
  getAllPendingAuctions: getAllPendingAuctionsMock,
  getAllApprovedAuctions: getAllApprovedAuctionsMock,
  getAllRejectedAuctions: getAllRejectedAuctionsMock,
  getAuctionById: getAuctionByIdMock,
  approveAuction: approveAuctionMock,
  rejectAuction: rejectAuctionMock,
  getAuctionsOverview: getAuctionsOverviewMock,
  getAllPendingPublishers: getAllPendingPublishersMock,
  getAllActivePublishers: getAllActivePublishersMock,
  approvePublisher: approvePublisherMock,
  rejectPublisher: rejectPublisherMock,
  banPublisher: banPublisherMock,
  reinstatePublisher: reinstatePublisherMock,
  getManagerDashboardAnalytics: getManagerDashboardAnalyticsMock,
  getAuctionAnalytics: getAuctionAnalyticsMock,
  getAllBannedPublishers: getAllBannedPublishersMock
}));

jest.unstable_mockModule("../../services/publisher.services.js", () => ({
  getPublisherById: getPublisherDetailsMock
}));

const {
  getManagerProfile,
  getManagerDashboard,
  createManagerSignup,
  updateManagerProfileController,
  getPendingAuctions,
  approveAuctionController,
  getPendingPublishers,
  approvePublisherController
} = await import("../../controllers/manager.controller.js");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("manager.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 404 when manager not found", async () => {
    getManagerByIdMock.mockResolvedValue(null);

    const req = { user: { id: "manager-1" } };
    const res = createRes();

    await getManagerProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Manager not found",
      data: null
    });
  });

  it("returns dashboard data", async () => {
    getManagerByIdMock.mockResolvedValue({ id: "manager-1" });
    getManagerDashboardAnalyticsMock.mockResolvedValue({ total: 10 });

    const req = { user: { id: "manager-1" } };
    const res = createRes();

    await getManagerDashboard(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Dashboard data fetched successfully",
      data: { manager: { id: "manager-1" }, analytics: { total: 10 } }
    });
  });

  it("rejects manager signup with missing fields", async () => {
    const req = { body: { firstname: "Alex" } };
    const res = createRes();

    await createManagerSignup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "All fields are required",
      data: null
    });
  });

  it("updates profile via service", async () => {
    updateManagerProfileMock.mockResolvedValue({ id: "manager-1" });
    const req = {
      user: { id: "manager-1" },
      body: { firstname: "Alex", currentPassword: "old" }
    };
    const res = createRes();

    await updateManagerProfileController(req, res);

    expect(updateManagerProfileMock).toHaveBeenCalledWith("manager-1", {
      firstname: "Alex",
      lastname: undefined,
      email: undefined,
      currentPassword: "old",
      newPassword: undefined
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Profile updated successfully",
      data: { id: "manager-1" }
    });
  });

  it("returns pending auctions", async () => {
    getAllPendingAuctionsMock.mockResolvedValue([{ _id: "auction-1" }]);

    const req = {};
    const res = createRes();

    await getPendingAuctions(req, res);

    expect(getAllPendingAuctionsMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Pending auctions fetched successfully",
      data: [{ _id: "auction-1" }]
    });
  });

  it("approves auction for manager", async () => {
    approveAuctionMock.mockResolvedValue({ _id: "auction-1" });

    const req = { params: { id: "auction-1" }, user: { id: "manager-1" } };
    const res = createRes();

    await approveAuctionController(req, res);

    expect(approveAuctionMock).toHaveBeenCalledWith("auction-1", "manager-1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns pending publishers", async () => {
    getAllPendingPublishersMock.mockResolvedValue([{ _id: "publisher-1" }]);

    const req = {};
    const res = createRes();

    await getPendingPublishers(req, res);

    expect(getAllPendingPublishersMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("approves publisher", async () => {
    approvePublisherMock.mockResolvedValue({ _id: "publisher-1" });

    const req = { params: { id: "publisher-1" }, user: { id: "manager-1" } };
    const res = createRes();

    await approvePublisherController(req, res);

    expect(approvePublisherMock).toHaveBeenCalledWith("publisher-1", "manager-1");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
