import { fromMysqlDateTime, toMysqlDateTime } from "./dateMapper.js";

function mapParty(row, typeKey) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    status: row.status,
    createdAt: fromMysqlDateTime(row.created_at),
    updatedAt: fromMysqlDateTime(row.updated_at),
    [typeKey]: row[typeKey]
  };
}

function createPartyRepository(pool, tableName, typeKey) {
  return {
    async findByEmail(email) {
      const [rows] = await pool.execute(
        `SELECT id, name, email, phone, city, status, ${typeKey},
                created_at, updated_at
           FROM ${tableName}
          WHERE email = ?`,
        [email]
      );

      return rows[0] ? mapParty(rows[0], typeKey) : null;
    },

    async findById(id) {
      const [rows] = await pool.execute(
        `SELECT id, name, email, phone, city, status, ${typeKey},
                created_at, updated_at
           FROM ${tableName}
          WHERE id = ?`,
        [id]
      );

      return rows[0] ? mapParty(rows[0], typeKey) : null;
    },

    async list() {
      const [rows] = await pool.execute(
        `SELECT id, name, email, phone, city, status, ${typeKey},
                created_at, updated_at
           FROM ${tableName}
       ORDER BY created_at DESC`
      );

      return rows.map((row) => mapParty(row, typeKey));
    },

    async create(item) {
      await pool.execute(
        `INSERT INTO ${tableName}
         (id, name, email, phone, city, ${typeKey}, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.name,
          item.email,
          item.phone,
          item.city,
          item[typeKey],
          item.status,
          toMysqlDateTime(item.createdAt),
          toMysqlDateTime(item.updatedAt)
        ]
      );

      return item;
    },

    async update(item) {
      await pool.execute(
        `UPDATE ${tableName}
            SET name = ?, email = ?, phone = ?, city = ?, ${typeKey} = ?,
                status = ?, updated_at = ?
          WHERE id = ?`,
        [
          item.name,
          item.email,
          item.phone,
          item.city,
          item[typeKey],
          item.status,
          toMysqlDateTime(item.updatedAt),
          item.id
        ]
      );

      return item;
    },

    async delete(id) {
      await pool.execute(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
    }
  };
}

export function createCustomerRepository(pool) {
  return createPartyRepository(pool, "customers", "segment");
}

export function createSupplierRepository(pool) {
  return createPartyRepository(pool, "suppliers", "category");
}
