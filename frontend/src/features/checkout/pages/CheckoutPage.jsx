import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCheckoutInfo, getPaymentStatus } from "../api/checkoutApi.js";

const CheckoutPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState("pending");
    const [timeLeft, setTimeLeft] = useState(0);
    const [error, setError] = useState(null);

    // Sử dụng ref để quản lý ID của các bộ đếm, tránh trùng lặp
    const pollingRef = useRef(null);
    const timerRef = useRef(null);

    // 1. Lấy thông tin đơn hàng khi vào trang
    useEffect(() => {
        getCheckoutInfo(orderId)
            .then((res) => {
                // Axios trả về dữ liệu trong res.data
                const data = res.data || res;
                setOrder(data);
                setStatus(data.status);

                // Tính thời gian còn lại dựa trên expiredAt từ server
                const remaining = Math.max(
                    0,
                    Math.floor((new Date(data.expiredAt) - Date.now()) / 1000),
                );
                setTimeLeft(remaining);
            })
            .catch((err) => {
                console.error("Fetch order error:", err);
                setError("Không thể tải thông tin đơn hàng.");
            });
    }, [orderId]);

    // 2. Logic Bộ đếm ngược (Timer)
    useEffect(() => {
        // Nếu không còn ở trạng thái chờ hoặc hết thời gian thì dừng timer
        if (status !== "pending" || timeLeft <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setStatus("expired");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [status, timeLeft > 0]);

    // 3. Logic Polling - Hỏi Server xem đã trả tiền chưa (QUAN TRỌNG)
    useEffect(() => {
        // Chỉ hỏi server khi đơn hàng đang ở trạng thái 'pending'
        if (status !== "pending") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            return;
        }

        pollingRef.current = setInterval(async () => {
            try {
                const res = await getPaymentStatus(orderId);
                // Lấy status từ backend (Backend của bạn dùng 'completed')
                const currentStatus = res.data?.status || res.status;

                console.log("Checking payment status...", currentStatus);

                if (currentStatus === "completed" || currentStatus === "paid") {
                    setStatus("paid"); // Chuyển sang giao diện thành công
                    clearInterval(pollingRef.current);
                    if (timerRef.current) clearInterval(timerRef.current);
                } else if (currentStatus === "expired") {
                    setStatus("expired");
                    clearInterval(pollingRef.current);
                }
            } catch (err) {
                // Lỗi mạng hoặc server tạm thời thì bỏ qua để polling tiếp
                console.warn("Polling status failed, retrying...");
                console.error(err);
            }
        }, 3000); // 3 giây hỏi 1 lần

        return () => clearInterval(pollingRef.current);
    }, [status, orderId]);

    // 4. Tự động chuyển trang sau khi thanh toán thành công 3 giây
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

    if (error)
        return (
            <div className="max-w-lg mx-auto p-6 text-center text-red-500">
                {error}
            </div>
        );
    if (!order)
        return (
            <div className="max-w-lg mx-auto p-6 text-center">
                Đang tải đơn hàng...
            </div>
        );

    return (
        <div className="max-w-lg mx-auto p-6">
            {/* TRẠNG THÁI THÀNH CÔNG */}
            {status === "paid" && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-pulse">
                    <div className="text-5xl mb-4 text-green-500">&#10003;</div>
                    <h1 className="text-2xl font-bold text-green-700 mb-2">
                        Thanh toán thành công!
                    </h1>
                    <p className="text-gray-600">
                        Hệ thống đang kích hoạt khóa học của bạn. Đang chuyển
                        hướng...
                    </p>
                </div>
            )}

            {/* TRẠNG THÁI HẾT HẠN */}
            {status === "expired" && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                    <h1 className="text-2xl font-bold text-red-700 mb-2">
                        Đơn hàng hết hạn
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Mã QR đã hết hiệu lực. Vui lòng quay lại giỏ hàng.
                    </p>
                    <button
                        onClick={() => navigate("/cart")}
                        className="bg-black text-white px-6 py-2 rounded"
                    >
                        Quay lại Giỏ hàng
                    </button>
                </div>
            )}

            {/* TRẠNG THÁI CHỜ THANH TOÁN (HIỆN QR) */}
            {status === "pending" && (
                <div className="bg-white shadow-2xl rounded-xl p-6 border border-gray-100">
                    <h1 className="text-2xl font-bold mb-4 text-center">
                        Quét mã để thanh toán
                    </h1>

                    <div className="flex justify-center mb-6">
                        <img
                            src={order.qrUrl}
                            alt="QR Payment"
                            className="w-64 h-64 border-4 border-gray-50 rounded-lg shadow-sm"
                        />
                    </div>

                    <div className="space-y-3 text-center mb-6">
                        <p className="text-3xl font-extrabold text-blue-600">
                            {order.totalAmount?.toLocaleString()} VND
                        </p>
                        <div className="text-sm text-gray-500 bg-gray-50 py-2 rounded">
                            <p>
                                Nội dung:{" "}
                                <span className="font-bold text-gray-800">
                                    {order.orderCode}
                                </span>
                            </p>
                            <p>
                                Ngân hàng:{" "}
                                <span className="font-medium text-gray-800">
                                    MBBank | 5920188557982
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-700">
                            Thời gian còn lại:{" "}
                            <span
                                className={`font-mono font-bold ${timeLeft < 60 ? "text-red-500 animate-bounce" : ""}`}
                            >
                                {formatTime(timeLeft)}
                            </span>
                        </p>
                    </div>

                    <div className="mt-6 border-t pt-4">
                        <h3 className="font-semibold mb-3 text-gray-700 text-left">
                            Chi tiết đơn hàng:
                        </h3>
                        {order.items?.map((item, i) => (
                            <div
                                key={i}
                                className="flex justify-between text-sm py-1"
                            >
                                <span className="text-gray-600">
                                    {item.title}
                                </span>
                                <span className="font-medium">
                                    {item.price?.toLocaleString()} VND
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;
