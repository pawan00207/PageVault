import { jest } from "@jest/globals";
import bcrypt from "bcrypt";

const ManagerMock = function (data) {
  Object.assign(this, data);
  this.save = jest.fn().mockResolvedValue(this);
  this.toObject = () => ({ ...this });
};

ManagerMock.findById = jest.fn();
ManagerMock.findOne = jest.fn();

jest.unstable_mockModule("../../models/Manager.model.js", () => ({
  default: ManagerMock
}));

const {
  getManagerById,
  createManager,
  updateManagerProfile,
  getAllApprovedAuctions
} = await import("../../services/manager.services.js");

const setFindByIdWithSelect = (result) => {
  ManagerMock.findById.mockReturnValue({
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result)
  });
};

describe("manager.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns manager by id", async () => {
    setFindByIdWithSelect({ _id: "manager-1" });

    const result = await getManagerById("manager-1");

    expect(ManagerMock.findById).toHaveBeenCalledWith("manager-1");
    expect(result).toEqual({ _id: "manager-1" });
  });

  it("throws when manager lookup fails", async () => {
    ManagerMock.findById.mockImplementation(() => {
      throw new Error("DB error");
    });

    await expect(getManagerById("manager-1")).rejects.toThrow("Error fetching manager");
  });

  it("creates manager with hashed password", async () => {
    ManagerMock.findOne.mockResolvedValue(null);
    jest.spyOn(bcrypt, "hash").mockResolvedValue("hashed");

    const result = await createManager({
      firstname: "Alex",
      lastname: "Smith",
      email: "alex@test.com",
      password: "secret"
    });

    expect(ManagerMock.findOne).toHaveBeenCalledWith({ email: "alex@test.com" });
    expect(result).toMatchObject({
      firstname: "Alex",
      lastname: "Smith",
      email: "alex@test.com"
    });
    expect(result.password).toBeUndefined();
  });

  it("throws when email already registered", async () => {
    ManagerMock.findOne.mockResolvedValue({ _id: "existing" });

    await expect(
      createManager({ firstname: "Alex", lastname: "Smith", email: "alex@test.com", password: "secret" })
    ).rejects.toThrow("Email already registered");
  });

  it("updates profile after validating password", async () => {
    const managerDoc = {
      _id: "manager-1",
      firstname: "Old",
      lastname: "Name",
      email: "old@test.com",
      password: "hashed",
      save: jest.fn().mockResolvedValue(true),
      toObject: () => ({ _id: "manager-1", firstname: "New", lastname: "Name", email: "new@test.com" })
    };
    ManagerMock.findById.mockResolvedValue(managerDoc);
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
    jest.spyOn(bcrypt, "hash").mockResolvedValue("hashed-new");

    const result = await updateManagerProfile("manager-1", {
      firstname: "New",
      email: "new@test.com",
      currentPassword: "old",
      newPassword: "new"
    });

    expect(managerDoc.firstname).toBe("New");
    expect(managerDoc.email).toBe("new@test.com");
    expect(managerDoc.password).toBe("hashed-new");
    expect(result).toEqual({ _id: "manager-1", firstname: "New", lastname: "Name", email: "new@test.com" });
  });

  it("throws when current password is invalid", async () => {
    const managerDoc = { password: "hashed" };
    ManagerMock.findById.mockResolvedValue(managerDoc);
    jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

    await expect(
      updateManagerProfile("manager-1", { currentPassword: "bad" })
    ).rejects.toThrow("Current password is incorrect");
  });

  it("returns empty approved auctions when manager id missing", async () => {
    const result = await getAllApprovedAuctions();

    expect(result).toEqual([]);
  });
});
