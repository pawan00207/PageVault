import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCart as apiGetCart,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
} from '../../services/buyer.services';

// Shape: { data: Book[], loading: boolean, error: string|null, addingIds: string[], removingIds: string[] }
const initialState = {
  data: [],
  loading: false,
  error: null,
  addingIds: [],
  removingIds: [],
};

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, { rejectWithValue }) => {
  try {
    const res = await apiGetCart(); // Reuse cart endpoint to pull wishlist
    if (!res?.success) return rejectWithValue(res?.message || 'Failed to fetch wishlist');
    return res?.data?.wishlist || [];
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to fetch wishlist');
  }
});

export const addToWishlistThunk = createAsyncThunk(
  'wishlist/addToWishlist',
  async ({ bookId }, { rejectWithValue }) => {
    try {
      const res = await apiAddToWishlist(bookId);
      if (!res?.success) return rejectWithValue(res?.message || 'Failed to add to wishlist');
      return { bookId };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlistThunk = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (bookId, { rejectWithValue }) => {
    try {
      const res = await apiRemoveFromWishlist(bookId);
      if (!res?.success) return rejectWithValue(res?.message || 'Failed to remove from wishlist');
      return { bookId };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to remove from wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.data = [];
      state.loading = false;
      state.error = null;
      state.addingIds = [];
      state.removingIds = [];
    },
    setWishlist: (state, action) => {
      state.data = action.payload || [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload || [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to fetch wishlist';
      })
      .addCase(addToWishlistThunk.pending, (state, action) => {
        const { bookId } = action.meta.arg;
        if (!state.addingIds.includes(bookId)) state.addingIds.push(bookId);
      })
      .addCase(addToWishlistThunk.fulfilled, (state, action) => {
        const { bookId } = action.payload;
        const providedBook = action.meta?.arg?.book;
        const exists = state.data.find((b) => b._id === bookId);
        if (!exists) {
          state.data.push(providedBook || { _id: bookId });
        }
        state.addingIds = state.addingIds.filter((id) => id !== bookId);
      })
      .addCase(addToWishlistThunk.rejected, (state, action) => {
        const { bookId } = action.meta.arg;
        state.error = action.payload || 'Unable to add to wishlist';
        state.addingIds = state.addingIds.filter((id) => id !== bookId);
      })
      .addCase(removeFromWishlistThunk.pending, (state, action) => {
        const bookId = action.meta.arg;
        if (!state.removingIds.includes(bookId)) state.removingIds.push(bookId);
      })
      .addCase(removeFromWishlistThunk.fulfilled, (state, action) => {
        const { bookId } = action.payload;
        state.data = state.data.filter((b) => b._id !== bookId);
        state.removingIds = state.removingIds.filter((id) => id !== bookId);
      })
      .addCase(removeFromWishlistThunk.rejected, (state, action) => {
        const bookId = action.meta.arg;
        state.error = action.payload || 'Unable to remove from wishlist';
        state.removingIds = state.removingIds.filter((id) => id !== bookId);
      });
  },
});

export const { clearWishlist, setWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;
