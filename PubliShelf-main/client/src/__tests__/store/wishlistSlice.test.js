/* eslint-disable no-undef */
import { jest } from "@jest/globals";

jest.unstable_mockModule("../../services/buyer.services.js", () => ({
  getCart: jest.fn(),
  addToWishlist: jest.fn(),
  removeFromWishlist: jest.fn()
}));

const {
  default: wishlistReducer,
  clearWishlist,
  setWishlist,
  addToWishlistThunk,
  removeFromWishlistThunk
} = await import("../../store/slices/wishlistSlice.js");

describe("wishlistSlice", () => {
  it("clears wishlist state", () => {
    const state = {
      data: [{ _id: "b1" }],
      loading: true,
      error: "error",
      addingIds: ["b1"],
      removingIds: []
    };

    const result = wishlistReducer(state, clearWishlist());

    expect(result.data).toEqual([]);
    expect(result.loading).toBe(false);
    expect(result.error).toBeNull();
    expect(result.addingIds).toEqual([]);
  });

  it("sets wishlist items", () => {
    const result = wishlistReducer(undefined, setWishlist([{ _id: "b2" }]));

    expect(result.data).toEqual([{ _id: "b2" }]);
  });

  it("adds and removes wishlist items", () => {
    const pendingAdd = addToWishlistThunk.pending("req-1", { bookId: "b3" });
    const pendingState = wishlistReducer(undefined, pendingAdd);

    expect(pendingState.addingIds).toContain("b3");

    const fulfilledAdd = addToWishlistThunk.fulfilled(
      { bookId: "b3" },
      "req-1",
      { bookId: "b3", book: { _id: "b3", title: "Book" } }
    );
    const addedState = wishlistReducer(pendingState, fulfilledAdd);

    expect(addedState.data).toEqual([{ _id: "b3", title: "Book" }]);
    expect(addedState.addingIds).not.toContain("b3");

    const pendingRemove = removeFromWishlistThunk.pending("req-2", "b3");
    const removingState = wishlistReducer(addedState, pendingRemove);

    expect(removingState.removingIds).toContain("b3");

    const fulfilledRemove = removeFromWishlistThunk.fulfilled(
      { bookId: "b3" },
      "req-2",
      "b3"
    );
    const result = wishlistReducer(removingState, fulfilledRemove);

    expect(result.data).toEqual([]);
    expect(result.removingIds).not.toContain("b3");
  });
});
