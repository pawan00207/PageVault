import { useDispatch, useSelector } from 'react-redux';

// Base hooks
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export const useAuth = () => {
  return useSelector((state) => state.auth);
};

export const useUser = () => {
  return useSelector((state) => state.user);
};

export const useCart = () => {
  const slice = useSelector((state) => state.cart) || {};
  const {
    data = [],
    loading = false,
    error = null,
    addingIds = [],
    updatingIds = [],
    removingIds = [],
  } = slice;
  const items = Array.isArray(data) ? data : [];
  return {
    items,
    loading,
    error,
    addingIds,
    updatingIds,
    removingIds,
    totalItems: items.reduce((sum, item) => sum + (item?.quantity || 0), 0),
    isEmpty: items.length === 0,
    isAdding: (bookId) => addingIds.includes(bookId),
    isUpdating: (bookId) => updatingIds.includes(bookId),
    isRemoving: (bookId) => removingIds.includes(bookId),
  };
};

export const useWishlist = () => {
  const slice = useSelector((state) => state.wishlist) || {};
  const {
    data = [],
    loading = false,
    error = null,
    addingIds = [],
    removingIds = [],
  } = slice;
  const items = Array.isArray(data) ? data : [];
  return {
    items,
    loading,
    error,
    count: items.length,
    isEmpty: items.length === 0,
    isAdding: (bookId) => addingIds.includes(bookId),
    isRemoving: (bookId) => removingIds.includes(bookId),
  };
};
