import { randomUUID } from "node:crypto";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = ["Administrador", "Analista", "Soporte"];
const ALLOWED_STATUS = ["Activo", "Inactivo"];

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function createSeedUser() {
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    name: "Administrador General",
    email: "admin@empresa.local",
    password: "Admin123*",
    role: "Administrador",
    department: "Tecnologia",
    status: "Activo",
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now
  };
}

function validateEmail(email) {
  if (!email) {
    return "El correo es obligatorio.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    return "El correo no tiene un formato valido.";
  }

  return "";
}

function validatePassword(password) {
  if (!password) {
    return "La contrasena es obligatoria.";
  }

  if (password.length < 6) {
    return "La contrasena debe tener al menos 6 caracteres.";
  }

  return "";
}

function validateName(name) {
  if (!name) {
    return "El nombre es obligatorio.";
  }

  if (name.length < 3) {
    return "El nombre debe tener al menos 3 caracteres.";
  }

  return "";
}

function validateRole(role) {
  if (!ALLOWED_ROLES.includes(role)) {
    return "El rol seleccionado no es valido.";
  }

  return "";
}

function validateStatus(status) {
  if (!ALLOWED_STATUS.includes(status)) {
    return "El estado seleccionado no es valido.";
  }

  return "";
}

function buildError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export function createUserStore(seedUsers = [createSeedUser()]) {
  return {
    users: seedUsers.map((user) => ({ ...user }))
  };
}

export function getUserCatalog() {
  return {
    roles: [...ALLOWED_ROLES],
    statuses: [...ALLOWED_STATUS]
  };
}

export function loginUser(store, payload) {
  const email = normalizeEmail(payload?.email);
  const password = normalizeText(payload?.password);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (emailError) {
    throw buildError(emailError);
  }

  if (passwordError) {
    throw buildError(passwordError);
  }

  const user = store.users.find((item) => item.email === email);

  if (!user || user.password !== password) {
    throw buildError("Credenciales invalidas.", 401);
  }

  if (user.status !== "Activo") {
    throw buildError("El usuario se encuentra inactivo.", 403);
  }

  user.lastLoginAt = new Date().toISOString();
  user.updatedAt = user.lastLoginAt;

  return {
    message: `Bienvenido, ${user.name}.`,
    user: sanitizeUser(user)
  };
}

export function registerUser(store, payload) {
  const name = normalizeText(payload?.name);
  const email = normalizeEmail(payload?.email);
  const password = normalizeText(payload?.password);
  const department = normalizeText(payload?.department) || "Operaciones";
  const nameError = validateName(name);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (nameError) {
    throw buildError(nameError);
  }

  if (emailError) {
    throw buildError(emailError);
  }

  if (passwordError) {
    throw buildError(passwordError);
  }

  if (store.users.some((user) => user.email === email)) {
    throw buildError("Ya existe un usuario registrado con ese correo.", 409);
  }

  const now = new Date().toISOString();
  const user = {
    id: randomUUID(),
    name,
    email,
    password,
    role: "Analista",
    department,
    status: "Activo",
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now
  };

  store.users.push(user);

  return {
    message: "Registro completado correctamente.",
    user: sanitizeUser(user)
  };
}

export function requestPasswordReset(store, payload) {
  const email = normalizeEmail(payload?.email);
  const emailError = validateEmail(email);

  if (emailError) {
    throw buildError(emailError);
  }

  const user = store.users.find((item) => item.email === email);

  if (!user) {
    throw buildError("No existe una cuenta asociada al correo indicado.", 404);
  }

  user.updatedAt = new Date().toISOString();

  return {
    message:
      "Solicitud registrada. Contacta al administrador para actualizar la contrasena de forma segura."
  };
}

export function listUsers(store) {
  return store.users.map(sanitizeUser);
}

export function createUser(store, payload) {
  const name = normalizeText(payload?.name);
  const email = normalizeEmail(payload?.email);
  const password = normalizeText(payload?.password);
  const role = normalizeText(payload?.role) || "Analista";
  const department = normalizeText(payload?.department) || "Operaciones";
  const status = normalizeText(payload?.status) || "Activo";

  const nameError = validateName(name);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const roleError = validateRole(role);
  const statusError = validateStatus(status);

  if (nameError || emailError || passwordError || roleError || statusError) {
    throw buildError(
      nameError || emailError || passwordError || roleError || statusError
    );
  }

  if (store.users.some((user) => user.email === email)) {
    throw buildError("Ya existe un usuario registrado con ese correo.", 409);
  }

  const now = new Date().toISOString();
  const user = {
    id: randomUUID(),
    name,
    email,
    password,
    role,
    department,
    status,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now
  };

  store.users.push(user);

  return {
    message: "Usuario creado correctamente.",
    user: sanitizeUser(user)
  };
}

export function updateUser(store, userId, payload) {
  const user = store.users.find((item) => item.id === userId);

  if (!user) {
    throw buildError("Usuario no encontrado.", 404);
  }

  const name = normalizeText(payload?.name || user.name);
  const email = normalizeEmail(payload?.email || user.email);
  const role = normalizeText(payload?.role || user.role);
  const department = normalizeText(payload?.department || user.department);
  const status = normalizeText(payload?.status || user.status);
  const newPassword = normalizeText(payload?.password);

  const nameError = validateName(name);
  const emailError = validateEmail(email);
  const roleError = validateRole(role);
  const statusError = validateStatus(status);

  if (newPassword) {
    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      throw buildError(passwordError);
    }
  }

  if (nameError || emailError || roleError || statusError) {
    throw buildError(nameError || emailError || roleError || statusError);
  }

  const emailInUse = store.users.some(
    (item) => item.id !== userId && item.email === email
  );

  if (emailInUse) {
    throw buildError("Ya existe un usuario registrado con ese correo.", 409);
  }

  user.name = name;
  user.email = email;
  user.role = role;
  user.department = department;
  user.status = status;
  user.updatedAt = new Date().toISOString();

  if (newPassword) {
    user.password = newPassword;
  }

  return {
    message: "Usuario actualizado correctamente.",
    user: sanitizeUser(user)
  };
}

export function deleteUser(store, userId) {
  const index = store.users.findIndex((item) => item.id === userId);

  if (index === -1) {
    throw buildError("Usuario no encontrado.", 404);
  }

  const [user] = store.users.splice(index, 1);

  return {
    message: `Usuario ${user.name} eliminado correctamente.`
  };
}
