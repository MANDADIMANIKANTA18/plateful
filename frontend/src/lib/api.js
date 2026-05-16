const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw { status: res.status, message: data?.message || res.statusText };
  return data;
}

// ─── Auth ────────────────────────────────────────
export async function register(body) {
  return request("/auth/register", { method: "POST", body: JSON.stringify(body) });
}

export async function login(body) {
  return request("/auth/login", { method: "POST", body: JSON.stringify(body) });
}

// ─── Food Listings ───────────────────────────────
export async function getFoods(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request(`/foods${q ? `?${q}` : ""}`);
}

export async function getNearbyFoods(lat, lng, radiusKm = 10) {
  return request(`/foods/nearby?latitude=${lat}&longitude=${lng}&radiusKm=${radiusKm}`);
}

export async function getFoodById(id) {
  return request(`/foods/${id}`);
}

export async function getFoodsByType(listingType) {
  return request(`/foods/type/${listingType}`);
}

// ─── Vendor ──────────────────────────────────────
export async function createListing(body) {
  return request("/vendor/listings", { method: "POST", body: JSON.stringify(body) });
}

export async function getMyListings() {
  return request("/vendor/listings");
}

export async function deleteListing(id) {
  return request(`/vendor/listings/${id}`, { method: "DELETE" });
}

export async function getVendorOrders() {
  return request("/vendor/orders");
}

export async function completeOrder(orderId) {
  return request(`/vendor/orders/${orderId}/complete`, { method: "PATCH" });
}

export async function verifyPickup(orderId, pickupCode) {
  return request(`/vendor/orders/${orderId}/verify-pickup`, {
    method: "PATCH",
    body: JSON.stringify({ pickupCode }),
  });
}

export async function getVendorAnalytics() {
  return request("/vendor/analytics");
}

// ─── Orders (Customer) ──────────────────────────
export async function createOrder(body) {
  return request("/orders", { method: "POST", body: JSON.stringify(body) });
}

export async function getMyOrders() {
  return request("/orders/my");
}

export async function confirmPayment(orderId, paymentData) {
  return request(`/orders/${orderId}/confirm-payment`, {
    method: "PUT",
    body: JSON.stringify(paymentData),
  });
}

export async function cancelOrder(orderId) {
  return request(`/orders/${orderId}/cancel`, { method: "PUT" });
}

// ─── Admin ───────────────────────────────────────
export async function getAllVendors() {
  return request("/admin/vendors");
}

export async function verifyVendor(vendorId) {
  return request(`/admin/vendors/${vendorId}/verify`, { method: "PUT" });
}

export async function getAllOrders() {
  return request("/admin/orders");
}

export async function getAdminAnalytics() {
  return request("/admin/analytics");
}

// ─── Impact ──────────────────────────────────────
export async function getImpact() {
  return request("/impact");
}

// ─── User Profile ────────────────────────────────
export async function getProfile() {
  return request("/users/me");
}

export async function updateProfile(body) {
  return request("/users/me", { method: "PUT", body: JSON.stringify(body) });
}
