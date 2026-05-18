import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCart as apiGetCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateCartQuantity,
  removeFromCart as apiRemoveFromCart,
} from '../../services/buyer.services';

// State shape: { data: CartItem[], loading: boolean, error: string | null }
const initialState = {
  data: [],
  // loading/error apply to initial fetch only
  loading: false,
  error: null,
  // Per-item mutation tracking for granular UI states
  addingIds: [],
  updatingIds: [],
  removingIds: [],
};

// Async thunks
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const res = await apiGetCart();
    if (!res?.success) return rejectWithValue(res?.message || 'Failed to fetch cart');
    return res?.data?.cart || [];
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to fetch cart');
  }
});

// For add we optionally accept full book object for local update when API doesn't return cart
export const addToCartThunk = createAsyncThunk(
  'cart/addToCart',
  async ({ bookId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const res = await apiAddToCart({ bookId, quantity });
      if (!res?.success) return rejectWithValue(res?.message || 'Failed to add to cart');
      return { bookId, quantity };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartQuantityThunk = createAsyncThunk(
  'cart/updateQuantity',
  async ({ bookId, quantity }, { rejectWithValue }) => {
    try {
      const res = await apiUpdateCartQuantity({ bookId, quantity });
      if (!res?.success) return rejectWithValue(res?.message || 'Failed to update quantity');
      return { bookId, quantity };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to update quantity');
    }
  }
);

export const removeFromCartThunk = createAsyncThunk(
  'cart/removeFromCart',
  async (bookId, { rejectWithValue }) => {
    try {
      const res = await apiRemoveFromCart(bookId);
      if (!res?.success) return rejectWithValue(res?.message || 'Failed to remove from cart');
      return { bookId };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to remove from cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Keep clearCart for local state resets (e.g., on logout)
    clearCart: (state) => {
      state.data = [];
      state.loading = false;
      state.error = null;
    },
    // Optional direct setter for hydration or bulk replace
    setCart: (state, action) => {
      state.data = action.payload || [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to fetch cart';
      })
      // addToCart
      .addCase(addToCartThunk.pending, (state, action) => {
        state.error = null;
        const { bookId } = action.meta.arg;
        if (!state.addingIds.includes(bookId)) state.addingIds.push(bookId);
      })
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        const { bookId, quantity } = action.payload;
        const providedBook = action.meta?.arg?.book;
        const existing = state.data.find((i) => i.book?._id === bookId);
        if (existing) {
          existing.quantity += quantity || 1;
        } else {
          // Use provided full book (if available) to keep UI consistent; fall back to minimal shape
          state.data.push({ book: providedBook || { _id: bookId }, quantity: quantity || 1 });
        }
        state.addingIds = state.addingIds.filter((id) => id !== bookId);
      })
      .addCase(addToCartThunk.rejected, (state, action) => {
        state.error = action.payload || 'Unable to add to cart';
        const { bookId } = action.meta.arg;
        state.addingIds = state.addingIds.filter((id) => id !== bookId);
      })
      // updateCartQuantity
      .addCase(updateCartQuantityThunk.pending, (state, action) => {
        state.error = null;
        const { bookId } = action.meta.arg;
        if (!state.updatingIds.includes(bookId)) state.updatingIds.push(bookId);
      })
      .addCase(updateCartQuantityThunk.fulfilled, (state, action) => {
        const { bookId, quantity } = action.payload;
        const item = state.data.find((i) => i.book?._id === bookId);
        if (item) item.quantity = quantity;
        state.updatingIds = state.updatingIds.filter((id) => id !== bookId);
      })
      .addCase(updateCartQuantityThunk.rejected, (state, action) => {
        state.error = action.payload || 'Unable to update quantity';
        const { bookId } = action.meta.arg;
        state.updatingIds = state.updatingIds.filter((id) => id !== bookId);
      })
      // removeFromCart
      .addCase(removeFromCartThunk.pending, (state, action) => {
        state.error = null;
        const bookId = action.meta.arg;
        if (!state.removingIds.includes(bookId)) state.removingIds.push(bookId);
      })
      .addCase(removeFromCartThunk.fulfilled, (state, action) => {
        const { bookId } = action.payload;
        state.data = state.data.filter((i) => i.book?._id !== bookId);
        state.removingIds = state.removingIds.filter((id) => id !== bookId);
      })
      .addCase(removeFromCartThunk.rejected, (state, action) => {
        state.error = action.payload || 'Unable to remove from cart';
        const bookId = action.meta.arg;
        state.removingIds = state.removingIds.filter((id) => id !== bookId);
      });
  },
});

export const { clearCart, setCart } = cartSlice.actions;

export default cartSlice.reducer;