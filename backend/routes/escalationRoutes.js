const express = require("express");
const router = express.Router();
const { checkEscalation, getEscalatedIssues } = require("../controllers/escalationController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/run", verifyToken, checkEscalation);
router.get("/issues", verifyToken, getEscalatedIssues);

module.exports = router;