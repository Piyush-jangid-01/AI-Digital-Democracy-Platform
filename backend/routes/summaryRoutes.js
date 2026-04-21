const express = require("express");
const router = express.Router();
const { getSummary } = require("../controllers/summaryController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/overall", verifyToken, getSummary);

module.exports = router;