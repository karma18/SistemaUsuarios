import http from "node:http";
import { getServerConfig } from "./config.js";
import { createPool } from "./db.js";
import { createHealthPayload } from "./messageService.js";
import {
  createCustomerRepository,
  createSupplierRepository
} from "./repositories/partyRepository.js";
import { createUserRepository } from "./repositories/userRepository.js";
import {
  customerManager,
  ensurePartySeeds,
  getPartyCatalogs,
  supplierManager
} from "./partyService.js";
import {
  createUser,
  deleteUser,
  ensureUserSeeds,
  getUserCatalog,
  listUsers,
  loginUser,
  registerUser,
  requestPasswordReset,
  updateUser
} from "./userService.js";

const { port: PORT, host: HOST } = getServerConfig();
const pool = createPool();
const userRepository = createUserRepository(pool);
const customerRepository = createCustomerRepository(pool);
const supplierRepository = createSupplierRepository(pool);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });

  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > 1_000_000) {
        reject(new Error("El cuerpo de la solicitud excede el limite permitido."));
      }
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("El cuerpo de la solicitud no es JSON valido."));
      }
    });

    request.on("error", () => {
      reject(new Error("No fue posible leer la solicitud."));
    });
  });
}

async function handleRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const { pathname } = url;

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    response.end();
    return;
  }

  if (request.method === "GET" && pathname === "/api/health") {
    sendJson(response, 200, createHealthPayload());
    return;
  }

  if (request.method === "GET" && pathname === "/api/catalogs") {
    sendJson(response, 200, {
      ...getUserCatalog(),
      ...getPartyCatalogs()
    });
    return;
  }

  if (request.method === "POST" && pathname === "/api/auth/login") {
    const payload = await readJsonBody(request);
    sendJson(response, 200, await loginUser(userRepository, payload));
    return;
  }

  if (request.method === "POST" && pathname === "/api/auth/register") {
    const payload = await readJsonBody(request);
    sendJson(response, 201, await registerUser(userRepository, payload));
    return;
  }

  if (request.method === "POST" && pathname === "/api/auth/forgot-password") {
    const payload = await readJsonBody(request);
    sendJson(response, 200, await requestPasswordReset(userRepository, payload));
    return;
  }

  if (request.method === "GET" && pathname === "/api/users") {
    sendJson(response, 200, { users: await listUsers(userRepository) });
    return;
  }

  if (request.method === "POST" && pathname === "/api/users") {
    const payload = await readJsonBody(request);
    sendJson(response, 201, await createUser(userRepository, payload));
    return;
  }

  if (request.method === "PUT" && pathname.startsWith("/api/users/")) {
    const userId = pathname.replace("/api/users/", "");
    const payload = await readJsonBody(request);
    sendJson(response, 200, await updateUser(userRepository, userId, payload));
    return;
  }

  if (request.method === "DELETE" && pathname.startsWith("/api/users/")) {
    const userId = pathname.replace("/api/users/", "");
    sendJson(response, 200, await deleteUser(userRepository, userId));
    return;
  }

  if (request.method === "GET" && pathname === "/api/customers") {
    sendJson(response, 200, {
      customers: await customerManager.list(customerRepository)
    });
    return;
  }

  if (request.method === "POST" && pathname === "/api/customers") {
    const payload = await readJsonBody(request);
    sendJson(response, 201, await customerManager.create(customerRepository, payload));
    return;
  }

  if (request.method === "PUT" && pathname.startsWith("/api/customers/")) {
    const customerId = pathname.replace("/api/customers/", "");
    const payload = await readJsonBody(request);
    sendJson(
      response,
      200,
      await customerManager.update(customerRepository, customerId, payload)
    );
    return;
  }

  if (request.method === "DELETE" && pathname.startsWith("/api/customers/")) {
    const customerId = pathname.replace("/api/customers/", "");
    sendJson(
      response,
      200,
      await customerManager.remove(customerRepository, customerId)
    );
    return;
  }

  if (request.method === "GET" && pathname === "/api/suppliers") {
    sendJson(response, 200, {
      suppliers: await supplierManager.list(supplierRepository)
    });
    return;
  }

  if (request.method === "POST" && pathname === "/api/suppliers") {
    const payload = await readJsonBody(request);
    sendJson(response, 201, await supplierManager.create(supplierRepository, payload));
    return;
  }

  if (request.method === "PUT" && pathname.startsWith("/api/suppliers/")) {
    const supplierId = pathname.replace("/api/suppliers/", "");
    const payload = await readJsonBody(request);
    sendJson(
      response,
      200,
      await supplierManager.update(supplierRepository, supplierId, payload)
    );
    return;
  }

  if (request.method === "DELETE" && pathname.startsWith("/api/suppliers/")) {
    const supplierId = pathname.replace("/api/suppliers/", "");
    sendJson(
      response,
      200,
      await supplierManager.remove(supplierRepository, supplierId)
    );
    return;
  }

  sendJson(response, 404, {
    status: "error",
    message: "Recurso no encontrado"
  });
}

const server = http.createServer(async (request, response) => {
  try {
    await handleRequest(request, response);
  } catch (error) {
    const statusCode = error.statusCode || 400;

    sendJson(response, statusCode, {
      status: "error",
      message: error.message || "Ocurrio un error inesperado."
    });
  }
});

await ensureUserSeeds(userRepository);
await ensurePartySeeds(customerRepository, supplierRepository);

server.listen(PORT, HOST, () => {
  console.log(
    JSON.stringify({
      level: "info",
      event: "server_started",
      port: PORT,
      host: HOST
    })
  );
});
