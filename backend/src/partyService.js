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

export function createPartyStore() {
  return {
    customers: createSeedCustomers(),
    suppliers: createSeedSuppliers()
  };
}

export function getPartyCatalogs() {
  return {
    statuses: [...ALLOWED_STATUSES],
    customerSegments: [...CUSTOMER_SEGMENTS],
    supplierCategories: [...SUPPLIER_CATEGORIES]
  };
}

function createPartyManager({
  storeKey,
  typeKey,
  label,
  allowedValues,
  optionFieldLabel
}) {
  function list(store) {
    return store[storeKey].map((item) => sanitizeParty(item, typeKey));
  }

  function create(store, payload) {
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

    if (store[storeKey].some((item) => item.email === email)) {
      throw buildError(`Ya existe un ${label} registrado con ese correo.`, 409);
    }

    const now = new Date().toISOString();
    const party = {
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

    store[storeKey].push(party);

    return {
      message: `${label} creado correctamente.`,
      item: sanitizeParty(party, typeKey)
    };
  }

  function update(store, partyId, payload) {
    const party = store[storeKey].find((item) => item.id === partyId);

    if (!party) {
      throw buildError(`${label} no encontrado.`, 404);
    }

    const name = normalizeText(payload?.name || party.name);
    const email = normalizeEmail(payload?.email || party.email);
    const phone = normalizeText(payload?.phone || party.phone);
    const city = normalizeText(payload?.city || party.city);
    const status = normalizeText(payload?.status || party.status);
    const typeValue = normalizeText(payload?.[typeKey] || party[typeKey]);

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

    const emailInUse = store[storeKey].some(
      (item) => item.id !== partyId && item.email === email
    );

    if (emailInUse) {
      throw buildError(`Ya existe un ${label} registrado con ese correo.`, 409);
    }

    party.name = name;
    party.email = email;
    party.phone = phone;
    party.city = city;
    party.status = status;
    party[typeKey] = typeValue;
    party.updatedAt = new Date().toISOString();

    return {
      message: `${label} actualizado correctamente.`,
      item: sanitizeParty(party, typeKey)
    };
  }

  function remove(store, partyId) {
    const index = store[storeKey].findIndex((item) => item.id === partyId);

    if (index === -1) {
      throw buildError(`${label} no encontrado.`, 404);
    }

    const [party] = store[storeKey].splice(index, 1);

    return {
      message: `${label} ${party.name} eliminado correctamente.`
    };
  }

  return {
    list,
    create,
    update,
    remove
  };
}

export const customerManager = createPartyManager({
  storeKey: "customers",
  typeKey: "segment",
  label: "cliente",
  allowedValues: CUSTOMER_SEGMENTS,
  optionFieldLabel: "segmento"
});

export const supplierManager = createPartyManager({
  storeKey: "suppliers",
  typeKey: "category",
  label: "proveedor",
  allowedValues: SUPPLIER_CATEGORIES,
  optionFieldLabel: "categoria"
});
