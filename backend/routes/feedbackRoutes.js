const express = require("express");
const router = express.Router();
const {
  addFeedback,
  getFeedback,
  getFeedbackByCategory_,
  getFeedbackByLocation_,
  getFeedbackBySentiment_,
  searchFeedback_,
  getFeedbackPaginated_,
  exportFeedbackCSV,
  getFeedbackByTopic_,
  getTopicStats_,
  getEmotionStats_
} = require("../controllers/feedbackController");
const upload = require("../middleware/uploadMiddleware");
const { getUrgencyScores_ } = require("../controllers/feedbackController");
// in feedbackRoutes.js
const { summarizeFeedback } = require("../controllers/feedbackController");



router.post("/", upload.single("image"), addFeedback);
router.get("/", getFeedback);
router.get("/paginated", getFeedbackPaginated_);
router.get("/export/csv", exportFeedbackCSV);
router.get("/search", searchFeedback_);
router.get("/stats/topics", getTopicStats_);
router.get("/stats/emotions", getEmotionStats_);
router.get("/category/:category", getFeedbackByCategory_);
router.get("/location/:location", getFeedbackByLocation_);
router.get("/sentiment/:sentiment", getFeedbackBySentiment_);
router.get("/topic/:topic", getFeedbackByTopic_);
router.get("/stats/urgency", getUrgencyScores_);
router.post("/summarize", summarizeFeedback);

module.exports = router;