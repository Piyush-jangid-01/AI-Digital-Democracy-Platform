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

module.exports = { generateAnalytics, getAnalyticsByConstituency, getAllAnalytics };