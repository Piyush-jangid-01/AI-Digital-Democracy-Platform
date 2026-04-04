const {
  getFeedbackTrend,
  getCategoryTrend,
  getLocationRiskScore,
  getEmergingIssues,
  getWorkerEfficiencyTrend,
  predictNextWeekIssues
} = require("../models/predictiveModel");
const logger = require("../utils/logger");

const getFeedbackTrend_ = async (req, res) => {
  try {
    const data = await getFeedbackTrend();
    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error(`Feedback trend error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCategoryTrend_ = async (req, res) => {
  try {
    const data = await getCategoryTrend();
    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error(`Category trend error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLocationRiskScore_ = async (req, res) => {
  try {
    const data = await getLocationRiskScore();
    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error(`Location risk score error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEmergingIssues_ = async (req, res) => {
  try {
    const data = await getEmergingIssues();
    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error(`Emerging issues error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWorkerEfficiencyTrend_ = async (req, res) => {
  try {
    const data = await getWorkerEfficiencyTrend();
    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error(`Worker efficiency error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const predictNextWeekIssues_ = async (req, res) => {
  try {
    const data = await predictNextWeekIssues();
    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error(`Prediction error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFeedbackTrend_,
  getCategoryTrend_,
  getLocationRiskScore_,
  getEmergingIssues_,
  getWorkerEfficiencyTrend_,
  predictNextWeekIssues_
};