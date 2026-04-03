const express = require("express");
const router = express.Router();
const { addFeedback } = require("../controllers/feedbackController");

router.post("/", addFeedback);

module.exports = router;