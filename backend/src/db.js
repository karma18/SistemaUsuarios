import mysql from "mysql2/promise";
import { getDatabaseConfig } from "./config.js";

export function createAdminConnection() {
  const config = getDatabaseConfig();

  return mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    multipleStatements: true
  });
}

export function createPool() {
  const config = getDatabaseConfig();

  return mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    connectionLimit: config.connectionLimit,
    waitForConnections: true,
    namedPlaceholders: false
  });
}
