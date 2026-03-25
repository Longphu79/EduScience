import Button from "../../../shared/components/Button";
import "../styles/cart-components.css";

export default function CartEmptyState({ onBrowseCourses }) {
  return (
    <div className="cart-empty-state">
      <div className="cart-empty-state__icon">🛒</div>
      <h2 className="cart-empty-state__title">Giỏ hàng đang trống</h2>
      <p className="cart-empty-state__text">
        Hãy thêm một vài khóa học trả phí để bắt đầu hành trình học tập của bạn.
      </p>
      <div className="cart-empty-state__actions">
        <Button onClick={onBrowseCourses}>Xem khóa học</Button>
      </div>
    </div>
  );
}