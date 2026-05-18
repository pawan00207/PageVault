import { setAuth } from "../store/slices/authSlice.js";
import { setUser } from "../store/slices/userSlice.js";
import { setCart } from "../store/slices/cartSlice.js";
import { setWishlist } from "../store/slices/wishlistSlice.js";

export const applyAuthSession = (dispatch, userData, { rememberMe = false } = {}) => {
  dispatch(setAuth({ role: userData.role }));
  dispatch(setUser({ ...userData }));
  dispatch(setCart(userData.cart || []));
  dispatch(setWishlist(userData.wishlist || []));

  if (rememberMe) {
    localStorage.setItem("rememberMe", "true");
  }
};

export default applyAuthSession;