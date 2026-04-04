const { runEscalationCheck } = require("../utils/escalationService");
const { getRepeatedIssues } = require("../models/feedbackModel");
const logger = require("../utils/logger");

const checkEscalation = async (req, res) => {
  try {
    const issues = await runEscalationCheck();
    res.status(200).json({
      success: true,
      message: "Escalation check completed",
      escalated: issues || []
    });
  } catch (error) {
    logger.error(`Escalation controller error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEscalatedIssues = async (req, res) => {
  try {
    const threshold = req.query.threshold || 3;
    const issues = await getRepeatedIssues(threshold);
    res.status(200).json({ success: true, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { checkEscalation, getEscalatedIssues };