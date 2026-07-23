import asyncHandler from "../config/asyncHandler.js";
import autoAssignLeads from "../services/autoAssignLeads.js";

const customerController = asyncHandler(async (req, res) => {
  const { callerIds } = req.body;
  await autoAssignLeads(callerIds);
  return res.status(200).json({
    success: true,
    message: "Auto refill completed.",
  });
});

export default customerController;
