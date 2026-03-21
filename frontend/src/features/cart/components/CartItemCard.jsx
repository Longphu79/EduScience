import { Link } from "react-router-dom";
import {
  formatPrice,
  getCourseDescription,
  getCourseId,
  getCoursePrice,
  getCourseThumbnail,
  getCourseTitle,
} from "../utils/cart.helpers";
import "../styles/cart-components.css";

export default function CartItemCard({
  item,
  isProcessing = false,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  const course = item?.course || {};
  const quantity = Number(item?.quantity || 1);
  const price = getCoursePrice(course);
  const courseId = getCourseId(course);

  return (
    <div className="cart-item-card">
      <div className="cart-item-card__layout">
        <div className="cart-item-card__media">
          <img
            src={getCourseThumbnail(course)}
            alt={getCourseTitle(course)}
            className="cart-item-card__image"
          />
        </div>

        <div className="cart-item-card__body">
          <div className="cart-item-card__top">
            <div className="cart-item-card__content">
              <div className="cart-item-card__badges">
                {course?.category ? (
                  <span className="cart-item-card__badge cart-item-card__badge--category">
                    {course.category}
                  </span>
                ) : null}

                {course?.level ? (
                  <span className="cart-item-card__badge cart-item-card__badge--level">
                    {course.level}
                  </span>
                ) : null}
              </div>

              <h2 className="cart-item-card__title">{getCourseTitle(course)}</h2>

              <p className="cart-item-card__description">
                {getCourseDescription(course)}
              </p>
            </div>

            <div className="cart-item-card__price-block">
              <div className="cart-item-card__price-label">Tạm tính</div>
              <div className="cart-item-card__price">
                {formatPrice(price * quantity)}
              </div>

              {Number(course?.salePrice) > 0 &&
              Number(course?.price) > Number(course?.salePrice) ? (
                <div className="cart-item-card__price-old">
                  {formatPrice(Number(course?.price) * quantity)}
                </div>
              ) : null}
            </div>
          </div>

          <div className="cart-item-card__stats">
            <div>
              <div className="cart-item-card__stat-label">Quantity</div>
              <div className="cart-item-card__quantity">
                <button
                  type="button"
                  onClick={() => onDecrease?.(courseId, quantity)}
                  disabled={isProcessing || quantity <= 1 || !courseId}
                  className="cart-item-card__quantity-btn"
                >
                  -
                </button>

                <span className="cart-item-card__quantity-value">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => onIncrease?.(courseId, quantity)}
                  disabled={isProcessing || !courseId}
                  className="cart-item-card__quantity-btn"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <div className="cart-item-card__stat-label">Unit price</div>
              <div className="cart-item-card__stat-value">
                {formatPrice(price)}
              </div>
            </div>

            <div>
              <div className="cart-item-card__stat-label">Lessons</div>
              <div className="cart-item-card__stat-value">
                {course?.totalLessons || 0}
              </div>
            </div>
          </div>

          <div className="cart-item-card__actions">
            {courseId ? (
              <Link
                to={`/courses/${courseId}`}
                className="cart-item-card__link"
              >
                Xem chi tiết
              </Link>
            ) : (
              <span className="cart-item-card__link cart-item-card__link--disabled">
                Xem chi tiết
              </span>
            )}

            <button
              type="button"
              onClick={() => onRemove?.(courseId)}
              disabled={isProcessing || !courseId}
              className="cart-item-card__remove"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}