import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import { useAuth } from "../../auth/state/useAuth";
import {
  getMyCart,
  cartUnwrap,
  removeCartItem,
  updateCartItemQuantity,
  clearCart,
  checkoutCart,
} from "../services/cart.service";

function formatPrice(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getCoursePrice(course) {
  if (!course) return 0;
  if (course.isFree) return 0;

  const salePrice = Number(course.salePrice);
  const price = Number(course.price);

  if (!Number.isNaN(salePrice) && salePrice > 0) {
    return salePrice;
  }

  return !Number.isNaN(price) ? price : 0;
}

function getCourseTitle(course) {
  return course?.title || "Khóa học";
}

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [processingIds, setProcessingIds] = useState([]);
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadCart() {
      try {
        if (!isAuthenticated) {
          if (isMounted) {
            setCart({ items: [] });
            setLoading(false);
          }
          return;
        }

        setLoading(true);
        const res = await getMyCart();
        const data = cartUnwrap(res);

        if (isMounted) {
          setCart(data || { items: [] });
        }
      } catch (error) {
        if (isMounted) {
          setToast({
            message: error?.message || "Không tải được giỏ hàng",
            kind: "error",
          });
          setCart({ items: [] });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCart();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const cartItems = useMemo(() => {
    return Array.isArray(cart?.items) ? cart.items : [];
  }, [cart]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const course = item?.course;
      const quantity = Number(item?.quantity || 0);
      return sum + getCoursePrice(course) * quantity;
    }, 0);
  }, [cartItems]);

  function startProcessing(id) {
    setProcessingIds((prev) => Array.from(new Set([...prev, String(id)])));
  }

  function stopProcessing(id) {
    setProcessingIds((prev) => prev.filter((item) => item !== String(id)));
  }

  async function handleIncrease(courseId, currentQty) {
    try {
      startProcessing(courseId);

      const res = await updateCartItemQuantity(
        courseId,
        Number(currentQty || 1) + 1
      );

      const data = cartUnwrap(res);
      setCart(data || { items: [] });

      setToast({
        message: "Đã tăng số lượng khóa học",
        kind: "success",
      });
    } catch (error) {
      setToast({
        message: error?.message || "Không thể tăng số lượng",
        kind: "error",
      });
    } finally {
      stopProcessing(courseId);
    }
  }

  async function handleDecrease(courseId, currentQty) {
    try {
      const nextQty = Number(currentQty || 1) - 1;

      if (nextQty < 1) return;

      startProcessing(courseId);

      const res = await updateCartItemQuantity(courseId, nextQty);
      const data = cartUnwrap(res);
      setCart(data || { items: [] });

      setToast({
        message: "Đã giảm số lượng khóa học",
        kind: "success",
      });
    } catch (error) {
      setToast({
        message: error?.message || "Không thể giảm số lượng",
        kind: "error",
      });
    } finally {
      stopProcessing(courseId);
    }
  }

  async function handleRemove(courseId) {
    try {
      startProcessing(courseId);

      const res = await removeCartItem(courseId);
      const data = cartUnwrap(res);
      setCart(data || { items: [] });

      setToast({
        message: "Đã xóa khóa học khỏi giỏ hàng",
        kind: "success",
      });
    } catch (error) {
      setToast({
        message: error?.message || "Không thể xóa khóa học",
        kind: "error",
      });
    } finally {
      stopProcessing(courseId);
    }
  }

  async function handleClearCart() {
    try {
      setLoading(true);

      const res = await clearCart();
      const data = cartUnwrap(res);
      setCart(data || { items: [] });

      setToast({
        message: "Đã xóa toàn bộ giỏ hàng",
        kind: "success",
      });
    } catch (error) {
      setToast({
        message: error?.message || "Không thể xóa toàn bộ giỏ hàng",
        kind: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout() {
    try {
      if (cartItems.length === 0) {
        setToast({
          message: "Giỏ hàng đang trống",
          kind: "error",
        });
        return;
      }

      setCheckingOut(true);

      const res = await checkoutCart();
      const payload = res?.data || res || {};
      const nextCart = payload?.cart || { items: [] };
      const totalPurchased = Number(payload?.totalPurchased || 0);

      setCart(nextCart);

      setToast({
        message:
          totalPurchased > 0
            ? `Thanh toán thành công ${totalPurchased} khóa học`
            : "Không có khóa học nào được thanh toán",
        kind: totalPurchased > 0 ? "success" : "error",
      });

      if (totalPurchased > 0) {
        setTimeout(() => {
          navigate("/my-courses");
        }, 700);
      }
    } catch (error) {
      setToast({
        message: error?.message || "Không thể thanh toán giỏ hàng",
        kind: "error",
      });
    } finally {
      setCheckingOut(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">Giỏ hàng</h1>
          <p className="mt-3 text-slate-600">
            Bạn cần đăng nhập để xem giỏ hàng.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate("/auth/login")}>Đăng nhập</Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          Đang tải giỏ hàng...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {toast.message ? (
        <div className="mb-6">
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        </div>
      ) : null}

      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">
            EduScience Cart
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            Giỏ hàng của bạn
          </h1>
          <p className="mt-2 text-slate-600">
            {totalItems} khóa học đang chờ bạn thanh toán
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {cartItems.length > 0 ? (
            <button
              type="button"
              onClick={handleClearCart}
              className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 font-medium text-red-600 transition hover:bg-red-100"
            >
              Xóa toàn bộ
            </button>
          ) : null}

          <Link
            to="/courses"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Tiếp tục khám phá
          </Link>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
            🛒
          </div>
          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            Giỏ hàng đang trống
          </h2>
          <p className="mt-3 text-slate-600">
            Hãy thêm một vài khóa học trả phí để bắt đầu hành trình học tập của bạn.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate("/courses")}>Xem khóa học</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            {cartItems.map((item, index) => {
              const course = item?.course;
              const quantity = Number(item?.quantity || 1);
              const price = getCoursePrice(course);
              const courseId = course?._id;
              const isProcessing = processingIds.includes(String(courseId));

              return (
                <div
                  key={courseId || item?._id || index}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="grid gap-0 md:grid-cols-[260px_minmax(0,1fr)]">
                    <div className="h-full min-h-[220px] bg-slate-100">
                      <img
                        src={
                          course?.thumbnail ||
                          "https://placehold.co/800x500?text=Course"
                        }
                        alt={getCourseTitle(course)}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            {course?.category ? (
                              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                                {course.category}
                              </span>
                            ) : null}

                            {course?.level ? (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                {course.level}
                              </span>
                            ) : null}
                          </div>

                          <h2 className="text-2xl font-bold text-slate-900">
                            {getCourseTitle(course)}
                          </h2>

                          <p className="mt-2 line-clamp-3 text-slate-600">
                            {course?.shortDescription ||
                              course?.description ||
                              "Chưa có mô tả cho khóa học này."}
                          </p>
                        </div>

                        <div className="text-left md:text-right">
                          <div className="text-sm text-slate-500">Tạm tính</div>
                          <div className="mt-1 text-2xl font-black text-slate-900">
                            {formatPrice(price * quantity)}
                          </div>

                          {Number(course?.salePrice) > 0 &&
                          Number(course?.price) > Number(course?.salePrice) ? (
                            <div className="mt-1 text-sm text-slate-400 line-through">
                              {formatPrice(Number(course?.price) * quantity)}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-3">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Quantity
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleDecrease(courseId, quantity)}
                              disabled={isProcessing || quantity <= 1}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-lg font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              -
                            </button>

                            <span className="min-w-[40px] text-center text-lg font-bold text-slate-900">
                              {quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleIncrease(courseId, quantity)}
                              disabled={isProcessing}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-lg font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Unit price
                          </div>
                          <div className="mt-2 text-lg font-bold text-slate-900">
                            {formatPrice(price)}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Lessons
                          </div>
                          <div className="mt-2 text-lg font-bold text-slate-900">
                            {course?.totalLessons || 0}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          to={`/courses/${courseId}`}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Xem chi tiết
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleRemove(courseId)}
                          disabled={isProcessing}
                          className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h3 className="text-2xl font-black text-slate-900">
              Order summary
            </h3>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-slate-600">
                <span>Số khóa học</span>
                <span className="font-semibold text-slate-900">
                  {cartItems.length}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Tổng số lượng</span>
                <span className="font-semibold text-slate-900">
                  {totalItems}
                </span>
              </div>

              <div className="h-px bg-slate-200" />

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900">
                  Tổng tiền
                </span>
                <span className="text-2xl font-black text-indigo-600">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                onClick={handleCheckout}
                className="w-full"
                loading={checkingOut}
                disabled={checkingOut || cartItems.length === 0}
              >
                Checkout
              </Button>

              <button
                type="button"
                onClick={() => navigate("/courses")}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Thêm khóa học khác
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                Quy tắc hiện tại
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Khóa miễn phí enroll trực tiếp. Khóa trả phí phải thêm vào giỏ hàng
                và checkout xong mới vào khóa học.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}