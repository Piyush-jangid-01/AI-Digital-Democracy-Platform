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
  getTopicStats_
} = require("../controllers/feedbackController");
const { validateFeedback } = require("../middleware/validateMiddleware");

router.post("/", validateFeedback, addFeedback);
router.get("/", getFeedback);
router.get("/paginated", getFeedbackPaginated_);
router.get("/export/csv", exportFeedbackCSV);
router.get("/search", searchFeedback_);
router.get("/category/:category", getFeedbackByCategory_);
router.get("/location/:location", getFeedbackByLocation_);
router.get("/sentiment/:sentiment", getFeedbackBySentiment_);
router.get("/topic/:topic", getFeedbackByTopic_);
router.get("/stats/topics", getTopicStats_);

module.exports = router;