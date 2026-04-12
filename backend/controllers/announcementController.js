const { createAnnouncement, getAllAnnouncements, getAnnouncementsByConstituency, deleteAnnouncement } = require("../models/announcementModel");
const logger = require("../utils/logger");

const addAnnouncement = async (req, res) => {
  try {
    const { title, content, constituency_id } = req.body;
    const announcement = await createAnnouncement(title, content, constituency_id || null, req.user.id);
    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    logger.error(`Announcement error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await getAllAnnouncements();
    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAnnouncementsForConstituency = async (req, res) => {
  try {
    const announcements = await getAnnouncementsByConstituency(req.params.constituency_id);
    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeAnnouncement = async (req, res) => {
  try {
    await deleteAnnouncement(req.params.id);
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addAnnouncement, getAnnouncements, getAnnouncementsForConstituency, removeAnnouncement };