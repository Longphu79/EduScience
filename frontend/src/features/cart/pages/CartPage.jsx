import { useState } from "react";
import { useAuth } from "../../auth/state/useAuth";
import useCartPage from "../hooks/useCartPage";
import CartItemCard from "../components/CartItemCard";
import CartOrderSummary from "../components/CartOrderSummary";
import CartEmptyState from "../components/CartEmptyState";
import CartLoginPrompt from "../components/CartLoginPrompt";
import Toast from "../../../shared/components/Toast";
import { useNavigate } from "react-router-dom";
import { createCheckout } from "../../checkout/api/checkoutApi";

export default function CartPage() {
    const { isAuthenticated } = useAuth();
    const cartPage = useCartPage();
    const navigate = useNavigate();

    // State để quản lý trạng thái loading khi nhấn nút thanh toán
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    if (!isAuthenticated) {
        return <CartLoginPrompt onLogin={() => navigate("/auth/login")} />;
    }

    if (!cartPage.items || !cartPage.items.length) {
        return <CartEmptyState onBrowseCourses={() => navigate("/courses")} />;
    }

    // Trong CartPage.jsx
    const handleCheckout = async () => {
        setIsCheckingOut(true); // BẬT trạng thái loading
        try {
            const result = await createCheckout();
            const orderId = result.data?.orderId || result.orderId;

            if (orderId) {
                navigate(`/checkout/${orderId}`);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Lỗi tạo đơn hàng");
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="cart-page">
            {cartPage.toast && (
                <Toast
                    message={cartPage.toast}
                    onClose={() => cartPage.setToast(null)}
                />
            )}

            <div className="cart-page__layout">
                <div className="cart-page__items">
                    {cartPage.items.map((item) => {
                        const id = item.course._id;
                        return (
                            <CartItemCard
                                key={id}
                                item={item}
                                isProcessing={cartPage.processing.includes(id)}
                                onIncrease={cartPage.increase}
                                onDecrease={cartPage.decrease}
                                onRemove={cartPage.remove}
                            />
                        );
                    })}
                </div>

                {/* SỬA CHỖ NÀY: Truyền đúng hàm và state đã khai báo ở trên */}
                <CartOrderSummary
                    courseCount={cartPage.items.length}
                    totalItems={cartPage.totalItems}
                    subtotal={cartPage.subtotal}
                    checkingOut={isCheckingOut} // Dùng state cục bộ
                    onCheckout={handleCheckout} // Dùng hàm handleCheckout vừa viết
                    onBrowseCourses={() => navigate("/courses")}
                />
            </div>
        </div>
    );
}
