import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDatabaseConfig } from "../config.js";
import { createAdminConnection } from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationPath = path.resolve(__dirname, "../../migrations/001_init_schema.sql");

const { database } = getDatabaseConfig();
const rawSql = await readFile(migrationPath, "utf8");
const sql = rawSql.replaceAll("__DB_NAME__", database);
const connection = await createAdminConnection();

try {
  await connection.query(sql);
  console.log(
    JSON.stringify({
      level: "info",
      event: "migration_completed",
      file: "001_init_schema.sql"
    })
  );
} finally {
  await connection.end();
}
