import test from "node:test";
import assert from "node:assert/strict";
import {
  createUser,
  deleteUser,
  ensureUserSeeds,
  listUsers,
  loginUser,
  registerUser,
  requestPasswordReset,
  updateUser
} from "../src/userService.js";
import { hashPassword } from "../src/security.js";

function createUserRepository(initialUsers = []) {
  const users = initialUsers.map((user) => ({ ...user }));

  return {
    users,
    async findByEmail(email) {
      return users.find((user) => user.email === email) || null;
    },
    async findById(id) {
      return users.find((user) => user.id === id) || null;
    },
    async list() {
      return users.map((user) => ({ ...user }));
    },
    async create(user) {
      users.push({ ...user });
      return user;
    },
    async update(updatedUser) {
      const index = users.findIndex((user) => user.id === updatedUser.id);
      users[index] = { ...updatedUser };
      return updatedUser;
    },
    async delete(id) {
      const index = users.findIndex((user) => user.id === id);
      users.splice(index, 1);
    }
  };
}

test("ensureUserSeeds registra un administrador por defecto", async () => {
  const repository = createUserRepository([]);

  await ensureUserSeeds(repository);

  assert.equal(repository.users.length, 1);
  assert.equal(repository.users[0].email, "admin@empresa.local");
});

test("registerUser registra un usuario y lo devuelve saneado", async () => {
  const repository = createUserRepository([]);

  const result = await registerUser(repository, {
    name: "Ana Torres",
    email: "  ANA@EMPRESA.LOCAL ",
    password: "Clave123",
    department: "Finanzas"
  });

  assert.equal(result.user.email, "ana@empresa.local");
  assert.equal(result.user.role, "Analista");
  assert.equal(result.user.department, "Finanzas");
  assert.equal(repository.users.length, 1);
  assert.equal("passwordHash" in result.user, false);
});

test("registerUser rechaza correos duplicados", async () => {
  const repository = createUserRepository([
    {
      id: "1",
      name: "Ana Torres",
      email: "ana@empresa.local",
      passwordHash: hashPassword("Clave123"),
      role: "Analista",
      department: "Operaciones",
      status: "Activo",
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  await assert.rejects(
    () =>
      registerUser(repository, {
        name: "Otro Nombre",
        email: "ANA@EMPRESA.LOCAL",
        password: "Clave456"
      }),
    { message: "Ya existe un usuario registrado con ese correo." }
  );
});

test("loginUser permite acceso con credenciales validas", async () => {
  const now = new Date().toISOString();
  const repository = createUserRepository([
    {
      id: "1",
      name: "Ana Torres",
      email: "ana@empresa.local",
      passwordHash: hashPassword("Clave123"),
      role: "Analista",
      department: "Operaciones",
      status: "Activo",
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now
    }
  ]);

  const result = await loginUser(repository, {
    email: "ana@empresa.local",
    password: "Clave123"
  });

  assert.equal(result.user.id, "1");
  assert.equal(result.user.lastLoginAt !== null, true);
});

test("loginUser falla con credenciales invalidas", async () => {
  const repository = createUserRepository([
    {
      id: "1",
      name: "Ana Torres",
      email: "ana@empresa.local",
      passwordHash: hashPassword("Clave123"),
      role: "Analista",
      department: "Operaciones",
      status: "Activo",
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  await assert.rejects(
    () =>
      loginUser(repository, {
        email: "ana@empresa.local",
        password: "incorrecta"
      }),
    { message: "Credenciales invalidas." }
  );
});

test("requestPasswordReset valida la existencia del correo", async () => {
  const repository = createUserRepository([]);

  await assert.rejects(
    () => requestPasswordReset(repository, { email: "nadie@empresa.local" }),
    { message: "No existe una cuenta asociada al correo indicado." }
  );
});

test("createUser y updateUser administran el catalogo de usuarios", async () => {
  const repository = createUserRepository([]);

  const created = await createUser(repository, {
    name: "Luis Mena",
    email: "luis@empresa.local",
    password: "Secreta1",
    role: "Soporte",
    department: "Mesa de ayuda",
    status: "Activo"
  });

  const updated = await updateUser(repository, created.user.id, {
    role: "Administrador",
    status: "Inactivo",
    department: "Operaciones"
  });

  assert.equal(updated.user.role, "Administrador");
  assert.equal(updated.user.status, "Inactivo");
  assert.equal(updated.user.department, "Operaciones");
  assert.equal((await listUsers(repository)).length, 1);
});

test("updateUser rechaza roles invalidos", async () => {
  const repository = createUserRepository([]);

  const created = await createUser(repository, {
    name: "Luis Mena",
    email: "luis@empresa.local",
    password: "Secreta1",
    role: "Soporte",
    department: "Mesa de ayuda",
    status: "Activo"
  });

  await assert.rejects(
    () => updateUser(repository, created.user.id, { role: "Director" }),
    { message: "El rol seleccionado no es valido." }
  );
});

test("deleteUser elimina usuarios existentes", async () => {
  const repository = createUserRepository([]);

  const created = await createUser(repository, {
    name: "Luis Mena",
    email: "luis@empresa.local",
    password: "Secreta1",
    role: "Soporte",
    department: "Mesa de ayuda",
    status: "Activo"
  });

  const result = await deleteUser(repository, created.user.id);

  assert.equal(result.message, "Usuario Luis Mena eliminado correctamente.");
  assert.equal((await listUsers(repository)).length, 0);
});

test("createUser valida nombres cortos como edge case", async () => {
  const repository = createUserRepository([]);

  await assert.rejects(
    () =>
      createUser(repository, {
        name: "Al",
        email: "al@empresa.local",
        password: "Secreta1",
        role: "Soporte",
        status: "Activo"
      }),
    { message: "El nombre debe tener al menos 3 caracteres." }
  );
});
