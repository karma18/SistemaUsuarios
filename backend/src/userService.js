import { randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "./security.js";

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
    passwordHash: hashPassword("Admin123*"),
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

export function getUserCatalog() {
  return {
    roles: [...ALLOWED_ROLES],
    statuses: [...ALLOWED_STATUS]
  };
}

export async function ensureUserSeeds(userRepository) {
  const existingUser = await userRepository.findByEmail("admin@empresa.local");

  if (!existingUser) {
    await userRepository.create(createSeedUser());
  }
}

export async function loginUser(userRepository, payload) {
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

  const user = await userRepository.findByEmail(email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw buildError("Credenciales invalidas.", 401);
  }

  if (user.status !== "Activo") {
    throw buildError("El usuario se encuentra inactivo.", 403);
  }

  const updatedUser = {
    ...user,
    lastLoginAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await userRepository.update(updatedUser);

  return {
    message: `Bienvenido, ${user.name}.`,
    user: sanitizeUser(updatedUser)
  };
}

export async function registerUser(userRepository, payload) {
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

  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    throw buildError("Ya existe un usuario registrado con ese correo.", 409);
  }

  const now = new Date().toISOString();
  const user = {
    id: randomUUID(),
    name,
    email,
    passwordHash: hashPassword(password),
    role: "Analista",
    department,
    status: "Activo",
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now
  };

  await userRepository.create(user);

  return {
    message: "Registro completado correctamente.",
    user: sanitizeUser(user)
  };
}

export async function requestPasswordReset(userRepository, payload) {
  const email = normalizeEmail(payload?.email);
  const emailError = validateEmail(email);

  if (emailError) {
    throw buildError(emailError);
  }

  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw buildError("No existe una cuenta asociada al correo indicado.", 404);
  }

  await userRepository.update({
    ...user,
    updatedAt: new Date().toISOString()
  });

  return {
    message:
      "Solicitud registrada. Contacta al administrador para actualizar la contrasena de forma segura."
  };
}

export async function listUsers(userRepository) {
  const users = await userRepository.list();
  return users.map(sanitizeUser);
}

export async function createUser(userRepository, payload) {
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

  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    throw buildError("Ya existe un usuario registrado con ese correo.", 409);
  }

  const now = new Date().toISOString();
  const user = {
    id: randomUUID(),
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    department,
    status,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now
  };

  await userRepository.create(user);

  return {
    message: "Usuario creado correctamente.",
    user: sanitizeUser(user)
  };
}

export async function updateUser(userRepository, userId, payload) {
  const user = await userRepository.findById(userId);

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

  const existingUser = await userRepository.findByEmail(email);

  if (existingUser && existingUser.id !== userId) {
    throw buildError("Ya existe un usuario registrado con ese correo.", 409);
  }

  const updatedUser = {
    ...user,
    name,
    email,
    role,
    department,
    status,
    passwordHash: newPassword ? hashPassword(newPassword) : user.passwordHash,
    updatedAt: new Date().toISOString()
  };

  await userRepository.update(updatedUser);

  return {
    message: "Usuario actualizado correctamente.",
    user: sanitizeUser(updatedUser)
  };
}

export async function deleteUser(userRepository, userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw buildError("Usuario no encontrado.", 404);
  }

  await userRepository.delete(userId);

  return {
    message: `Usuario ${user.name} eliminado correctamente.`
  };
}
