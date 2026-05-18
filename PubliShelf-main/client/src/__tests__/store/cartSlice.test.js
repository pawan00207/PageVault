/* eslint-disable no-undef */
import { jest } from "@jest/globals";

jest.unstable_mockModule("../../services/buyer.services.js", () => ({
  getCart: jest.fn(),
  addToCart: jest.fn(),
  updateCartQuantity: jest.fn(),
  removeFromCart: jest.fn()
}));

const {
  default: cartReducer,
  clearCart,
  setCart,
  addToCartThunk,
  updateCartQuantityThunk
} = await import("../../store/slices/cartSlice.js");

describe("cartSlice", () => {
  it("clears cart state", () => {
    const state = {
      data: [{ book: { _id: "b1" }, quantity: 1 }],
      loading: true,
      error: "error",
      addingIds: [],
      updatingIds: [],
      removingIds: []
    };

    const result = cartReducer(state, clearCart());

    expect(result.data).toEqual([]);
    expect(result.loading).toBe(false);
    expect(result.error).toBeNull();
  });

  it("sets cart items", () => {
    const result = cartReducer(undefined, setCart([{ book: { _id: "b2" }, quantity: 2 }]));

    expect(result.data).toEqual([{ book: { _id: "b2" }, quantity: 2 }]);
  });

  it("tracks add-to-cart pending and fulfilled", () => {
    const pendingAction = addToCartThunk.pending("req-1", { bookId: "b3", quantity: 1 });
    const pendingState = cartReducer(undefined, pendingAction);

    expect(pendingState.addingIds).toContain("b3");

    const fulfilledAction = addToCartThunk.fulfilled(
      { bookId: "b3", quantity: 1 },
      "req-1",
      { bookId: "b3", quantity: 1, book: { _id: "b3", title: "Book" } }
    );

    const fulfilledState = cartReducer(pendingState, fulfilledAction);

    expect(fulfilledState.data).toEqual([{ book: { _id: "b3", title: "Book" }, quantity: 1 }]);
    expect(fulfilledState.addingIds).not.toContain("b3");
  });

  it("updates cart quantity", () => {
    const state = {
      data: [{ book: { _id: "b4" }, quantity: 1 }],
      loading: false,
      error: null,
      addingIds: [],
      updatingIds: ["b4"],
      removingIds: []
    };

    const fulfilledAction = updateCartQuantityThunk.fulfilled(
      { bookId: "b4", quantity: 5 },
      "req-2",
      { bookId: "b4", quantity: 5 }
    );

    const result = cartReducer(state, fulfilledAction);

    expect(result.data[0].quantity).toBe(5);
    expect(result.updatingIds).not.toContain("b4");
  });
});
