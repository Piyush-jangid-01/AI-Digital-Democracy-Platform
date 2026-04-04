const pool = require("../config/db");

const getFeedbackTrend = async () => {
  const query = `
    SELECT 
      DATE_TRUNC('day', created_at) as date,
      COUNT(*) as total,
      SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative,
      SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive
    FROM feedback
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY date ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getCategoryTrend = async () => {
  const query = `
    SELECT 
      category,
      DATE_TRUNC('day', created_at) as date,
      COUNT(*) as count
    FROM feedback
    WHERE category IS NOT NULL
    GROUP BY category, DATE_TRUNC('day', created_at)
    ORDER BY date ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getLocationRiskScore = async () => {
  const query = `
    SELECT 
      location,
      COUNT(*) as total_feedback,
      SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative_count,
      SUM(CASE WHEN sentiment = 'escalated' THEN 1 ELSE 0 END) as escalated_count,
      ROUND(
        (SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END)::decimal / 
        NULLIF(COUNT(*), 0)) * 100, 2
      ) as risk_score
    FROM feedback
    WHERE location IS NOT NULL
    GROUP BY location
    ORDER BY risk_score DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getEmergingIssues = async () => {
  const query = `
    SELECT 
      category,
      topic,
      COUNT(*) as count,
      MAX(created_at) as last_seen
    FROM feedback
    WHERE created_at >= NOW() - INTERVAL '7 days'
    AND sentiment = 'negative'
    GROUP BY category, topic
    ORDER BY count DESC
    LIMIT 10
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getWorkerEfficiencyTrend = async () => {
  const query = `
    SELECT 
      fw.name as worker,
      COUNT(t.id) as total_tasks,
      SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed,
      ROUND(
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END)::decimal /
        NULLIF(COUNT(t.id), 0) * 100, 2
      ) as efficiency_score
    FROM field_workers fw
    LEFT JOIN tasks t ON t.worker_id = fw.id
    GROUP BY fw.id, fw.name
    ORDER BY efficiency_score DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const predictNextWeekIssues = async () => {
  const query = `
    SELECT 
      category,
      location,
      COUNT(*) as recent_count,
      ROUND(AVG(
        CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END
      ) * 100, 2) as negative_rate,
      CASE 
        WHEN COUNT(*) >= 5 AND AVG(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) >= 0.6 
          THEN 'HIGH RISK'
        WHEN COUNT(*) >= 3 AND AVG(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) >= 0.4 
          THEN 'MEDIUM RISK'
        ELSE 'LOW RISK'
      END as predicted_risk
    FROM feedback
    WHERE created_at >= NOW() - INTERVAL '14 days'
    GROUP BY category, location
    ORDER BY recent_count DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  getFeedbackTrend,
  getCategoryTrend,
  getLocationRiskScore,
  getEmergingIssues,
  getWorkerEfficiencyTrend,
  predictNextWeekIssues
};