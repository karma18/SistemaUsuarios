import { fromMysqlDateTime, toMysqlDateTime } from "./dateMapper.js";

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    department: row.department,
    status: row.status,
    lastLoginAt: fromMysqlDateTime(row.last_login_at),
    createdAt: fromMysqlDateTime(row.created_at),
    updatedAt: fromMysqlDateTime(row.updated_at)
  };
}

export function createUserRepository(pool) {
  return {
    async findByEmail(email) {
      const [rows] = await pool.execute(
        `SELECT id, name, email, password_hash, role, department, status,
                last_login_at, created_at, updated_at
           FROM users
          WHERE email = ?`,
        [email]
      );

      return rows[0] ? mapUser(rows[0]) : null;
    },

    async findById(id) {
      const [rows] = await pool.execute(
        `SELECT id, name, email, password_hash, role, department, status,
                last_login_at, created_at, updated_at
           FROM users
          WHERE id = ?`,
        [id]
      );

      return rows[0] ? mapUser(rows[0]) : null;
    },

    async list() {
      const [rows] = await pool.execute(
        `SELECT id, name, email, password_hash, role, department, status,
                last_login_at, created_at, updated_at
           FROM users
       ORDER BY created_at DESC`
      );

      return rows.map(mapUser);
    },

    async create(user) {
      await pool.execute(
        `INSERT INTO users
         (id, name, email, password_hash, role, department, status,
          last_login_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.name,
          user.email,
          user.passwordHash,
          user.role,
          user.department,
          user.status,
          toMysqlDateTime(user.lastLoginAt),
          toMysqlDateTime(user.createdAt),
          toMysqlDateTime(user.updatedAt)
        ]
      );

      return user;
    },

    async update(user) {
      await pool.execute(
        `UPDATE users
            SET name = ?, email = ?, password_hash = ?, role = ?, department = ?,
                status = ?, last_login_at = ?, updated_at = ?
          WHERE id = ?`,
        [
          user.name,
          user.email,
          user.passwordHash,
          user.role,
          user.department,
          user.status,
          toMysqlDateTime(user.lastLoginAt),
          toMysqlDateTime(user.updatedAt),
          user.id
        ]
      );

      return user;
    },

    async delete(id) {
      await pool.execute("DELETE FROM users WHERE id = ?", [id]);
    }
  };
}
