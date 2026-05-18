import { jest } from "@jest/globals";

const publisherMock = {
  findById: jest.fn(),
  findOne: jest.fn()
};

jest.unstable_mockModule("../../models/Publisher.model.js", () => ({
  default: publisherMock
}));

const {
  addBookToPublisher,
  togglePublisherBan,
  getPublisherByEmail
} = await import("../../services/publisher.services.js");

describe("publisher.services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("adds a book to publisher catalog", async () => {
    const publisherDoc = {
      books: [],
      save: jest.fn().mockResolvedValue({ books: ["book-1"] })
    };
    publisherMock.findById.mockResolvedValue(publisherDoc);

    const result = await addBookToPublisher("publisher-1", "book-1");

    expect(publisherMock.findById).toHaveBeenCalledWith("publisher-1");
    expect(publisherDoc.books).toContain("book-1");
    expect(publisherDoc.save).toHaveBeenCalled();
    expect(result).toEqual({ books: ["book-1"] });
  });

  it("toggles ban status to banned", async () => {
    const publisherDoc = {
      account: { status: "active" },
      save: jest.fn().mockResolvedValue({ account: { status: "banned" } })
    };
    publisherMock.findById.mockResolvedValue(publisherDoc);

    const result = await togglePublisherBan("publisher-2");

    expect(publisherDoc.account.status).toBe("banned");
    expect(publisherDoc.account.at).toBeInstanceOf(Date);
    expect(publisherDoc.save).toHaveBeenCalled();
    expect(result).toEqual({ account: { status: "banned" } });
  });

  it("toggles ban status back to active", async () => {
    const publisherDoc = {
      account: { status: "banned", reason: "spam" },
      save: jest.fn().mockResolvedValue({ account: { status: "active" } })
    };
    publisherMock.findById.mockResolvedValue(publisherDoc);

    const result = await togglePublisherBan("publisher-3");

    expect(publisherDoc.account).toEqual({
      status: "active",
      by: null,
      at: null,
      reason: null
    });
    expect(publisherDoc.save).toHaveBeenCalled();
    expect(result).toEqual({ account: { status: "active" } });
  });

  it("throws when toggling missing publisher", async () => {
    publisherMock.findById.mockResolvedValue(null);

    await expect(togglePublisherBan("missing")).rejects.toThrow("Publisher not found");
  });

  it("fetches publisher by email", async () => {
    publisherMock.findOne.mockResolvedValue({ _id: "publisher-1" });

    const result = await getPublisherByEmail("pub@test.com");

    expect(publisherMock.findOne).toHaveBeenCalledWith({ email: "pub@test.com" });
    expect(result).toEqual({ _id: "publisher-1" });
  });
});
