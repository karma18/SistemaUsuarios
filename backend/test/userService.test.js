import test from "node:test";
import assert from "node:assert/strict";
import {
  createUser,
  createUserStore,
  deleteUser,
  listUsers,
  loginUser,
  registerUser,
  requestPasswordReset,
  updateUser
} from "../src/userService.js";

test("registerUser registra un usuario y lo devuelve saneado", () => {
  const store = createUserStore([]);

  const result = registerUser(store, {
    name: "Ana Torres",
    email: "  ANA@EMPRESA.LOCAL ",
    password: "Clave123",
    department: "Finanzas"
  });

  assert.equal(result.user.email, "ana@empresa.local");
  assert.equal(result.user.role, "Analista");
  assert.equal(result.user.department, "Finanzas");
  assert.equal(store.users.length, 1);
  assert.equal("password" in result.user, false);
});

test("registerUser rechaza correos duplicados", () => {
  const store = createUserStore([]);

  registerUser(store, {
    name: "Ana Torres",
    email: "ana@empresa.local",
    password: "Clave123"
  });

  assert.throws(
    () =>
      registerUser(store, {
        name: "Otro Nombre",
        email: "ANA@EMPRESA.LOCAL",
        password: "Clave456"
      }),
    { message: "Ya existe un usuario registrado con ese correo." }
  );
});

test("loginUser permite acceso con credenciales validas", () => {
  const store = createUserStore([]);

  const registerResult = registerUser(store, {
    name: "Ana Torres",
    email: "ana@empresa.local",
    password: "Clave123"
  });

  const result = loginUser(store, {
    email: "ana@empresa.local",
    password: "Clave123"
  });

  assert.equal(result.user.id, registerResult.user.id);
  assert.equal(result.user.lastLoginAt !== null, true);
});

test("loginUser falla con credenciales invalidas", () => {
  const store = createUserStore([]);

  registerUser(store, {
    name: "Ana Torres",
    email: "ana@empresa.local",
    password: "Clave123"
  });

  assert.throws(
    () =>
      loginUser(store, {
        email: "ana@empresa.local",
        password: "incorrecta"
      }),
    { message: "Credenciales invalidas." }
  );
});

test("requestPasswordReset valida la existencia del correo", () => {
  const store = createUserStore([]);

  assert.throws(
    () => requestPasswordReset(store, { email: "nadie@empresa.local" }),
    { message: "No existe una cuenta asociada al correo indicado." }
  );
});

test("createUser y updateUser administran el catalogo de usuarios", () => {
  const store = createUserStore([]);

  const created = createUser(store, {
    name: "Luis Mena",
    email: "luis@empresa.local",
    password: "Secreta1",
    role: "Soporte",
    department: "Mesa de ayuda",
    status: "Activo"
  });

  const updated = updateUser(store, created.user.id, {
    role: "Administrador",
    status: "Inactivo",
    department: "Operaciones"
  });

  assert.equal(updated.user.role, "Administrador");
  assert.equal(updated.user.status, "Inactivo");
  assert.equal(updated.user.department, "Operaciones");
  assert.equal(listUsers(store).length, 1);
});

test("updateUser rechaza roles invalidos", () => {
  const store = createUserStore([]);

  const created = createUser(store, {
    name: "Luis Mena",
    email: "luis@empresa.local",
    password: "Secreta1",
    role: "Soporte",
    department: "Mesa de ayuda",
    status: "Activo"
  });

  assert.throws(
    () => updateUser(store, created.user.id, { role: "Director" }),
    { message: "El rol seleccionado no es valido." }
  );
});

test("deleteUser elimina usuarios existentes", () => {
  const store = createUserStore([]);

  const created = createUser(store, {
    name: "Luis Mena",
    email: "luis@empresa.local",
    password: "Secreta1",
    role: "Soporte",
    department: "Mesa de ayuda",
    status: "Activo"
  });

  const result = deleteUser(store, created.user.id);

  assert.equal(result.message, "Usuario Luis Mena eliminado correctamente.");
  assert.equal(listUsers(store).length, 0);
});

test("createUser valida nombres cortos como edge case", () => {
  const store = createUserStore([]);

  assert.throws(
    () =>
      createUser(store, {
        name: "Al",
        email: "al@empresa.local",
        password: "Secreta1",
        role: "Soporte",
        status: "Activo"
      }),
    { message: "El nombre debe tener al menos 3 caracteres." }
  );
});
