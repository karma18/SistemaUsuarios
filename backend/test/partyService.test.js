import test from "node:test";
import assert from "node:assert/strict";
import {
  createPartyStore,
  customerManager,
  supplierManager
} from "../src/partyService.js";

test("customerManager crea y lista clientes", () => {
  const store = createPartyStore();

  const result = customerManager.create(store, {
    name: "Industrias Nova",
    email: "contacto@nova.local",
    phone: "+52 55 9999 8888",
    city: "Queretaro",
    segment: "PyME",
    status: "Activo"
  });

  assert.equal(result.item.segment, "PyME");
  assert.equal(customerManager.list(store).length, 2);
});

test("customerManager rechaza correos duplicados", () => {
  const store = createPartyStore();

  assert.throws(
    () =>
      customerManager.create(store, {
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

test("customerManager actualiza clientes existentes", () => {
  const store = createPartyStore();
  const [customer] = customerManager.list(store);

  const result = customerManager.update(store, customer.id, {
    city: "Guadalajara",
    segment: "PyME",
    status: "Inactivo"
  });

  assert.equal(result.item.city, "Guadalajara");
  assert.equal(result.item.segment, "PyME");
  assert.equal(result.item.status, "Inactivo");
});

test("supplierManager crea y elimina proveedores", () => {
  const store = createPartyStore();

  const created = supplierManager.create(store, {
    name: "Logistica Norte",
    email: "contacto@norte.local",
    phone: "+52 81 7777 1111",
    city: "Saltillo",
    category: "Logistica",
    status: "Activo"
  });

  const deleted = supplierManager.remove(store, created.item.id);

  assert.equal(
    deleted.message,
    "proveedor Logistica Norte eliminado correctamente."
  );
  assert.equal(supplierManager.list(store).length, 1);
});

test("supplierManager valida categorias invalidas como edge case", () => {
  const store = createPartyStore();

  assert.throws(
    () =>
      supplierManager.create(store, {
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
