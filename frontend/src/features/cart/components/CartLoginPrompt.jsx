import Button from "../../../shared/components/Button";
import "../styles/cart-components.css";

export default function CartLoginPrompt({ onLogin }) {
  return (
    <div className="cart-login-prompt">
      <h1 className="cart-login-prompt__title">Giỏ hàng</h1>
      <p className="cart-login-prompt__text">
        Bạn cần đăng nhập để xem giỏ hàng.
      </p>
      <div className="cart-login-prompt__actions">
        <Button onClick={onLogin}>Đăng nhập</Button>
      </div>
    </div>
  );
}