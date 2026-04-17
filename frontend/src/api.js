async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "La operacion no pudo completarse.");
  }

  return data;
}

export function fetchCatalogs() {
  return apiRequest("/api/catalogs");
}

export function login(payload) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function register(payload) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function forgotPassword(payload) {
  return apiRequest("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchUsers() {
  return apiRequest("/api/users");
}

export function createUser(payload) {
  return apiRequest("/api/users", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateUser(userId, payload) {
  return apiRequest(`/api/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteUser(userId) {
  return apiRequest(`/api/users/${userId}`, {
    method: "DELETE"
  });
}
