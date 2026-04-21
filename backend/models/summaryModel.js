const pool = require("../config/db");

const getOverallSummary = async () => {
  const feedbackQuery = `
    SELECT
      COUNT(*) as total_feedback,
      SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive,
      SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative,
      SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral,
      SUM(CASE WHEN sentiment = 'escalated' THEN 1 ELSE 0 END) as escalated,
      MODE() WITHIN GROUP (ORDER BY category) as top_category,
      MODE() WITHIN GROUP (ORDER BY topic) as top_topic,
      MODE() WITHIN GROUP (ORDER BY emotion) as top_emotion,
      MODE() WITHIN GROUP (ORDER BY location) as hotspot_location
    FROM feedback
  `;

  const workersQuery = `
    SELECT
      COUNT(*) as total_workers,
      COUNT(DISTINCT constituency_id) as active_constituencies
    FROM field_workers
  `;

  const tasksQuery = `
    SELECT
      COUNT(*) as total_tasks,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks
    FROM tasks
  `;

  const votersQuery = `
    SELECT COUNT(*) as total_voters FROM voters
  `;

  const surveysQuery = `
    SELECT COUNT(*) as total_surveys FROM surveys
  `;

  const recentFeedbackQuery = `
    SELECT COUNT(*) as recent_feedback
    FROM feedback
    WHERE created_at >= NOW() - INTERVAL '24 hours'
  `;

  const urgentQuery = `
    SELECT COUNT(*) as urgent_count
    FROM feedback
    WHERE sentiment = 'negative'
    AND created_at >= NOW() - INTERVAL '24 hours'
  `;

  const [
    feedbackRes,
    workersRes,
    tasksRes,
    votersRes,
    surveysRes,
    recentRes,
    urgentRes
  ] = await Promise.all([
    pool.query(feedbackQuery),
    pool.query(workersQuery),
    pool.query(tasksQuery),
    pool.query(votersQuery),
    pool.query(surveysQuery),
    pool.query(recentFeedbackQuery),
    pool.query(urgentQuery)
  ]);

  const f = feedbackRes.rows[0];
  const total = parseInt(f.total_feedback) || 1;

  return {
    feedback: {
      total: parseInt(f.total_feedback),
      positive: parseInt(f.positive),
      negative: parseInt(f.negative),
      neutral: parseInt(f.neutral),
      escalated: parseInt(f.escalated),
      positivePercent: Math.round((f.positive / total) * 100),
      negativePercent: Math.round((f.negative / total) * 100),
      topCategory: f.top_category,
      topTopic: f.top_topic,
      topEmotion: f.top_emotion,
      hotspotLocation: f.hotspot_location
    },
    workers: {
      total: parseInt(workersRes.rows[0].total_workers),
      activeConstituencies: parseInt(workersRes.rows[0].active_constituencies)
    },
    tasks: {
      total: parseInt(tasksRes.rows[0].total_tasks),
      completed: parseInt(tasksRes.rows[0].completed_tasks),
      pending: parseInt(tasksRes.rows[0].pending_tasks),
      completionRate: Math.round((tasksRes.rows[0].completed_tasks / (tasksRes.rows[0].total_tasks || 1)) * 100)
    },
    voters: {
      total: parseInt(votersRes.rows[0].total_voters)
    },
    surveys: {
      total: parseInt(surveysRes.rows[0].total_surveys)
    },
    alerts: {
      recentFeedback: parseInt(recentRes.rows[0].recent_feedback),
      urgentCount: parseInt(urgentRes.rows[0].urgent_count)
    },
    generatedAt: new Date().toISOString()
  };
};

module.exports = { getOverallSummary };