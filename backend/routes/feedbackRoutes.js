const express = require("express");
const router = express.Router();
const {
  addFeedback, getMyFeedback,
  updateFeedbackStatus_, updateFeedbackPriority_, assignFeedbackWorker_,
  getFeedback, getFeedbackByCategory_, getFeedbackByLocation_,
  getFeedbackBySentiment_, searchFeedback_, getFeedbackPaginated_,
  exportFeedbackCSV, getFeedbackByTopic_, getTopicStats_
} = require("../controllers/feedbackController");
const { verifyToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public — optionally attach user if logged in
router.post("/", upload.single("image"), (req, res, next) => {
  const token = req.headers["authorization"];
  if (token) {
    const jwt = require("jsonwebtoken");
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch (e) {}
  }
  next();
}, addFeedback);

// Citizen
router.get("/mine", verifyToken, getMyFeedback);

// Admin
router.get("/", getFeedback);
router.get("/paginated", getFeedbackPaginated_);
router.get("/export/csv", exportFeedbackCSV);
router.get("/search", searchFeedback_);
router.get("/stats/topics", getTopicStats_);
router.get("/category/:category", getFeedbackByCategory_);
router.get("/location/:location", getFeedbackByLocation_);
router.get("/sentiment/:sentiment", getFeedbackBySentiment_);
router.get("/topic/:topic", getFeedbackByTopic_);
router.patch("/:id/status", verifyToken, updateFeedbackStatus_);
router.patch("/:id/priority", verifyToken, updateFeedbackPriority_);
router.patch("/:id/assign", verifyToken, assignFeedbackWorker_);

module.exports = router;