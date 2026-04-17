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

export function fetchCustomers() {
  return apiRequest("/api/customers");
}

export function createCustomer(payload) {
  return apiRequest("/api/customers", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateCustomer(customerId, payload) {
  return apiRequest(`/api/customers/${customerId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteCustomer(customerId) {
  return apiRequest(`/api/customers/${customerId}`, {
    method: "DELETE"
  });
}

export function fetchSuppliers() {
  return apiRequest("/api/suppliers");
}

export function createSupplier(payload) {
  return apiRequest("/api/suppliers", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateSupplier(supplierId, payload) {
  return apiRequest(`/api/suppliers/${supplierId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteSupplier(supplierId) {
  return apiRequest(`/api/suppliers/${supplierId}`, {
    method: "DELETE"
  });
}
