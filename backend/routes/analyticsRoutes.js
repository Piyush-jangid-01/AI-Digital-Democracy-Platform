const express = require("express");
const router = express.Router();
const {
  generateAnalytics_,
  getAnalytics,
  getAllAnalytics_,
  getOverallStats_,
  getFeedbackByDateRange_,
  getSentimentDistribution_,
  getTopIssues_,
  getComplaintsByLocation_,
  getWorkerPerformance_
} = require("../controllers/analyticsController");

router.post("/generate/:constituency_id", generateAnalytics_);
router.get("/constituency/:constituency_id", getAnalytics);
router.get("/all", getAllAnalytics_);
router.get("/stats/overall", getOverallStats_);
router.get("/stats/sentiment", getSentimentDistribution_);
router.get("/stats/issues", getTopIssues_);
router.get("/stats/locations", getComplaintsByLocation_);
router.get("/stats/workers", getWorkerPerformance_);
router.get("/feedback/daterange", getFeedbackByDateRange_);

module.exports = router;