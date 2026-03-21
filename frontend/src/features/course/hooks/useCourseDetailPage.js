import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/state/useAuth";
import { getAllCourses, getCourseDetail } from "../services/course.service";
import {
  getCourseId,
  getCourseLessons,
  getCourseLevelLabel,
  getCoursePriceMeta,
  getInstructorId,
  getYoutubeEmbedUrl,
} from "../utils/course.helpers";
import {
  getMyCourses,
  enrollCourse,
} from "../../enrollment/services/enrollment.service";
import {
  createReview,
  getReviewsByCourse,
} from "../../review/services/review.service";
import { getMaterialsByCourse } from "../../material/services/material.service";
import {
  addToCart,
  getMyCart,
  cartUnwrap,
} from "../../cart/services/cart.service";

export default function useCourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [extraLoading, setExtraLoading] = useState(true);
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  async function loadExtraData(id) {
    try {
      setExtraLoading(true);

      const [reviewRes, materialRes] = await Promise.allSettled([
        getReviewsByCourse(id),
        getMaterialsByCourse(id),
      ]);

      if (reviewRes.status === "fulfilled") {
        const reviewList = reviewRes.value?.data || reviewRes.value || [];
        setReviews(Array.isArray(reviewList) ? reviewList : []);
      } else {
        setReviews([]);
      }

      if (materialRes.status === "fulfilled") {
        const materialList = materialRes.value?.data || materialRes.value || [];
        setMaterials(Array.isArray(materialList) ? materialList : []);
      } else {
        setMaterials([]);
      }
    } finally {
      setExtraLoading(false);
    }
  }

  async function loadEnrollmentAndCartState(courseData) {
    if (!isAuthenticated || !(user?._id || user?.id || user?.userId)) {
      setIsEnrolled(false);
      setIsInCart(false);
      return;
    }

    const studentId = user._id || user.id || user.userId;

    const [myCoursesRes, myCartRes] = await Promise.allSettled([
      getMyCourses(studentId),
      getMyCart(),
    ]);

    if (myCoursesRes.status === "fulfilled") {
      const myCourses = myCoursesRes.value?.data || myCoursesRes.value || [];

      const enrolled = Array.isArray(myCourses)
        ? myCourses.some(
            (item) =>
              String(item?.courseId?._id || item?.courseId) ===
              String(getCourseId(courseData))
          )
        : false;

      setIsEnrolled(enrolled);
    } else {
      setIsEnrolled(false);
    }

    if (myCartRes.status === "fulfilled") {
      const cartData = cartUnwrap(myCartRes.value);
      const items = Array.isArray(cartData?.items) ? cartData.items : [];

      const existedInCart = items.some(
        (item) =>
          String(item?.course?._id || item?.course) ===
          String(getCourseId(courseData))
      );

      setIsInCart(existedInCart);
    } else {
      setIsInCart(false);
    }
  }

  useEffect(() => {
    async function fetchCourseDetail() {
      try {
        setLoading(true);

        const courseData = await getCourseDetail(courseId);
        setCourse(courseData);

        await loadEnrollmentAndCartState(courseData);

        const relatedRes = await getAllCourses({
          category: courseData?.category || "",
          sortBy: "popular",
        });

        const relatedPayload = Array.isArray(relatedRes?.data)
          ? relatedRes.data
          : [];

        setRelatedCourses(
          relatedPayload
            .filter((item) => String(getCourseId(item)) !== String(getCourseId(courseData)))
            .slice(0, 3)
        );

        await loadExtraData(courseId);
      } catch (error) {
        setToast({
          message: error?.message || "Failed to load course detail",
          kind: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCourseDetail();
  }, [courseId, isAuthenticated, user]);

  const currentUserId = user?._id || user?.id || user?.userId || "";
  const instructorUserId = getInstructorId(course);
  const isOwner =
    currentUserId &&
    instructorUserId &&
    String(currentUserId) === String(instructorUserId);

  const instructorName =
    course?.instructorId?.fullName ||
    course?.instructorId?.name ||
    course?.instructorId?.username ||
    course?.instructorId?.email ||
    "Instructor";

  const instructorAvatar =
    course?.instructorId?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      instructorName
    )}&background=7c3aed&color=ffffff&bold=true`;

  const displayLevel = getCourseLevelLabel(course?.level);
  const lessons = getCourseLessons(course);
  const { isFree: isFreeCourse, displayPrice, originalPrice } =
    getCoursePriceMeta(course);

  const previewVideoUrl = useMemo(
    () => getYoutubeEmbedUrl(course?.previewVideo || ""),
    [course]
  );

  async function handleEnrollFree() {
    try {
      if (!isAuthenticated || !(user?._id || user?.id || user?.userId)) {
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

      if (!isFreeCourse) {
        setToast({
          message: "Paid course must be added to cart and checked out first",
          kind: "error",
        });
        return;
      }

      if (isEnrolled) {
        navigate(`/learn/${course._id}`);
        return;
      }

      setEnrolling(true);

      await enrollCourse(course._id);

      setIsEnrolled(true);
      setIsInCart(false);

      setCourse((prev) =>
        prev
          ? {
              ...prev,
              totalEnrollments: (prev.totalEnrollments || 0) + 1,
            }
          : prev
      );

      setToast({
        message: "Enroll free course successfully",
        kind: "success",
      });
    } catch (error) {
      setToast({
        message: error?.message || "Failed to enroll course",
        kind: "error",
      });
    } finally {
      setEnrolling(false);
    }
  }

  async function handleAddToCart() {
    try {
      if (!isAuthenticated || !(user?._id || user?.id || user?.userId)) {
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

      if (isFreeCourse) {
        setToast({
          message: "Free course does not need cart, please enroll directly",
          kind: "error",
        });
        return;
      }

      if (isEnrolled) {
        navigate(`/learn/${course._id}`);
        return;
      }

      if (isInCart) {
        navigate("/cart");
        return;
      }

      setAddingToCart(true);

      await addToCart(course._id, 1);
      setIsInCart(true);

      setToast({
        message: "Added to cart successfully",
        kind: "success",
      });
    } catch (error) {
      setToast({
        message: error?.message || "Failed to add course to cart",
        kind: "error",
      });
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleCreateReview(payload) {
    try {
      if (!isAuthenticated) {
        setToast({
          message: "Please login first",
          kind: "error",
        });
        navigate("/auth/login");
        return;
      }

      if (!isEnrolled) {
        setToast({
          message: "You need to enroll this course before reviewing",
          kind: "error",
        });
        return;
      }

      await createReview({
        ...payload,
      });

      await loadExtraData(courseId);

      setToast({
        message: "Review submitted successfully",
        kind: "success",
      });
    } catch (error) {
      setToast({
        message: error?.message || "Failed to submit review",
        kind: "error",
      });
    }
  }

  const primaryButtonText = isOwner
    ? "Your Course"
    : isEnrolled
    ? "Continue Learning"
    : isFreeCourse
    ? "Enroll Free"
    : isInCart
    ? "Go to Cart"
    : "Add to Cart";

  function handlePrimaryAction() {
    if (isOwner) return;

    if (isEnrolled) {
      navigate(`/learn/${course._id}`);
      return;
    }

    if (isFreeCourse) {
      handleEnrollFree();
      return;
    }

    handleAddToCart();
  }

  return {
    courseId,
    course,
    relatedCourses,
    loading,
    enrolling,
    addingToCart,
    isEnrolled,
    isInCart,
    reviews,
    materials,
    extraLoading,
    toast,
    currentUserId,
    isOwner,
    instructorName,
    instructorAvatar,
    displayLevel,
    displayPrice,
    originalPrice,
    previewVideoUrl,
    lessons,
    isFreeCourse,
    primaryButtonText,
    setToast,
    handlePrimaryAction,
    handleCreateReview,
    navigate,
  };
}