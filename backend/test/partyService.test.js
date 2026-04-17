import test from "node:test";
import assert from "node:assert/strict";
import {
  customerManager,
  ensurePartySeeds,
  supplierManager
} from "../src/partyService.js";

function createPartyRepository(initialItems = []) {
  const items = initialItems.map((item) => ({ ...item }));

  return {
    items,
    async findByEmail(email) {
      return items.find((item) => item.email === email) || null;
    },
    async findById(id) {
      return items.find((item) => item.id === id) || null;
    },
    async list() {
      return items.map((item) => ({ ...item }));
    },
    async create(item) {
      items.push({ ...item });
      return item;
    },
    async update(updatedItem) {
      const index = items.findIndex((item) => item.id === updatedItem.id);
      items[index] = { ...updatedItem };
      return updatedItem;
    },
    async delete(id) {
      const index = items.findIndex((item) => item.id === id);
      items.splice(index, 1);
    }
  };
}

test("ensurePartySeeds registra cliente y proveedor base", async () => {
  const customerRepository = createPartyRepository([]);
  const supplierRepository = createPartyRepository([]);

  await ensurePartySeeds(customerRepository, supplierRepository);

  assert.equal(customerRepository.items.length, 1);
  assert.equal(supplierRepository.items.length, 1);
});

test("customerManager crea y lista clientes", async () => {
  const repository = createPartyRepository([]);

  const result = await customerManager.create(repository, {
    name: "Industrias Nova",
    email: "contacto@nova.local",
    phone: "+52 55 9999 8888",
    city: "Queretaro",
    segment: "PyME",
    status: "Activo"
  });

  assert.equal(result.item.segment, "PyME");
  assert.equal((await customerManager.list(repository)).length, 1);
});

test("customerManager rechaza correos duplicados", async () => {
  const repository = createPartyRepository([
    {
      id: "1",
      name: "Grupo Horizonte",
      email: "contacto@horizonte.local",
      phone: "+52 55 1111 2222",
      city: "Ciudad de Mexico",
      segment: "Corporativo",
      status: "Activo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  await assert.rejects(
    () =>
      customerManager.create(repository, {
        name: "Nuevo Cliente",
        email: "contacto@horizonte.local",
        phone: "+52 55 9999 7777",
        city: "Puebla",
        segment: "Individual",
        status: "Activo"
      }),
    { message: "Ya existe un cliente registrado con ese correo." }
  );
});

test("customerManager actualiza clientes existentes", async () => {
  const repository = createPartyRepository([
    {
      id: "1",
      name: "Grupo Horizonte",
      email: "contacto@horizonte.local",
      phone: "+52 55 1111 2222",
      city: "Ciudad de Mexico",
      segment: "Corporativo",
      status: "Activo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const result = await customerManager.update(repository, "1", {
    city: "Guadalajara",
    segment: "PyME",
    status: "Inactivo"
  });

  assert.equal(result.item.city, "Guadalajara");
  assert.equal(result.item.segment, "PyME");
  assert.equal(result.item.status, "Inactivo");
});

test("supplierManager crea y elimina proveedores", async () => {
  const repository = createPartyRepository([]);

  const created = await supplierManager.create(repository, {
    name: "Logistica Norte",
    email: "contacto@norte.local",
    phone: "+52 81 7777 1111",
    city: "Saltillo",
    category: "Logistica",
    status: "Activo"
  });

  const deleted = await supplierManager.remove(repository, created.item.id);

  assert.equal(
    deleted.message,
    "proveedor Logistica Norte eliminado correctamente."
  );
  assert.equal((await supplierManager.list(repository)).length, 0);
});

test("supplierManager valida categorias invalidas como edge case", async () => {
  const repository = createPartyRepository([]);

  await assert.rejects(
    () =>
      supplierManager.create(repository, {
        name: "Proveedor X",
        email: "x@local.local",
        phone: "+52 81 1212 3434",
        city: "Merida",
        category: "Manufactura",
        status: "Activo"
      }),
    { message: "La opcion seleccionada para categoria no es valida." }
  );
});
