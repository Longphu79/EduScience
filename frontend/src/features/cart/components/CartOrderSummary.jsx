import Button from "../../../shared/components/Button";
import { formatPrice } from "../utils/cart.helpers";
import "../styles/cart-components.css";

export default function CartOrderSummary({
  courseCount,
  totalItems,
  subtotal,
  checkingOut,
  onCheckout,
  onBrowseCourses,
  disabled,
}) {
  return (
    <aside className="cart-order-summary">
      <h3 className="cart-order-summary__title">Order summary</h3>

      <div className="cart-order-summary__stats">
        <div className="cart-order-summary__row">
          <span>Số khóa học</span>
          <span className="cart-order-summary__value">{courseCount}</span>
        </div>

        <div className="cart-order-summary__row">
          <span>Tổng số lượng</span>
          <span className="cart-order-summary__value">{totalItems}</span>
        </div>

        <div className="cart-order-summary__divider" />

        <div className="cart-order-summary__row cart-order-summary__row--total">
          <span>Tổng tiền</span>
          <span className="cart-order-summary__price">
            {formatPrice(subtotal)}
          </span>
        </div>
      </div>

      <div className="cart-order-summary__actions">
        <Button
          onClick={onCheckout}
          className="w-full"
          loading={checkingOut}
          disabled={disabled}
        >
          Checkout
        </Button>

        <button
          type="button"
          onClick={onBrowseCourses}
          className="cart-order-summary__secondary-btn"
        >
          Thêm khóa học khác
        </button>
      </div>

      <div className="cart-order-summary__note">
        <p className="cart-order-summary__note-title">Quy tắc hiện tại</p>
        <p className="cart-order-summary__note-text">
          Khóa miễn phí enroll trực tiếp. Khóa trả phí phải thêm vào giỏ hàng và
          checkout xong mới vào khóa học.
        </p>
      </div>
    </aside>
  );
}