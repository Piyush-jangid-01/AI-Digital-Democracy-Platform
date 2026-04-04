const cron = require("node-cron");
const { runEscalationCheck } = require("./escalationService");
const logger = require("./logger");

const startScheduler = () => {
  cron.schedule("0 */6 * * *", async () => {
    logger.info("Scheduled escalation check triggered");
    await runEscalationCheck();
  });

  logger.info("Scheduler started - escalation check runs every 6 hours");
};

module.exports = { startScheduler };