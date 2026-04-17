import "dotenv/config";

function requireEnv(name, fallback = "") {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`La variable de entorno ${name} es obligatoria.`);
  }

  return value;
}

export function getDatabaseConfig() {
  return {
    host: requireEnv("DB_HOST", "127.0.0.1"),
    port: Number(requireEnv("DB_PORT", "3306")),
    user: requireEnv("DB_USER", "root"),
    password: process.env.DB_PASSWORD ?? "",
    database: requireEnv("DB_NAME", "sistema_usuarios"),
    connectionLimit: Number(requireEnv("DB_CONNECTION_LIMIT", "10"))
  };
}

export function getServerConfig() {
  return {
    port: Number(process.env.PORT || 3001),
    host: process.env.HOST || "0.0.0.0"
  };
}

