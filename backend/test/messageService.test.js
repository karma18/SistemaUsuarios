import test from "node:test";
import assert from "node:assert/strict";
import { createHealthPayload } from "../src/messageService.js";

test("createHealthPayload devuelve el estado esperado", () => {
  const payload = createHealthPayload("2026-04-16T00:00:00.000Z");

  assert.deepEqual(payload, {
    status: "ok",
    service: "backend",
    message: "API de autenticacion y usuarios disponible",
    timestamp: "2026-04-16T00:00:00.000Z"
  });
});

test("createHealthPayload genera un timestamp ISO cuando no se envia uno", () => {
  const payload = createHealthPayload();

  assert.equal(payload.status, "ok");
  assert.equal(payload.service, "backend");
  assert.match(
    payload.timestamp,
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
  );
});
