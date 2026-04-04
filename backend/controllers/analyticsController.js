const {
  generateAnalytics,
  getAnalyticsByConstituency,
  getAllAnalytics,
  getOverallStats,
  getFeedbackByDateRange,
  getSentimentDistribution,
  getTopIssues,
  getComplaintsByLocation,
  getWorkerPerformance
} = require("../models/analyticsModel");

const generateAnalytics_ = async (req, res) => {
  try {
    const analytics = await generateAnalytics(req.params.constituency_id);
    res.status(201).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const analytics = await getAnalyticsByConstituency(req.params.constituency_id);
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllAnalytics_ = async (req, res) => {
  try {
    const analytics = await getAllAnalytics();
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOverallStats_ = async (req, res) => {
  try {
    const stats = await getOverallStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFeedbackByDateRange_ = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const feedback = await getFeedbackByDateRange(start_date, end_date);
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSentimentDistribution_ = async (req, res) => {
  try {
    const distribution = await getSentimentDistribution();
    res.status(200).json({ success: true, data: distribution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTopIssues_ = async (req, res) => {
  try {
    const issues = await getTopIssues();
    res.status(200).json({ success: true, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getComplaintsByLocation_ = async (req, res) => {
  try {
    const complaints = await getComplaintsByLocation();
    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWorkerPerformance_ = async (req, res) => {
  try {
    const performance = await getWorkerPerformance();
    res.status(200).json({ success: true, data: performance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateAnalytics_,
  getAnalytics,
  getAllAnalytics_,
  getOverallStats_,
  getFeedbackByDateRange_,
  getSentimentDistribution_,
  getTopIssues_,
  getComplaintsByLocation_,
  getWorkerPerformance_
};