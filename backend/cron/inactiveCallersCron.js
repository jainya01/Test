import cron from "node-cron";
import pool from "../config/db.js";
import redisClient from "../config/redisClient.js";

cron.schedule("*/10 * * * *", async () => {
  try {
    await pool.execute(`
      UPDATE caller c
      SET c.status = 'Inactive'
      WHERE NOT EXISTS (
        SELECT 1
        FROM call_logs cl
        WHERE cl.caller_id = c.id
          AND cl.created_at >= NOW() - INTERVAL 10 MINUTE
      )
    `);

    await redisClient.del("crm1:allcallers:all");

    console.log("Inactive callers updated successfully");
  } catch (error) {
    console.error("Cron Error:", error.message);
  }
});
