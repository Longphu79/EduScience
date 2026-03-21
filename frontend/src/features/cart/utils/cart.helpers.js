export function formatPrice(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}



export function normalizeCartItem(item) {
  return {
    id: String(item?._id || ""),
    course: item?.course || {},
    quantity: Number(item?.quantity || 1),
  };
}

export function normalizeCart(cart) {
  return {
    items: Array.isArray(cart?.items)
      ? cart.items.map(normalizeCartItem)
      : [],
  };
}


export function getCartItems(cart) {
  return Array.isArray(cart?.items) ? cart.items : [];
}

export function getCartItemId(item) {
  return item?.id;
}

export function getCourseId(course) {
  return course?._id || "";
}

export function getCourseTitle(course) {
  return course?.title || "Khóa học";
}

export function getCourseThumbnail(course) {
  return course?.thumbnail || "https://placehold.co/800x500?text=Course";
}

export function getCourseDescription(course) {
  return (
    course?.shortDescription ||
    course?.description ||
    "Chưa có mô tả cho khóa học này."
  );
}

export function getCoursePrice(course) {
  if (!course) return 0;
  if (course.isFree) return 0;

  const sale = Number(course.salePrice);
  const price = Number(course.price);

  if (!Number.isNaN(sale) && sale > 0) return sale;
  return !Number.isNaN(price) ? price : 0;
}



export function getCartCount(cart) {
  return getCartItems(cart).length;
}

export function getCartTotalItems(cart) {
  return getCartItems(cart).reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );
}

export function getCartSubtotal(cart) {
  return getCartItems(cart).reduce((sum, item) => {
    return sum + getCoursePrice(item.course) * item.quantity;
  }, 0);
}