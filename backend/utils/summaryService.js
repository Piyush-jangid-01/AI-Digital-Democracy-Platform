const pool = require("../config/db");
const { analyzeSentiment } = require("../../ai-services/sentimentService");
const { classifyTopic } = require("../../ai-services/topicClassifier");

// generates a full text summary for a constituency or overall
const generateConstituencySummary = async (constituency_id = null) => {
  try {
    // fetch feedback
    let feedbackQuery = `
      SELECT f.*, c.name as constituency_name
      FROM feedback f
      LEFT JOIN constituencies c ON c.name = f.location
      ORDER BY f.created_at DESC
      LIMIT 200
    `;
    let feedbackParams = [];

    if (constituency_id) {
      feedbackQuery = `
        SELECT f.*, c.name as constituency_name
        FROM feedback f
        LEFT JOIN constituencies c ON c.id = $1
        WHERE f.location = c.name
        ORDER BY f.created_at DESC
        LIMIT 200
      `;
      feedbackParams = [constituency_id];
    }

    const feedbackResult = await pool.query(feedbackQuery, feedbackParams);
    const feedbacks = feedbackResult.rows;

    if (feedbacks.length === 0) {
      return {
        summary: "No feedback data available for this constituency.",
        stats: null,
        generatedAt: new Date().toISOString()
      };
    }

    // compute stats
    const total = feedbacks.length;
    const negative = feedbacks.filter(f => f.sentiment === "negative" || f.sentiment === "escalated").length;
    const positive = feedbacks.filter(f => f.sentiment === "positive").length;
    const neutral = feedbacks.filter(f => f.sentiment === "neutral").length;
    const escalated = feedbacks.filter(f => f.sentiment === "escalated").length;

    const negPercent = Math.round((negative / total) * 100);
    const posPercent = Math.round((positive / total) * 100);

    // top issues
    const topicCount = {};
    feedbacks.forEach(f => {
      if (f.topic) topicCount[f.topic] = (topicCount[f.topic] || 0) + 1;
    });
    const topIssues = Object.entries(topicCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic, count]) => ({ topic, count }));

    // top locations
    const locationCount = {};
    feedbacks.forEach(f => {
      if (f.location) locationCount[f.location] = (locationCount[f.location] || 0) + 1;
    });
    const topLocations = Object.entries(locationCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([location, count]) => ({ location, count }));

    // most recent negative feedbacks
    const recentNegative = feedbacks
      .filter(f => f.sentiment === "negative" || f.sentiment === "escalated")
      .slice(0, 3);

    // determine overall mood
    let overallMood = "mixed";
    if (negPercent >= 60) overallMood = "critical";
    else if (negPercent >= 40) overallMood = "concerning";
    else if (posPercent >= 60) overallMood = "positive";
    else if (posPercent >= 40) overallMood = "mostly positive";

    // generate human readable summary text
    const topIssueText = topIssues.map(i => i.topic).join(", ");
    const topLocationText = topLocations.map(l => l.location).join(", ");

    const summaryText = buildSummaryText({
      total, negative, positive, neutral, escalated,
      negPercent, posPercent, overallMood,
      topIssues, topIssueText, topLocationText,
      recentNegative, constituency_id
    });

    // fetch workers and tasks for this area
    const workerResult = await pool.query(
      constituency_id
        ? `SELECT COUNT(*) as count FROM field_workers WHERE constituency_id = $1`
        : `SELECT COUNT(*) as count FROM field_workers`,
      constituency_id ? [constituency_id] : []
    );

    const taskResult = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
       FROM tasks`
    );

    return {
      summary: summaryText,
      stats: {
        feedback: { total, positive, negative, neutral, escalated, negPercent, posPercent },
        topIssues,
        topLocations,
        recentNegative,
        overallMood,
        workers: parseInt(workerResult.rows[0].count),
        tasks: {
          total: parseInt(taskResult.rows[0].total),
          completed: parseInt(taskResult.rows[0].completed),
          pending: parseInt(taskResult.rows[0].pending)
        }
      },
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    throw new Error(`Summary generation failed: ${error.message}`);
  }
};

const buildSummaryText = ({
  total, negative, positive, neutral, escalated,
  negPercent, posPercent, overallMood,
  topIssues, topIssueText, topLocationText,
  recentNegative, constituency_id
}) => {
  const date = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
  });

  const moodStatement = {
    critical: "The overall public sentiment is CRITICAL. Immediate intervention is required.",
    concerning: "The overall public sentiment is CONCERNING. Several issues need urgent attention.",
    mixed: "The overall public sentiment is MIXED. Some areas show improvement while others need attention.",
    "mostly positive": "The overall public sentiment is MOSTLY POSITIVE. Citizens are largely satisfied.",
    positive: "The overall public sentiment is POSITIVE. Citizens are satisfied with current services."
  }[overallMood];

  let text = `CONSTITUENCY INTELLIGENCE REPORT\n`;
  text += `Generated on: ${date}\n`;
  text += `${"─".repeat(50)}\n\n`;

  text += `EXECUTIVE SUMMARY\n`;
  text += `${moodStatement}\n\n`;

  text += `FEEDBACK ANALYSIS (Last ${total} submissions)\n`;
  text += `• Total Feedback Received: ${total}\n`;
  text += `• Positive Sentiment: ${positive} (${posPercent}%)\n`;
  text += `• Negative Sentiment: ${negative} (${negPercent}%)\n`;
  text += `• Neutral Sentiment: ${neutral}\n`;
  if (escalated > 0) {
    text += `• Escalated Issues: ${escalated} ⚠️ REQUIRES IMMEDIATE ACTION\n`;
  }
  text += `\n`;

  if (topIssues.length > 0) {
    text += `TOP ISSUES REPORTED\n`;
    topIssues.forEach((issue, i) => {
      text += `${i + 1}. ${issue.topic} — ${issue.count} reports\n`;
    });
    text += `\n`;
  }

  if (topLocationText) {
    text += `MOST ACTIVE LOCATIONS\n`;
    text += `${topLocationText}\n\n`;
  }

  if (recentNegative.length > 0) {
    text += `RECENT CRITICAL COMPLAINTS\n`;
    recentNegative.forEach((f, i) => {
      text += `${i + 1}. [${f.category || "General"}] ${f.description?.slice(0, 100)}...\n`;
      text += `   Location: ${f.location} | Date: ${new Date(f.created_at).toLocaleDateString("en-IN")}\n`;
    });
    text += `\n`;
  }

  text += `RECOMMENDATIONS\n`;
  if (negPercent >= 60) {
    text += `• URGENT: Deploy additional field workers to high-complaint areas\n`;
    text += `• Escalate top issues to department heads immediately\n`;
    text += `• Schedule emergency review meeting within 48 hours\n`;
  } else if (negPercent >= 40) {
    text += `• Review and address top 3 complaint categories this week\n`;
    text += `• Increase survey frequency in high-complaint locations\n`;
    text += `• Follow up on all escalated issues\n`;
  } else {
    text += `• Continue current service delivery approach\n`;
    text += `• Monitor emerging issues proactively\n`;
    text += `• Acknowledge positive feedback to encourage citizen engagement\n`;
  }

  text += `\n${"─".repeat(50)}\n`;
  text += `Report generated by AI-Driven Digital Democracy Platform\n`;
  text += `Powered by NLP sentiment analysis and constituency intelligence engine`;

  return text;
};

module.exports = { generateConstituencySummary };