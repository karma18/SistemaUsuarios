import { randomUUID } from "node:crypto";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\-\s()]{8,20}$/;
const ALLOWED_STATUSES = ["Activo", "Inactivo"];
const CUSTOMER_SEGMENTS = ["Corporativo", "PyME", "Individual"];
const SUPPLIER_CATEGORIES = ["Tecnologia", "Logistica", "Servicios"];

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function buildError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validateName(name, label) {
  if (!name) {
    return `El nombre del ${label} es obligatorio.`;
  }

  if (name.length < 3) {
    return `El nombre del ${label} debe tener al menos 3 caracteres.`;
  }

  return "";
}

function validateEmail(email, label) {
  if (!email) {
    return `El correo del ${label} es obligatorio.`;
  }

  if (!EMAIL_PATTERN.test(email)) {
    return `El correo del ${label} no tiene un formato valido.`;
  }

  return "";
}

function validatePhone(phone, label) {
  if (!phone) {
    return `El telefono del ${label} es obligatorio.`;
  }

  if (!PHONE_PATTERN.test(phone)) {
    return `El telefono del ${label} no es valido.`;
  }

  return "";
}

function validateStatus(status, label) {
  if (!ALLOWED_STATUSES.includes(status)) {
    return `El estado del ${label} no es valido.`;
  }

  return "";
}

function validateOption(value, allowedValues, fieldLabel) {
  if (!allowedValues.includes(value)) {
    return `La opcion seleccionada para ${fieldLabel} no es valida.`;
  }

  return "";
}

function sanitizeParty(party, typeKey) {
  return {
    id: party.id,
    name: party.name,
    email: party.email,
    phone: party.phone,
    city: party.city,
    status: party.status,
    createdAt: party.createdAt,
    updatedAt: party.updatedAt,
    [typeKey]: party[typeKey]
  };
}

function createSeedCustomers() {
  const now = new Date().toISOString();

  return [
    {
      id: randomUUID(),
      name: "Grupo Horizonte",
      email: "contacto@horizonte.local",
      phone: "+52 55 1111 2222",
      city: "Ciudad de Mexico",
      segment: "Corporativo",
      status: "Activo",
      createdAt: now,
      updatedAt: now
    }
  ];
}

function createSeedSuppliers() {
  const now = new Date().toISOString();

  return [
    {
      id: randomUUID(),
      name: "Servicios Delta",
      email: "ventas@delta.local",
      phone: "+52 81 3333 4444",
      city: "Monterrey",
      category: "Servicios",
      status: "Activo",
      createdAt: now,
      updatedAt: now
    }
  ];
}

export function getPartyCatalogs() {
  return {
    statuses: [...ALLOWED_STATUSES],
    customerSegments: [...CUSTOMER_SEGMENTS],
    supplierCategories: [...SUPPLIER_CATEGORIES]
  };
}

export async function ensurePartySeeds(customerRepository, supplierRepository) {
  const customerSeed = createSeedCustomers()[0];
  const supplierSeed = createSeedSuppliers()[0];
  const existingCustomer = await customerRepository.findByEmail(customerSeed.email);
  const existingSupplier = await supplierRepository.findByEmail(supplierSeed.email);

  if (!existingCustomer) {
    await customerRepository.create(customerSeed);
  }

  if (!existingSupplier) {
    await supplierRepository.create(supplierSeed);
  }
}

function createPartyManager({ typeKey, label, allowedValues, optionFieldLabel }) {
  async function list(repository) {
    const items = await repository.list();
    return items.map((item) => sanitizeParty(item, typeKey));
  }

  async function create(repository, payload) {
    const name = normalizeText(payload?.name);
    const email = normalizeEmail(payload?.email);
    const phone = normalizeText(payload?.phone);
    const city = normalizeText(payload?.city) || "No especificada";
    const status = normalizeText(payload?.status) || "Activo";
    const typeValue = normalizeText(payload?.[typeKey]);

    const nameError = validateName(name, label);
    const emailError = validateEmail(email, label);
    const phoneError = validatePhone(phone, label);
    const statusError = validateStatus(status, label);
    const optionError = validateOption(typeValue, allowedValues, optionFieldLabel);

    if (nameError || emailError || phoneError || statusError || optionError) {
      throw buildError(
        nameError || emailError || phoneError || statusError || optionError
      );
    }

    const existingItem = await repository.findByEmail(email);

    if (existingItem) {
      throw buildError(`Ya existe un ${label} registrado con ese correo.`, 409);
    }

    const now = new Date().toISOString();
    const item = {
      id: randomUUID(),
      name,
      email,
      phone,
      city,
      status,
      [typeKey]: typeValue,
      createdAt: now,
      updatedAt: now
    };

    await repository.create(item);

    return {
      message: `${label} creado correctamente.`,
      item: sanitizeParty(item, typeKey)
    };
  }

  async function update(repository, partyId, payload) {
    const currentItem = await repository.findById(partyId);

    if (!currentItem) {
      throw buildError(`${label} no encontrado.`, 404);
    }

    const name = normalizeText(payload?.name || currentItem.name);
    const email = normalizeEmail(payload?.email || currentItem.email);
    const phone = normalizeText(payload?.phone || currentItem.phone);
    const city = normalizeText(payload?.city || currentItem.city);
    const status = normalizeText(payload?.status || currentItem.status);
    const typeValue = normalizeText(payload?.[typeKey] || currentItem[typeKey]);

    const nameError = validateName(name, label);
    const emailError = validateEmail(email, label);
    const phoneError = validatePhone(phone, label);
    const statusError = validateStatus(status, label);
    const optionError = validateOption(typeValue, allowedValues, optionFieldLabel);

    if (nameError || emailError || phoneError || statusError || optionError) {
      throw buildError(
        nameError || emailError || phoneError || statusError || optionError
      );
    }

    const existingItem = await repository.findByEmail(email);

    if (existingItem && existingItem.id !== partyId) {
      throw buildError(`Ya existe un ${label} registrado con ese correo.`, 409);
    }

    const updatedItem = {
      ...currentItem,
      name,
      email,
      phone,
      city,
      status,
      [typeKey]: typeValue,
      updatedAt: new Date().toISOString()
    };

    await repository.update(updatedItem);

    return {
      message: `${label} actualizado correctamente.`,
      item: sanitizeParty(updatedItem, typeKey)
    };
  }

  async function remove(repository, partyId) {
    const currentItem = await repository.findById(partyId);

    if (!currentItem) {
      throw buildError(`${label} no encontrado.`, 404);
    }

    await repository.delete(partyId);

    return {
      message: `${label} ${currentItem.name} eliminado correctamente.`
    };
  }

  return { list, create, update, remove };
}

export const customerManager = createPartyManager({
  typeKey: "segment",
  label: "cliente",
  allowedValues: CUSTOMER_SEGMENTS,
  optionFieldLabel: "segmento"
});

export const supplierManager = createPartyManager({
  typeKey: "category",
  label: "proveedor",
  allowedValues: SUPPLIER_CATEGORIES,
  optionFieldLabel: "categoria"
});
