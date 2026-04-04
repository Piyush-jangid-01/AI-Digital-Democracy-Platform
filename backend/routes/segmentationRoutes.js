const express = require("express");
const router = express.Router();
const {
  getAgeSegmentation,
  getGenderSegmentation,
  getBoothSegmentation,
  getConstituencyOverview_,
  getFeedbackSegmentation,
  getWorkerSegmentation
} = require("../controllers/segmentationController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/age", verifyToken, getAgeSegmentation);
router.get("/gender", verifyToken, getGenderSegmentation);
router.get("/booth", verifyToken, getBoothSegmentation);
router.get("/constituency", verifyToken, getConstituencyOverview_);
router.get("/feedback", verifyToken, getFeedbackSegmentation);
router.get("/workers", verifyToken, getWorkerSegmentation);

module.exports = router;