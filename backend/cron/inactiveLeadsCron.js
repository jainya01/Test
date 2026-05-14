import cron from "node-cron";
import pool from "../config/db.js";

cron.schedule("0 0 * * *", async () => {
  try {
    await pool.execute(`
      UPDATE customers
      SET caller_id = NULL,
          assigned_at = NULL
      WHERE caller_id IS NOT NULL
        AND status IS NULL
        AND assigned_at <= NOW() - INTERVAL 10 DAY
    `);

    console.log("Inactive leads unassigned successfully");
  } catch (error) {
    console.log("Cron Error:", error.message);
  }
});

export default cron;
