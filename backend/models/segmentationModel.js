const pool = require("../config/db");

const getVotersByAgeGroup = async () => {
  const query = `
    SELECT 
      CASE 
        WHEN age BETWEEN 18 AND 25 THEN 'Youth (18-25)'
        WHEN age BETWEEN 26 AND 40 THEN 'Young Adult (26-40)'
        WHEN age BETWEEN 41 AND 60 THEN 'Middle Age (41-60)'
        WHEN age > 60 THEN 'Senior (60+)'
      END as age_group,
      COUNT(*) as count
    FROM voters
    GROUP BY age_group
    ORDER BY count DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getVotersByGender = async () => {
  const query = `
    SELECT 
      gender,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
    FROM voters
    WHERE gender IS NOT NULL
    GROUP BY gender
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getVotersByBooth = async () => {
  const query = `
    SELECT 
      booth_number,
      COUNT(*) as total_voters,
      COUNT(CASE WHEN gender = 'male' THEN 1 END) as male_count,
      COUNT(CASE WHEN gender = 'female' THEN 1 END) as female_count,
      ROUND(AVG(age), 1) as avg_age
    FROM voters
    WHERE booth_number IS NOT NULL
    GROUP BY booth_number
    ORDER BY total_voters DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getConstituencyOverview = async () => {
  const query = `
    SELECT 
      c.id,
      c.name,
      c.city,
      c.total_voters,
      COUNT(DISTINCT fw.id) as total_workers,
      COUNT(DISTINCT v.id) as registered_voters,
      COUNT(DISTINCT s.id) as total_surveys
    FROM constituencies c
    LEFT JOIN field_workers fw ON fw.constituency_id = c.id
    LEFT JOIN voters v ON v.constituency_id = c.id
    LEFT JOIN surveys s ON s.constituency_id = c.id
    GROUP BY c.id, c.name, c.city, c.total_voters
    ORDER BY c.id
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getFeedbackSegmentByLocation = async () => {
  const query = `
    SELECT 
      location,
      COUNT(*) as total_feedback,
      SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive,
      SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative,
      SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral,
      SUM(CASE WHEN sentiment = 'escalated' THEN 1 ELSE 0 END) as escalated,
      MODE() WITHIN GROUP (ORDER BY topic) as top_topic
    FROM feedback
    WHERE location IS NOT NULL
    GROUP BY location
    ORDER BY total_feedback DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getWorkerSegmentByConstituency = async () => {
  const query = `
    SELECT 
      c.name as constituency,
      COUNT(fw.id) as total_workers,
      COUNT(t.id) as total_tasks,
      SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
      SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) as pending_tasks
    FROM constituencies c
    LEFT JOIN field_workers fw ON fw.constituency_id = c.id
    LEFT JOIN tasks t ON t.worker_id = fw.id
    GROUP BY c.id, c.name
    ORDER BY total_workers DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  getVotersByAgeGroup,
  getVotersByGender,
  getVotersByBooth,
  getConstituencyOverview,
  getFeedbackSegmentByLocation,
  getWorkerSegmentByConstituency
};