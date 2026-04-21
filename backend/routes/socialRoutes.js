const express = require("express");
const router = express.Router();
const { getSocialSentiment } = require("../../ai-services/socialMediaService");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/sentiment", verifyToken, async (req, res) => {
  try {
    const keywords = req.query.keywords
      ? req.query.keywords.split(",").map(k => k.trim())
      : ["Faridabad civic", "Faridabad municipality", "Haryana government"];

    const result = await getSocialSentiment(keywords);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;