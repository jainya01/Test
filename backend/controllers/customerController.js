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

  const totalLimit = callers.length * limitPerCaller;

  const [customers] = await pool.query(
    `SELECT id FROM customers
     WHERE caller_id IS NULL
     LIMIT ${totalLimit}`,
  );

  let index = 0;

  for (const caller of callers) {
    const batch = customers.slice(index, index + limitPerCaller);

    for (const customer of batch) {
      await pool.execute("UPDATE customers SET caller_id=? WHERE id=?", [
        caller.id,
        customer.id,
      ]);
    }

    index += limitPerCaller;
  }

  res.status(200).json({
    success: true,
    message: "Numbers allotted successfully",
  });
});

export default assignCustomLeads;
