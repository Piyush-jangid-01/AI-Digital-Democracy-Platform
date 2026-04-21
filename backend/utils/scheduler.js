const cron = require("node-cron");
const { runEscalationCheck } = require("./escalationService");
const { getOverallSummary } = require("../models/summaryModel");
const logger = require("./logger");
const nodemailer = require("nodemailer");

const sendWeeklyReport = async () => {
  try {
    logger.info("Generating weekly AI report...");
    const summary = await getOverallSummary();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const negRate = summary.feedback.negativePercent;
    const aiRecommendation = negRate > 60
      ? "🚨 CRITICAL: Over 60% negative feedback. Immediate action required on " + summary.feedback.topCategory
      : negRate > 40
      ? "⚠️ WARNING: High negative sentiment. Focus on resolving " + summary.feedback.topCategory + " issues."
      : "✅ GOOD: Sentiment is mostly positive. Keep up the good work!";

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `📊 Weekly Constituency Intelligence Report — ${new Date().toLocaleDateString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a2e; color: white; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 22px;">🗳️ Weekly Intelligence Report</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.7;">Digital Democracy Platform</p>
          </div>
          <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 12px 12px;">

            <div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 16px; border-left: 4px solid #0f3460;">
              <h3 style="margin: 0 0 8px 0;">🤖 AI Recommendation</h3>
              <p style="margin: 0; color: #444;">${aiRecommendation}</p>
            </div>

            <h3>📊 This Week's Stats</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background: #e8f0fe;">
                <td style="padding: 10px; font-weight: bold;">Total Feedback</td>
                <td style="padding: 10px;">${summary.feedback.total}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Positive</td>
                <td style="padding: 10px; color: #22c55e;">${summary.feedback.positive} (${summary.feedback.positivePercent}%)</td>
              </tr>
              <tr style="background: #fff0f0;">
                <td style="padding: 10px; font-weight: bold;">Negative</td>
                <td style="padding: 10px; color: #e94560;">${summary.feedback.negative} (${summary.feedback.negativePercent}%)</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Top Issue</td>
                <td style="padding: 10px;">${summary.feedback.topCategory || "N/A"}</td>
              </tr>
              <tr style="background: #e8f0fe;">
                <td style="padding: 10px; font-weight: bold;">Hotspot Area</td>
                <td style="padding: 10px;">${summary.feedback.hotspotLocation || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Top Emotion</td>
                <td style="padding: 10px;">${summary.feedback.topEmotion || "N/A"}</td>
              </tr>
              <tr style="background: #e8f0fe;">
                <td style="padding: 10px; font-weight: bold;">Workers Active</td>
                <td style="padding: 10px;">${summary.workers.total}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Tasks Completed</td>
                <td style="padding: 10px;">${summary.tasks.completed}/${summary.tasks.total} (${summary.tasks.completionRate}%)</td>
              </tr>
              <tr style="background: #e8f0fe;">
                <td style="padding: 10px; font-weight: bold;">24hr Urgent Alerts</td>
                <td style="padding: 10px; color: #e94560; font-weight: bold;">${summary.alerts.urgentCount}</td>
              </tr>
            </table>

            <p style="color: #888; font-size: 12px; margin-top: 24px; text-align: center;">
              Generated automatically by Digital Democracy Platform · ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `
    });

    logger.info("Weekly report sent successfully");
  } catch (error) {
    logger.error(`Weekly report failed: ${error.message}`);
  }
};

const startScheduler = () => {
  cron.schedule("0 */6 * * *", async () => {
    logger.info("Scheduled escalation check triggered");
    await runEscalationCheck();
  });

  cron.schedule("0 9 * * 1", async () => {
    logger.info("Weekly report triggered");
    await sendWeeklyReport();
  });

  logger.info("Scheduler started - escalation every 6hrs, report every Monday 9AM");
};

module.exports = { startScheduler, sendWeeklyReport };