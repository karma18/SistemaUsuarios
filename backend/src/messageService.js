export function createHealthPayload(now = new Date().toISOString()) {
  return {
    status: "ok",
    service: "backend",
    message: "API de autenticacion y usuarios disponible",
    timestamp: now
  };
}
