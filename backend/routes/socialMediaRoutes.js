const express = require("express");
const router = express.Router();
const {
  getSocialMediaPosts,
  importSocialMediaToFeedback,
  getSocialMediaStats_
} = require("../controllers/socialMediaController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/posts", verifyToken, getSocialMediaPosts);
router.post("/import", verifyToken, importSocialMediaToFeedback);
router.get("/stats", verifyToken, getSocialMediaStats_);

module.exports = router;