const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

function getAuthToken() {
  try {
    return (
      localStorage.getItem("token") ||
      JSON.parse(localStorage.getItem("auth") || "{}")?.token ||
      null
    );
  } catch {
    return null;
  }
}

function headers(auth = false) {
  const h = { "Content-Type": "application/json" };
  if (auth) {
    const token = getAuthToken();
    if (token) h.Authorization = `Bearer ${token}`;
  }
  return h;
}

async function handle(res, msg) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.message || msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

export function cartUnwrap(res) {
  return res?.data ?? res?.cart ?? res ?? { items: [] };
}

export function emitCartUpdated() {
  window.dispatchEvent(new CustomEvent("cart-updated"));
}

export async function getMyCart() {
  const res = await fetch(`${API_BASE_URL}/api/cart`, {
    headers: headers(true),
  });
  return handle(res, "Fetch cart failed");
}

export async function addToCart(courseId, quantity = 1) {
  const res = await fetch(`${API_BASE_URL}/api/cart/add`, {
    method: "POST",
    headers: headers(true),
    body: JSON.stringify({ courseId, quantity }),
  });

  const data = await handle(res, "Add to cart failed");
  emitCartUpdated();
  return data;
}

export async function updateCartItemQuantity(courseId, quantity) {
  const res = await fetch(`${API_BASE_URL}/api/cart/update`, {
    method: "PATCH",
    headers: headers(true),
    body: JSON.stringify({ courseId, quantity }),
  });
  const data = await handle(res, "Update quantity failed");
  emitCartUpdated();
  return data;
}

export async function removeCartItem(courseId) {
  const res = await fetch(`${API_BASE_URL}/api/cart/remove/${courseId}`, {
    method: "DELETE",
    headers: headers(true),
  });
  const data = await handle(res, "Remove item failed");
  emitCartUpdated();
  return data;
}

export async function clearCart() {
  const res = await fetch(`${API_BASE_URL}/api/cart/clear`, {
    method: "DELETE",
    headers: headers(true),
  });
  const data = await handle(res, "Clear cart failed");
  emitCartUpdated();
  return data;
}

export async function checkoutCart() {
  const res = await fetch(`${API_BASE_URL}/api/cart/checkout`, {
    method: "POST",
    headers: headers(true),
  });
  const data = await handle(res, "Checkout failed");
  emitCartUpdated();
  return data;
}