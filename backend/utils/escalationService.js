const { getRepeatedIssues, markIssueEscalated } = require("../models/feedbackModel");
const { sendCriticalIssueAlert } = require("./emailService");
const logger = require("./logger");

const ESCALATION_THRESHOLD = 3;

const runEscalationCheck = async () => {
  try {
    logger.info("Running issue escalation check...");
    const repeatedIssues = await getRepeatedIssues(ESCALATION_THRESHOLD);

    if (repeatedIssues.length === 0) {
      logger.info("No issues require escalation");
      return [];
    }

    for (const issue of repeatedIssues) {
      logger.info(`Escalating issue: ${issue.category} in ${issue.location} (${issue.count} reports)`);
      await sendCriticalIssueAlert(issue);
      await markIssueEscalated(issue.category, issue.location);
      logger.info(`Issue escalated successfully: ${issue.category} in ${issue.location}`);
    }

    return repeatedIssues;
  } catch (error) {
    logger.error(`Escalation check failed: ${error.message}`);
  }
};

module.exports = { runEscalationCheck };