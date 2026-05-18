import { setAuth, clearAuth } from '../store/slices/authSlice';
import { getCurrentUser } from '../services/auth.services';
import store from '../store';

const verifyAuth = async () => {
  try {
    const res = await getCurrentUser();
    const user = res?.data?.user || null;
    if (user) {
      store.dispatch(setAuth({ role: user.role }));
      return user.role || null;
    }
    store.dispatch(clearAuth());
    return null;
  } catch (err) {
    store.dispatch(clearAuth());
    return null;
  }
};

export default verifyAuth;
