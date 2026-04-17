import http from "node:http";
import { createHealthPayload } from "./messageService.js";
import {
  createPartyStore,
  customerManager,
  getPartyCatalogs,
  supplierManager
} from "./partyService.js";
import {
  createUser,
  createUserStore,
  deleteUser,
  getUserCatalog,
  listUsers,
  loginUser,
  registerUser,
  requestPasswordReset,
  updateUser
} from "./userService.js";

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";
const store = createUserStore();
const partyStore = createPartyStore();

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
    sendJson(response, 200, loginUser(store, payload));
    return;
  }

  if (request.method === "POST" && pathname === "/api/auth/register") {
    const payload = await readJsonBody(request);
    sendJson(response, 201, registerUser(store, payload));
    return;
  }

  if (request.method === "POST" && pathname === "/api/auth/forgot-password") {
    const payload = await readJsonBody(request);
    sendJson(response, 200, requestPasswordReset(store, payload));
    return;
  }

  if (request.method === "GET" && pathname === "/api/users") {
    sendJson(response, 200, { users: listUsers(store) });
    return;
  }

  if (request.method === "POST" && pathname === "/api/users") {
    const payload = await readJsonBody(request);
    sendJson(response, 201, createUser(store, payload));
    return;
  }

  if (request.method === "PUT" && pathname.startsWith("/api/users/")) {
    const userId = pathname.replace("/api/users/", "");
    const payload = await readJsonBody(request);
    sendJson(response, 200, updateUser(store, userId, payload));
    return;
  }

  if (request.method === "DELETE" && pathname.startsWith("/api/users/")) {
    const userId = pathname.replace("/api/users/", "");
    sendJson(response, 200, deleteUser(store, userId));
    return;
  }

  if (request.method === "GET" && pathname === "/api/customers") {
    sendJson(response, 200, { customers: customerManager.list(partyStore) });
    return;
  }

  if (request.method === "POST" && pathname === "/api/customers") {
    const payload = await readJsonBody(request);
    sendJson(response, 201, customerManager.create(partyStore, payload));
    return;
  }

  if (request.method === "PUT" && pathname.startsWith("/api/customers/")) {
    const customerId = pathname.replace("/api/customers/", "");
    const payload = await readJsonBody(request);
    sendJson(response, 200, customerManager.update(partyStore, customerId, payload));
    return;
  }

  if (request.method === "DELETE" && pathname.startsWith("/api/customers/")) {
    const customerId = pathname.replace("/api/customers/", "");
    sendJson(response, 200, customerManager.remove(partyStore, customerId));
    return;
  }

  if (request.method === "GET" && pathname === "/api/suppliers") {
    sendJson(response, 200, { suppliers: supplierManager.list(partyStore) });
    return;
  }

  if (request.method === "POST" && pathname === "/api/suppliers") {
    const payload = await readJsonBody(request);
    sendJson(response, 201, supplierManager.create(partyStore, payload));
    return;
  }

  if (request.method === "PUT" && pathname.startsWith("/api/suppliers/")) {
    const supplierId = pathname.replace("/api/suppliers/", "");
    const payload = await readJsonBody(request);
    sendJson(response, 200, supplierManager.update(partyStore, supplierId, payload));
    return;
  }

  if (request.method === "DELETE" && pathname.startsWith("/api/suppliers/")) {
    const supplierId = pathname.replace("/api/suppliers/", "");
    sendJson(response, 200, supplierManager.remove(partyStore, supplierId));
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
