import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCheckoutInfo,
  getPaymentStatus,
} from "../../features/checkout/api/checkoutApi";

const CheckoutPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("pending");
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);
  const timerRef = useRef(null);

  // Load order info
  useEffect(() => {
    getCheckoutInfo(orderId)
      .then((data) => {
        setOrder(data);
        setStatus(data.status);
        const remaining = Math.max(
          0,
          Math.floor((new Date(data.expiredAt) - Date.now()) / 1000)
        );
        setTimeLeft(remaining);
      })
      .catch((err) => setError(err.message));
  }, [orderId]);

  // Countdown timer
  useEffect(() => {
    if (status !== "pending" || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setStatus("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [status, timeLeft > 0]);

  // Poll payment status
  useEffect(() => {
    if (status !== "pending") return;

    pollingRef.current = setInterval(async () => {
      try {
        const data = await getPaymentStatus(orderId);
        if (data.status === "paid") {
          setStatus("paid");
          clearInterval(pollingRef.current);
          clearInterval(timerRef.current);
        } else if (data.status === "expired") {
          setStatus("expired");
          clearInterval(pollingRef.current);
          clearInterval(timerRef.current);
        }
      } catch {
        // Ignore polling errors
      }
    }, 3000);

    return () => clearInterval(pollingRef.current);
  }, [status, orderId]);

  // Redirect after paid
  useEffect(() => {
    if (status === "paid") {
      const timeout = setTimeout(() => navigate("/courses"), 3000);
      return () => clearTimeout(timeout);
    }
  }, [status, navigate]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">Loading...</div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      {/* PAID */}
      {status === "paid" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="text-5xl mb-4">&#10003;</div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            You are now enrolled. Redirecting...
          </p>
        </div>
      )}

      {/* EXPIRED */}
      {status === "expired" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-2">
            Payment Expired
          </h1>
          <p className="text-gray-600 mb-4">
            The QR code has expired. Please try again.
          </p>
          <button
            onClick={() => navigate("/cart")}
            className="bg-black text-white px-6 py-2 rounded"
          >
            Back to Cart
          </button>
        </div>
      )}

      {/* PENDING - QR */}
      {status === "pending" && (
        <div className="bg-white shadow rounded-xl p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Scan to Pay
          </h1>

          {/* QR Code */}
          <div className="flex justify-center mb-4">
            <img
              src={order.qrUrl}
              alt="QR Payment"
              className="w-64 h-64 border rounded"
            />
          </div>

          {/* Info */}
          <div className="space-y-2 text-center mb-4">
            <p className="text-2xl font-bold">
              {order.totalAmount.toLocaleString()} VND
            </p>
            <p className="text-sm text-gray-500">
              Order: {order.orderCode}
            </p>
            <p className="text-sm text-gray-500">
              Bank: MBBank | 5920188557982
            </p>
          </div>

          {/* Timer */}
          <div className="text-center">
            <p className="text-lg font-mono">
              Time remaining:{" "}
              <span
                className={timeLeft < 60 ? "text-red-500" : "text-gray-800"}
              >
                {formatTime(timeLeft)}
              </span>
            </p>
          </div>

          {/* Items */}
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold mb-2">Order Items:</h3>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{item.title}</span>
                <span>{item.price.toLocaleString()} VND</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
