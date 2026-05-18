import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import backendReducer from './slices/backendSlice';

const PERSIST_KEY = 'publishelf_state_v1';

const loadState = () => {
  try {
    const serializedState = localStorage.getItem(PERSIST_KEY);
    if (!serializedState) return undefined; 

    const parsed = JSON.parse(serializedState);
    let cartState = parsed.cart ?? undefined;
    if (cartState && !('data' in cartState) && Array.isArray(cartState.items)) {
      cartState = {
        data: cartState.items,
        loading: false,
        error: null,
        addingIds: [],
        updatingIds: [],
        removingIds: [],
      };
    }

    if (cartState && 'data' in cartState) {
      cartState.addingIds = Array.isArray(cartState.addingIds) ? cartState.addingIds : [];
      cartState.updatingIds = Array.isArray(cartState.updatingIds) ? cartState.updatingIds : [];
      cartState.removingIds = Array.isArray(cartState.removingIds) ? cartState.removingIds : [];
    }

    let wishlistState = parsed.wishlist ?? undefined;
    if (wishlistState && !('data' in wishlistState) && Array.isArray(wishlistState.items)) {
      wishlistState = {
        data: wishlistState.items,
        loading: false,
        error: null,
        addingIds: [],
        removingIds: [],
      };
    }
    if (wishlistState && 'data' in wishlistState) {
      wishlistState.addingIds = Array.isArray(wishlistState.addingIds) ? wishlistState.addingIds : [];
      wishlistState.removingIds = Array.isArray(wishlistState.removingIds) ? wishlistState.removingIds : [];
    }
    return {
      user: parsed.user ?? undefined,
      cart: cartState,
      wishlist: wishlistState,
    };
  } catch (e) {
    console.warn('Failed to load persisted state:', e);
    return undefined;
  }
};

const saveState = (state) => {
  try {
    const toPersist = {
      user: state.user,
      cart: state.cart,
      wishlist: state.wishlist,
    };
    localStorage.setItem(PERSIST_KEY, JSON.stringify(toPersist));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
};

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    backend: backendReducer,
  },
  preloadedState,
});

store.subscribe(() => saveState(store.getState()));

export default store;
