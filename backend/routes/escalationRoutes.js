const express = require("express");
const router = express.Router();
const { checkEscalation, getEscalatedIssues } = require("../controllers/escalationController");
const { verifyToken } = require("../middleware/authMiddleware");
const { sendWeeklyReport } = require("../utils/scheduler");

router.post("/weekly-report", verifyToken, async (req, res) => {
  try {
    await sendWeeklyReport();
    res.status(200).json({ success: true, message: "Weekly report sent to admin email" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/run", verifyToken, checkEscalation);
router.get("/issues", verifyToken, getEscalatedIssues);

module.exports = router;