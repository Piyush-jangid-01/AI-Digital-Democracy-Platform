const pool = require("../config/db");

const generateAnalytics = async (constituency_id) => {
  const query = `
    INSERT INTO analytics (constituency_id, total_feedback, positive_count, negative_count, neutral_count, top_issue)
    SELECT 
      $1,
      COUNT(*),
      SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END),
      SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END),
      SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END),
      MODE() WITHIN GROUP (ORDER BY category)
    FROM feedback
    WHERE location = (SELECT name FROM constituencies WHERE id = $1)
    RETURNING *
  `;
  const result = await pool.query(query, [constituency_id]);
  return result.rows[0];
};

const getAnalyticsByConstituency = async (constituency_id) => {
  const query = `SELECT * FROM analytics WHERE constituency_id = $1 ORDER BY generated_at DESC LIMIT 1`;
  const result = await pool.query(query, [constituency_id]);
  return result.rows[0];
};

const getAllAnalytics = async () => {
  const result = await pool.query("SELECT * FROM analytics ORDER BY generated_at DESC");
  return result.rows;
};

const getOverallStats = async () => {
  const query = `
    SELECT
      COUNT(*) as total_feedback,
      SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as total_positive,
      SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as total_negative,
      SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as total_neutral,
      MODE() WITHIN GROUP (ORDER BY category) as top_issue
    FROM feedback
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

const getFeedbackByDateRange = async (start_date, end_date) => {
  const query = `
    SELECT * FROM feedback 
    WHERE created_at BETWEEN $1 AND $2 
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [start_date, end_date]);
  return result.rows;
};

const getSentimentDistribution = async () => {
  const query = `
    SELECT 
      sentiment,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
    FROM feedback
    WHERE sentiment IS NOT NULL
    GROUP BY sentiment
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getTopIssues = async () => {
  const query = `
    SELECT 
      category,
      COUNT(*) as count
    FROM feedback
    WHERE category IS NOT NULL
    GROUP BY category
    ORDER BY count DESC
    LIMIT 5
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getComplaintsByLocation = async () => {
  const query = `
    SELECT 
      location,
      COUNT(*) as total_complaints,
      SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative_count
    FROM feedback
    WHERE location IS NOT NULL
    GROUP BY location
    ORDER BY total_complaints DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getWorkerPerformance = async () => {
  const query = `
    SELECT 
      fw.id,
      fw.name,
      COUNT(t.id) as total_tasks,
      SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
      SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) as pending_tasks
    FROM field_workers fw
    LEFT JOIN tasks t ON t.worker_id = fw.id
    GROUP BY fw.id, fw.name
    ORDER BY completed_tasks DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  generateAnalytics,
  getAnalyticsByConstituency,
  getAllAnalytics,
  getOverallStats,
  getFeedbackByDateRange,
  getSentimentDistribution,
  getTopIssues,
  getComplaintsByLocation,
  getWorkerPerformance
};