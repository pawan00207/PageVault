//client/src/pages/buyer/cart/Cart.jsx
import React, { useMemo, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from 'react-redux';
import { fetchCart, updateCartQuantityThunk, removeFromCartThunk, addToCartThunk } from '../../../store/slices/cartSlice';
import { removeFromWishlistThunk } from '../../../store/slices/wishlistSlice';
import { useCart, useWishlist } from '../../../store/hooks';
import StarRating from "../components/StarRating.jsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/AlertDialog";

// Skeleton for Cart/Wishlist items
const SkeletonCard = () => (
  <div className="flex items-center p-6 space-x-4 bg-white rounded-xl shadow-md skeleton-shimmer animate-fade-in">
    <div className="w-24 h-32 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg" />
    <div className="flex-1 space-y-2 py-1">
      <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-1/2"></div>
      <div className="h-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded w-1/4"></div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-4 w-16 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded"></div>
        <div className="h-7 w-7 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

// Skeleton for Order Summary
const SkeletonOrderSummary = () => (
  <div className="sticky top-24 overflow-hidden bg-white rounded-xl shadow-lg animate-pulse">
    <div className="p-6 border-b border-gray-300">
      <div className="h-6 w-40 bg-gray-200 rounded mb-2"></div>
    </div>
    <div className="p-6 space-y-4">
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="pt-4 border-t border-gray-300 flex justify-between">
        <div className="h-5 w-24 bg-gray-200 rounded"></div>
        <div className="h-5 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="h-10 w-full bg-gray-200 rounded mt-4"></div>
    </div>
  </div>
);

const Cart = () => {
  const dispatch = useDispatch();
  const { items: cartItems, loading, error, isAdding, isUpdating, isRemoving } = useCart();
  const { items: wishlistItems, isRemoving: isWishlistRemoving } = useWishlist();
  const navigate = useNavigate();
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [bookToRemove, setBookToRemove] = useState(null);

  // Sync cart with backend on mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Calculate totals
  const cartTotals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.book?.price || 0) * item.quantity, 0);
    const shipping = subtotal > 35 || !cartItems.length ? 0 : 100;
    const tax = subtotal * 0.02;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  }, [cartItems]);

  const handleQuantityChange = (bookId, newQuantity) => {
    if (newQuantity < 1) return;
    const cartItem = cartItems.find(item => item.book._id === bookId);
    const availableStock = cartItem?.book?.quantity || 0;
    if (newQuantity > availableStock) {
      toast.warning(`Only ${availableStock} items available in stock!`);
      return;
    }
    dispatch(updateCartQuantityThunk({ bookId, quantity: newQuantity }))
      .unwrap()
      .catch((e) => {
        toast.error(typeof e === 'string' ? e : 'Failed to update quantity');
      });
  };

  const handleRemoveFromCart = (bookId) => {
    setBookToRemove(bookId);
    setShowRemoveDialog(true);
  };

  const confirmRemoveFromCart = () => {
    if (!bookToRemove) return;
    setShowRemoveDialog(false);
    dispatch(removeFromCartThunk(bookToRemove))
      .unwrap()
      .then(() => toast.success('Item removed from cart'))
      .catch((e) => toast.error(typeof e === 'string' ? e : 'Error removing item'))
      .finally(() => setBookToRemove(null));
  };

  const handleAddToCartFromWishlist = (bookId) => {
    const bookToAdd = wishlistItems.find(item => item._id === bookId);
    if (!bookToAdd) return;
    if (bookToAdd.quantity <= 0) {
      toast.error("This book is out of stock!");
      return;
    }
    const isAlreadyInCart = cartItems.some(item => item.book?._id === bookId);
    if (isAlreadyInCart) {
      toast.info("Book is already in your cart!");
      return;
    }
    dispatch(addToCartThunk({ bookId, quantity: 1, book: bookToAdd }))
      .unwrap()
      .then(() => toast.success('Book added to cart successfully!'))
      .catch((e) => toast.error(typeof e === 'string' ? e : 'Failed to add to cart'));
  };

  const handleRemoveFromWishlist = (bookId) => {
    dispatch(removeFromWishlistThunk(bookId))
      .unwrap()
      .then(() => toast.success('Removed from wishlist'))
      .catch((e) => toast.error(typeof e === 'string' ? e : 'Failed to remove from wishlist'));
  };

  const hasOutOfStockItems = useMemo(() => {
    return cartItems.some(item => item.book?.quantity <= 0);
  }, [cartItems]);

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.warning("Your cart is empty");
      return;
    }
    if (hasOutOfStockItems) {
      toast.warning("Some items in your cart are out of stock. Please remove them before proceeding to checkout.");
      return;
    }
    navigate("/buyer/checkout");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="pt-16">
        <div className="max-w-7xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col gap-8 lg:flex-row">
              <div className="lg:w-2/3 space-y-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <SkeletonCard key={`cart-skeleton-${idx}`} />
                ))}
                {Array.from({ length: 2 }).map((_, idx) => (
                  <SkeletonCard key={`wishlist-skeleton-${idx}`} />
                ))}
              </div>
              <div className="lg:w-1/3">
                <SkeletonOrderSummary />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8 lg:flex-row">
              {error && (
                <div className="w-full p-3 mb-2 bg-red-50 border border-red-200 text-red-700 rounded">
                  {error}
                </div>
              )}
              {/* Cart Section */}
              <div className="lg:w-2/3">
                <div className="overflow-hidden bg-white rounded-xl shadow-lg">
                  <div className="p-6 border-b border-gray-300">
                    <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
                    <p id="cart-count-text" className="mt-1 text-gray-500">
                      You have {cartItems.length} items in your cart
                    </p>
                  </div>
                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12">
                      <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
                      <p className="text-gray-500 text-center mb-4">
                        Some items may have been removed because they're no longer available
                      </p>
                      <button
                        onClick={() => navigate("/buyer/dashboard")}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  ) : (
                    <div id="cart-items" className="divide-y divide-gray-300">
                      {cartItems.map((item, idx) => (
                        <div
                          key={"cart" + item._id + idx}
                          className="flex items-center p-6 space-x-4 cart-item"
                          data-book-id={item.book._id}
                        >
                          <img
                            src={item.book.image}
                            alt={item.book.title}
                            className="object-contain w-24 h-32 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => navigate(`/buyer/product-detail/${item.book._id}`)}
                          />
                          <div className="flex-1">
                            <h3 
                              className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors"
                              onClick={() => navigate(`/buyer/product-detail/${item.book._id}`)}
                            >
                              {item.book.title}
                            </h3>
                            <p className="text-gray-600">by {item.book.author}</p>
                            <div className="flex items-center mt-2">
                              <StarRating rating={item.book?.rating || 0} showValue={true} />
                            </div>
                            {item.book?.quantity <= 0 && (
                              <div className="mt-2 px-2 py-1 bg-red-100 border border-red-300 rounded inline-block">
                                <span className="text-red-700 text-sm font-semibold">
                                  <i className="fas fa-exclamation-circle mr-1"></i>
                                  Out of Stock - Remove to checkout
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <div>
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                  type="button"
                                  className={`px-3 py-1 text-gray-600 hover:text-purple-600 decrement-btn ${isUpdating(item.book._id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  data-book-id={item.book._id}
                                  disabled={isUpdating(item.book._id)}
                                  onClick={() => handleQuantityChange(item.book._id, item.quantity - 1)}
                                >
                                  {isUpdating(item.book._id) ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-minus"></i>} 
                                </button>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  min="1"
                                  max={item.book.quantity}
                                  className="w-12 text-center border-x border-gray-300 focus:outline-none focus:ring-0 quantity-input disabled:opacity-50"
                                  data-book-id={item.book._id}
                                  disabled={isUpdating(item.book._id)}
                                  onChange={(e) => handleQuantityChange(item.book._id, parseInt(e.target.value))}
                                />
                                <button
                                  type="button"
                                  className={`px-3 py-1 text-gray-600 hover:text-purple-600 increment-btn ${isUpdating(item.book._id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  data-book-id={item.book._id}
                                  disabled={isUpdating(item.book._id)}
                                  onClick={() => handleQuantityChange(item.book._id, item.quantity + 1)}
                                >
                                  {isUpdating(item.book._id) ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-plus"></i>} 
                                </button>
                              </div>
                              <p className={`text-xs mt-1 text-center ${item.quantity === item.book.quantity ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
                                {item.book.quantity} left in stock
                              </p>
                            </div>                        
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900 unit-price" data-unit-price={item.book.price}>
                                ₹{item.book.price}
                              </p>
                              <p className="text-sm text-gray-600">
                                Item total: ₹<span className="line-total">{(item.book.price * item.quantity).toFixed(2)}</span>
                              </p>
                              <button
                                type="button"
                                className={`text-sm remove-from-cart-btn ${isRemoving(item.book._id) ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:text-red-600'}`}
                                data-book-id={item.book._id}
                                disabled={isRemoving(item.book._id)}
                                onClick={() => handleRemoveFromCart(item.book._id)}
                              >
                                {isRemoving(item.book._id) ? 'Removing...' : 'Remove'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Wishlist Section */}
                <div id="wishlist-section" className="mt-8 overflow-hidden bg-white rounded-xl shadow-lg">
                  <div className="p-6 border-b border-gray-300">
                    <h2 className="text-2xl font-bold text-gray-900">Wishlist</h2>
                    <p className="mt-1 text-gray-500">You have {wishlistItems.length} items in your wishlist</p>
                  </div>
                  {wishlistItems.length === 0 ? null : (
                    <div className="divide-y">
                      {wishlistItems.map((item, idx) => (
                        <div
                          key={"wishlist" + item._id + idx}
                          className="flex items-center p-6 space-x-4 wishlist-item border-b border-gray-300"
                          data-book-id={item._id}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="object-contain w-24 h-32 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => navigate(`/buyer/product-detail/${item._id}`)}
                          />
                          <div className="flex-1">
                            <h3 
                              className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors"
                              onClick={() => navigate(`/buyer/product-detail/${item._id}`)}
                            >
                              {item.title}
                            </h3>
                            <p className="text-gray-600">by {item.author}</p>
                            <div className="flex items-center mt-2">
                              <StarRating rating={item.rating || 0} showValue={true} />
                            </div>
                          </div>
                          <div className="space-y-2 text-right">
                            <p className="text-lg font-bold text-gray-900">₹{item.price}</p>
                            {item.quantity <= 0 ? (
                              <div>
                                <button
                                  type="button"
                                  className="w-full px-4 py-2 text-white bg-gray-400 rounded-lg cursor-not-allowed"
                                  disabled
                                >
                                  Out of Stock
                                </button>
                              </div>
                            ) : (() => {
                              const isInCart = cartItems.some(cartItem => cartItem.book?._id === item._id);
                              return (
                                <button
                                  type="button"
                                  className={`w-full px-4 py-2 text-white transition-colors rounded-lg add-to-cart-btn ${
                                    isInCart
                                      ? 'bg-gray-400 cursor-not-allowed'
                                      : isAdding(item._id)
                                        ? 'bg-purple-400 cursor-not-allowed'
                                        : 'bg-purple-600 hover:bg-purple-700'
                                  }`}
                                  onClick={() => handleAddToCartFromWishlist(item._id)}
                                  disabled={isInCart || isAdding(item._id)}
                                >
                                  {isInCart ? 'In Cart' : isAdding(item._id) ? 'Adding...' : 'Add to Cart'}
                                </button>
                              );
                            })()}
                            <button
                              className={`text-sm remove-from-wishlist-btn ${isWishlistRemoving(item._id) ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:text-red-600'}`}
                              onClick={() => handleRemoveFromWishlist(item._id)}
                              disabled={isWishlistRemoving(item._id)}
                            >
                              {isWishlistRemoving(item._id) ? 'Removing...' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:w-1/3">
                <div className="sticky top-24 overflow-hidden bg-white rounded-xl shadow-lg">
                  <div className="p-6 border-b border-gray-300">
                    <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                  </div>
                  <div
                    id="order-summary"
                    className="p-6 space-y-4"
                    data-tax-rate={cartTotals.subtotal > 0 ? cartTotals.tax / cartTotals.subtotal : 0}
                    data-shipping-charge="35"
                    data-shipping-threshold="35"
                  >
                    <div className="flex justify-between text-gray-600">
                      <span>
                        Subtotal (<span id="summary-count">{cartItems.length}</span> items)
                      </span>
                      <span id="summary-subtotal">₹{cartTotals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span id="summary-shipping">₹{cartTotals.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span id="summary-tax">₹{cartTotals.tax.toFixed(2)}</span>
                    </div>
                    <div className="pt-4 border-t border-gray-300">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span id="summary-total">₹{cartTotals.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {hasOutOfStockItems && (
                      <div className="p-3 mb-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start">
                          <i className="fas fa-exclamation-triangle text-red-600 mt-1 mr-2"></i>
                          <span className="text-red-700 text-sm">
                            Some items in your cart are out of stock. Remove them to proceed to checkout.
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      id="checkout-button"
                      className="w-full px-6 py-3 mt-4 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                      onClick={handleProceedToCheckout}
                      disabled={cartItems.length === 0 || hasOutOfStockItems}
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Remove Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to remove this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You will have to add the item again if you remove it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveFromCart}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Cart;
