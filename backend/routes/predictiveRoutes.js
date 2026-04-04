const express = require("express");
const router = express.Router();
const {
  getFeedbackTrend_,
  getCategoryTrend_,
  getLocationRiskScore_,
  getEmergingIssues_,
  getWorkerEfficiencyTrend_,
  predictNextWeekIssues_
} = require("../controllers/predictiveController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/feedback-trend", verifyToken, getFeedbackTrend_);
router.get("/category-trend", verifyToken, getCategoryTrend_);
router.get("/location-risk", verifyToken, getLocationRiskScore_);
router.get("/emerging-issues", verifyToken, getEmergingIssues_);
router.get("/worker-efficiency", verifyToken, getWorkerEfficiencyTrend_);
router.get("/predict", verifyToken, predictNextWeekIssues_);

module.exports = router;