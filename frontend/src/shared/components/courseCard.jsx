import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "./Toast";
import { RatingStars } from "./ratingStars.jsx";
import { useAuth } from "../../features/auth/state/useAuth";
import {
  addToCart,
  getMyCart,
  cartUnwrap,
} from "../../features/cart/services/cart.service";
import {
  getMyCourses,
  enrollCourse,
} from "../../features/enrollment/services/enrollment.service";

export function CourseCard({ course }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });
  const [processing, setProcessing] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  const instructorName =
    course?.instructorId?.fullName ||
    course?.instructorId?.name ||
    course?.instructorId?.username ||
    course?.instructorId?.email ||
    "Instructor";

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    instructorName
  )}&background=7c3aed&color=ffffff&bold=true`;

  const displayLevel = course?.level
    ? course.level.charAt(0).toUpperCase() + course.level.slice(1)
    : "Beginner";

  const isFreeCourse =
    course?.isFree === true || Number(course?.price || 0) === 0;

  const displayPrice = isFreeCourse
    ? "Free"
    : course?.salePrice && Number(course.salePrice) > 0
    ? `₫${Number(course.salePrice).toLocaleString("vi-VN")}`
    : `₫${Number(course?.price || 0).toLocaleString("vi-VN")}`;

  const currentUserId = user?._id || user?.id || user?.userId || "";
  const instructorUserId =
    course?.instructorId?._id || course?.instructorId?.id || "";
  const isOwner =
    currentUserId &&
    instructorUserId &&
    String(currentUserId) === String(instructorUserId);

  useEffect(() => {
    let isMounted = true;

    async function loadCardState() {
      try {
        if (!isAuthenticated || !currentUserId || !course?._id) {
          if (isMounted) {
            setIsEnrolled(false);
            setIsInCart(false);
          }
          return;
        }

        const [myCoursesRes, myCartRes] = await Promise.allSettled([
          getMyCourses(currentUserId),
          getMyCart(),
        ]);

        if (myCoursesRes.status === "fulfilled") {
          const myCourses = myCoursesRes.value?.data || myCoursesRes.value || [];
          const enrolled = Array.isArray(myCourses)
            ? myCourses.some(
                (item) =>
                  String(item?.courseId?._id || item?.courseId) ===
                  String(course._id)
              )
            : false;

          if (isMounted) {
            setIsEnrolled(enrolled);
          }
        } else if (isMounted) {
          setIsEnrolled(false);
        }

        if (myCartRes.status === "fulfilled") {
          const cartData = cartUnwrap(myCartRes.value);
          const items = Array.isArray(cartData?.items) ? cartData.items : [];

          const existedInCart = items.some(
            (item) =>
              String(item?.course?._id || item?.course) === String(course._id)
          );

          if (isMounted) {
            setIsInCart(existedInCart);
          }
        } else if (isMounted) {
          setIsInCart(false);
        }
      } catch (error) {
        console.error("CourseCard state error:", error);
      }
    }

    loadCardState();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, currentUserId, course?._id]);

  async function handleAction(e) {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!isAuthenticated) {
        setToast({
          message: "Please login first",
          kind: "error",
        });
        navigate("/auth/login");
        return;
      }

      if (!course?._id) {
        setToast({
          message: "Course not found",
          kind: "error",
        });
        return;
      }

      if (isOwner) {
        setToast({
          message: "You are the instructor of this course",
          kind: "error",
        });
        return;
      }

      if (isEnrolled) {
        navigate(`/learn/${course._id}`);
        return;
      }

      if (isFreeCourse) {
        setProcessing(true);
        await enrollCourse({
          courseId: course._id,
        });
        setIsEnrolled(true);
        setIsInCart(false);
        setToast({
          message: "Enroll free course successfully",
          kind: "success",
        });
        return;
      }

      if (isInCart) {
        navigate("/cart");
        return;
      }

      setProcessing(true);
      await addToCart(course._id, 1);
      setIsInCart(true);

      setToast({
        message: "Added to cart successfully",
        kind: "success",
      });
    } catch (error) {
      setToast({
        message: error?.message || "Failed to process course action",
        kind: "error",
      });
    } finally {
      setProcessing(false);
    }
  }

  const actionText = useMemo(() => {
    if (isOwner) return "Your course";
    if (isEnrolled) return "Continue learning";
    if (isFreeCourse) return processing ? "Enrolling..." : "Enroll free";
    if (isInCart) return "Go to cart";
    return processing ? "Adding..." : "Add to cart";
  }, [isOwner, isEnrolled, isFreeCourse, isInCart, processing]);

  return (
    <>
      {toast.message ? (
        <Toast
          kind={toast.kind}
          message={toast.message}
          onClose={() => setToast({ message: "", kind: "success" })}
        />
      ) : null}

      <Link to={`/courses/${course?._id}`} className="block h-full">
        <div className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={
                course?.thumbnail ||
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
              }
              alt={course?.title || "Course"}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />

            <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/85 px-4 py-1.5 text-xs font-semibold tracking-wide text-white">
              {course?.category || "General"}
            </span>

            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-violet-700 shadow">
              {displayLevel}
            </span>

            {course?.isPopular ? (
              <span className="absolute right-3 top-3 rounded-full bg-slate-950/85 px-3 py-1 text-xs font-bold text-white shadow">
                Popular
              </span>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RatingStars rating={Math.round(course?.rating || 0)} />
                <span className="text-sm text-slate-500">
                  ({course?.totalReviews || 0})
                </span>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isFreeCourse
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-violet-50 text-violet-700"
                }`}
              >
                {isFreeCourse ? "Free" : "Paid"}
              </span>
            </div>

            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-lg font-black text-violet-600">
                {displayPrice}
              </span>
            </div>

            <h3 className="mb-3 min-h-[3.5rem] text-[20px] font-bold leading-snug text-slate-950 line-clamp-2">
              {course?.title}
            </h3>

            <p className="mb-4 line-clamp-3 text-sm leading-7 text-slate-600">
              {course?.shortDescription ||
                course?.description ||
                "No description yet."}
            </p>

            <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span>📘 {course?.totalLessons || 0}</span>
              <span>⏱ {course?.duration || 0}m</span>
              <span>👨‍🎓 {course?.totalEnrollments || 0}</span>
            </div>

            <div className="mt-auto space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="h-11 w-11 min-w-[44px] overflow-hidden rounded-full border-2 border-violet-500 bg-slate-100">
                    <img
                      src={course?.instructorId?.avatarUrl || fallbackAvatar}
                      alt={instructorName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = fallbackAvatar;
                      }}
                    />
                  </div>

                  <span className="truncate text-sm font-semibold text-slate-800">
                    {instructorName}
                  </span>
                </div>

                <span className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 font-semibold text-white shadow-md">
                  View
                </span>
              </div>

              {!isOwner ? (
                <button
                  type="button"
                  onClick={handleAction}
                  disabled={processing}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                    isEnrolled
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : isInCart
                      ? "border-violet-200 bg-violet-50 text-violet-700"
                      : isFreeCourse
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {actionText}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}