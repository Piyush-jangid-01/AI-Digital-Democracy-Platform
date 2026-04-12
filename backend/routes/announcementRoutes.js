const express = require("express");
const router = express.Router();
const { addAnnouncement, getAnnouncements, getAnnouncementsForConstituency, removeAnnouncement } = require("../controllers/announcementController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, addAnnouncement);
router.get("/", getAnnouncements);
router.get("/constituency/:constituency_id", getAnnouncementsForConstituency);
router.delete("/:id", verifyToken, removeAnnouncement);

module.exports = router;