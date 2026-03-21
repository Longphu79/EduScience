import { useAuth } from "../../auth/state/useAuth";
import useCartPage from "../hooks/useCartPage";
import CartItemCard from "../components/CartItemCard";
import CartOrderSummary from "../components/CartOrderSummary";
import CartEmptyState from "../components/CartEmptyState";
import CartLoginPrompt from "../components/CartLoginPrompt";
import Toast from "../../../shared/components/Toast";

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const cartPage = useCartPage();

  if (!isAuthenticated) {
    return <CartLoginPrompt onLogin={() => cartPage.navigate("/auth/login")} />;
  }

  if (!cartPage.items.length) {
    return <CartEmptyState onBrowseCourses={() => cartPage.navigate("/courses")} />;
  }

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

        <CartOrderSummary
          courseCount={cartPage.items.length}
          totalItems={cartPage.totalItems}
          subtotal={cartPage.subtotal}
          checkingOut={cartPage.checkingOut}
          onCheckout={cartPage.checkout}
          onBrowseCourses={() => cartPage.navigate("/courses")}
        />
      </div>
    </div>
  );
}