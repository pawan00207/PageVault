import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.util.js";
import { useDispatch } from "react-redux";
import { clearCart } from "../../store/slices/cartSlice.js";

const SkeletonOrderDetails = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#eef7fb] to-white pt-20">
    <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 skeleton-shimmer animate-fade-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-full mx-auto mb-4" />
        <div className="h-8 w-64 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded mx-auto mb-2" />
        <div className="h-4 w-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded mx-auto" />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="h-6 w-32 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded mb-4" />
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
            <div className="h-4 w-32 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-28 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
            <div className="h-4 w-20 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
            <div className="h-4 w-24 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="h-5 w-32 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded mb-2" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
            <div className="h-3 w-3/4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
            <div className="h-3 w-1/2 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
          </div>
        </div>

        <div className="mt-4">
          <div className="h-5 w-24 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded mb-2" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-40 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
              <div className="h-3 w-16 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-3 w-36 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
              <div className="h-3 w-16 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <div className="flex-1 h-12 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg" />
        <div className="flex-1 h-12 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-lg" />
      </div>
    </div>
  </div>
);

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError("Invalid payment session");
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`/payments/stripe/session/${sessionId}`);
        if (response.data.success) {
          setOrder(response.data.data.order);
          dispatch(clearCart());
        } else {
          setError(response.data.message || "Payment verification failed");
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Error verifying payment");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, dispatch]);

  if (loading) {
    return <SkeletonOrderDetails />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#eef7fb] to-white pt-20">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-times-circle"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/buyer/checkout")}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#eef7fb] to-white pt-20">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-green-500 text-6xl mb-4">
            <i className="fas fa-check-circle"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600">Thank you for your purchase</p>
        </div>

        {order && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium text-gray-800">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className="font-medium text-green-600 capitalize">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium text-gray-800">₹{order.grandTotal?.toFixed(2)}</span>
              </div>
            </div>

            {order.deliveryAddress && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Delivery Address</h4>
                <p className="text-gray-600 text-sm">
                  {order.deliveryAddress.name}<br />
                  {order.deliveryAddress.address}<br />
                  Phone: {order.deliveryAddress.phone}
                </p>
              </div>
            )}

            {order.items && order.items.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Items ({order.items.length})</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.title} x {item.quantity}</span>
                      <span className="text-gray-800">₹{item.lineTotal?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate("/buyer/dashboard")}
            className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all duration-300"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate("/buyer/profile")}
            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all duration-300"
          >
            View Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
