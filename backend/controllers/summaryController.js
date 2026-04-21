const { getOverallSummary } = require("../models/summaryModel");
const logger = require("../utils/logger");

const getSummary = async (req, res) => {
  try {
    const summary = await getOverallSummary();
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    logger.error(`Summary error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSummary };