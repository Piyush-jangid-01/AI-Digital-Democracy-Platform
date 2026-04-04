const nodemailer = require("nodemailer");
const logger = require("./logger");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendNegativeFeedbackAlert = async (feedback) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "🚨 Negative Feedback Alert - Digital Democracy Platform",
      html: `
        <h2>Negative Feedback Received</h2>
        <p><strong>Category:</strong> ${feedback.category}</p>
        <p><strong>Location:</strong> ${feedback.location}</p>
        <p><strong>Description:</strong> ${feedback.description}</p>
        <p><strong>Sentiment:</strong> ${feedback.sentiment}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <hr/>
        <p>Please review this feedback on your admin dashboard.</p>
      `
    });
    logger.info(`Negative feedback alert sent for feedback in ${feedback.location}`);
  } catch (error) {
    logger.error(`Failed to send email alert: ${error.message}`);
  }
};

const sendCriticalIssueAlert = async (issue) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "🔴 Critical Issue Detected - Digital Democracy Platform",
      html: `
        <h2>Critical Issue Alert</h2>
        <p><strong>Issue Category:</strong> ${issue.category}</p>
        <p><strong>Location:</strong> ${issue.location}</p>
        <p><strong>Total Reports:</strong> ${issue.count}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <hr/>
        <p>This issue has been reported multiple times and requires immediate attention.</p>
      `
    });
    logger.info(`Critical issue alert sent for ${issue.category} in ${issue.location}`);
  } catch (error) {
    logger.error(`Failed to send critical issue alert: ${error.message}`);
  }
};

const sendTaskAssignmentEmail = async (worker, task) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: worker.email,
      subject: "📋 New Task Assigned - Digital Democracy Platform",
      html: `
        <h2>New Task Assigned</h2>
        <p>Dear ${worker.name},</p>
        <p>A new task has been assigned to you:</p>
        <p><strong>Title:</strong> ${task.title}</p>
        <p><strong>Description:</strong> ${task.description}</p>
        <p><strong>Due Date:</strong> ${task.due_date}</p>
        <hr/>
        <p>Please login to the platform to view task details.</p>
      `
    });
    logger.info(`Task assignment email sent to ${worker.email}`);
  } catch (error) {
    logger.error(`Failed to send task assignment email: ${error.message}`);
  }
};

module.exports = {
  sendNegativeFeedbackAlert,
  sendCriticalIssueAlert,
  sendTaskAssignmentEmail
};