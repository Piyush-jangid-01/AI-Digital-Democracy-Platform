const {
  getVotersByAgeGroup,
  getVotersByGender,
  getVotersByBooth,
  getConstituencyOverview,
  getFeedbackSegmentByLocation,
  getWorkerSegmentByConstituency
} = require("../models/segmentationModel");
const logger = require("../utils/logger");

const getAgeSegmentation = async (req, res) => {
  try {
    const data = await getVotersByAgeGroup();
    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error(`Age segmentation error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getGenderSegmentation = async (req, res) => {
  try {
    const data = await getVotersByGender();
    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error(`Gender segmentation error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBoothSegmentation = async (req, res) => {
  try {
    const data = await getVotersByBooth();
    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error(`Booth segmentation error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getConstituencyOverview_ = async (req, res) => {
  try {
    const data = await getConstituencyOverview();
    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error(`Constituency overview error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFeedbackSegmentation = async (req, res) => {
  try {
    const data = await getFeedbackSegmentByLocation();
    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error(`Feedback segmentation error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWorkerSegmentation = async (req, res) => {
  try {
    const data = await getWorkerSegmentByConstituency();
    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error(`Worker segmentation error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAgeSegmentation,
  getGenderSegmentation,
  getBoothSegmentation,
  getConstituencyOverview_,
  getFeedbackSegmentation,
  getWorkerSegmentation
};