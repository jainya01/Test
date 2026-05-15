import asyncHandler from "../config/asyncHandler.js";
import pool from "../config/db.js";

const assignCustomLeads = asyncHandler(async (req, res) => {
  const limitPerCaller = 5;
  const { callerIds } = req.body;
  let callers;

  if (callerIds && callerIds.length > 0) {
    [callers] = await pool.query(
      `SELECT id, fullname
       FROM caller
       WHERE id IN (${callerIds.map(() => "?").join(",")})`,
      callerIds,
    );
  } else {
    [callers] = await pool.query("SELECT id, fullname FROM caller");
  }

  for (const caller of callers) {
    const [activeLeads] = await pool.execute(
      `SELECT COUNT(*) AS total
        FROM customers
        WHERE caller_id = ?
        AND current_status = 'New'`,
      [caller.id],
    );
    const remaining = activeLeads[0].total;

    if (remaining <= 0) {
      const [newCustomers] = await pool.query(
        `SELECT id
          FROM customers
          WHERE caller_id IS NULL
          AND current_status = 'New'
          LIMIT ?`,
        [limitPerCaller],
      );

      for (const customer of newCustomers) {
        await pool.execute(
          `UPDATE customers
           SET caller_id=?, assigned_at=NOW()
           WHERE id=?`,
          [caller.id, customer.id],
        );
      }
    }
  }

  res.status(200).json({
    success: true,
    message: "Auto refill completed",
  });
});

export default assignCustomLeads;
