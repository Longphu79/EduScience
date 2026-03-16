const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

function getAuthToken() {
  try {
    const directToken =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken");

    if (directToken) return directToken;

    const authRaw =
      localStorage.getItem("auth") ||
      localStorage.getItem("auth-storage") ||
      localStorage.getItem("eduscience_auth");

    if (authRaw) {
      const parsed = JSON.parse(authRaw);
      return (
        parsed?.token ||
        parsed?.accessToken ||
        parsed?.state?.token ||
        parsed?.state?.accessToken ||
        null
      );
    }
  } catch (error) {
    console.error("getAuthToken error:", error);
  }

  return null;
}

function createHeaders(extraHeaders = {}, useAuth = false) {
  const headers = {
    ...extraHeaders,
  };

  if (useAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

async function handleResponse(res, fallbackMessage = "Request failed") {
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
}

export function cartUnwrap(res) {
  return res?.data || res?.cart || res || { items: [] };
}

export async function getMyCart() {
  const res = await fetch(`${API_BASE_URL}/api/cart`, {
    method: "GET",
    headers: createHeaders({}, true),
  });

  return handleResponse(res, "Failed to fetch cart");
}

export async function addToCart(courseId, quantity = 1) {
  const res = await fetch(`${API_BASE_URL}/api/cart/add`, {
    method: "POST",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify({ courseId, quantity }),
  });

  return handleResponse(res, "Failed to add course to cart");
}

export async function removeCartItem(courseId) {
  const res = await fetch(`${API_BASE_URL}/api/cart/remove/${courseId}`, {
    method: "DELETE",
    headers: createHeaders({}, true),
  });

  return handleResponse(res, "Failed to remove cart item");
}

export async function updateCartItemQuantity(courseId, quantity) {
  const res = await fetch(`${API_BASE_URL}/api/cart/update`, {
    method: "PATCH",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify({ courseId, quantity }),
  });

  return handleResponse(res, "Failed to update cart item quantity");
}

export async function clearCart() {
  const res = await fetch(`${API_BASE_URL}/api/cart/clear`, {
    method: "DELETE",
    headers: createHeaders({}, true),
  });

  return handleResponse(res, "Failed to clear cart");
}

export async function checkoutCart() {
  const res = await fetch(`${API_BASE_URL}/api/cart/checkout`, {
    method: "POST",
    headers: createHeaders({}, true),
  });

  return handleResponse(res, "Failed to checkout cart");
}