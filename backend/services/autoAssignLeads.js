import pool from "../config/db.js";
const LIMIT_PER_CALLER = 100;

const autoAssignLeads = async (callerIds = null) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    let callers = [];

    if (Array.isArray(callerIds) && callerIds.length > 0) {
      const placeholders = callerIds.map(() => "?").join(",");
      const [rows] = await connection.query(
        `SELECT id, fullname
         FROM caller
         WHERE id IN (${placeholders})
         ORDER BY id ASC`,
        callerIds,
      );

      callers = rows;
    } else {
      const [rows] = await connection.query(
        `SELECT id, fullname
         FROM caller
         ORDER BY id ASC`,
      );

      callers = rows;
    }

    if (!callers.length) {
      await connection.commit();
      return;
    }

    for (const caller of callers) {
      const [assignedRows] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM customers
         WHERE caller_id = ?
         AND current_status = 'New'`,
        [caller.id],
      );

      const assigned = assignedRows[0].total;
      if (assigned > 0) {
        continue;
      }

      const [availableLeads] = await connection.query(
        `SELECT id
          FROM customers
          WHERE caller_id IS NULL
          AND current_status = 'New'
          ORDER BY id ASC
          LIMIT ?`,
        [LIMIT_PER_CALLER],
      );

      if (!availableLeads.length) continue;
      const ids = availableLeads.map((lead) => lead.id);
      await connection.query(
        `UPDATE customers
         SET
            caller_id = ?,
            assigned_at = NOW()
         WHERE id IN (?)`,
        [caller.id, ids],
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("AUTO ASSIGN ERROR:", error);
    throw error;
  } finally {
    connection.release();
  }
};

export default autoAssignLeads;
