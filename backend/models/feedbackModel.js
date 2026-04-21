const pool = require("../config/db");

const createFeedback = async (description, category, location, image_url = null, user_id = null) => {
  const query = `
    INSERT INTO feedback (description, category, location, image_url)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [description, category, location, image_url];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllFeedback = async () => {
  const result = await pool.query("SELECT * FROM feedback ORDER BY created_at DESC");
  return result.rows;
};

const getFeedbackByCategory = async (category) => {
  const query = `SELECT * FROM feedback WHERE category = $1 ORDER BY created_at DESC`;
  const result = await pool.query(query, [category]);
  return result.rows;
};

const getFeedbackByLocation = async (location) => {
  const query = `SELECT * FROM feedback WHERE location = $1 ORDER BY created_at DESC`;
  const result = await pool.query(query, [location]);
  return result.rows;
};

const getFeedbackBySentiment = async (sentiment) => {
  const query = `SELECT * FROM feedback WHERE sentiment = $1 ORDER BY created_at DESC`;
  const result = await pool.query(query, [sentiment]);
  return result.rows;
};

const updateFeedbackSentiment = async (id, sentiment) => {
  const query = `UPDATE feedback SET sentiment = $1 WHERE id = $2 RETURNING *`;
  const result = await pool.query(query, [sentiment, id]);
  return result.rows[0];
};

const updateFeedbackTopic = async (id, topic) => {
  const query = `UPDATE feedback SET topic = $1 WHERE id = $2 RETURNING *`;
  const result = await pool.query(query, [topic, id]);
  return result.rows[0];
};

const updateFeedbackEmotion = async (id, emotion, emotion_score) => {
  const query = `UPDATE feedback SET emotion = $1, emotion_score = $2 WHERE id = $3 RETURNING *`;
  const result = await pool.query(query, [emotion, emotion_score, id]);
  return result.rows[0];
};

const searchFeedback = async (keyword) => {
  const query = `SELECT * FROM feedback WHERE description ILIKE $1 ORDER BY created_at DESC`;
  const result = await pool.query(query, [`%${keyword}%`]);
  return result.rows;
};

const getFeedbackPaginated = async (page, limit) => {
  const offset = (page - 1) * limit;
  const query = `SELECT * FROM feedback ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
  const countQuery = `SELECT COUNT(*) FROM feedback`;
  const result = await pool.query(query, [limit, offset]);
  const count = await pool.query(countQuery);
  return {
    data: result.rows,
    total: parseInt(count.rows[0].count),
    page: parseInt(page),
    totalPages: Math.ceil(count.rows[0].count / limit)
  };
};

const getRepeatedIssues = async (threshold = 3) => {
  const query = `
    SELECT 
      category,
      location,
      COUNT(*) as count,
      MAX(created_at) as last_reported
    FROM feedback
    WHERE sentiment = 'negative'
    GROUP BY category, location
    HAVING COUNT(*) >= $1
    ORDER BY count DESC
  `;
  const result = await pool.query(query, [threshold]);
  return result.rows;
};

const markIssueEscalated = async (category, location) => {
  const query = `
    UPDATE feedback 
    SET sentiment = 'escalated'
    WHERE category = $1 
    AND location = $2 
    AND sentiment = 'negative'
    RETURNING *
  `;
  const result = await pool.query(query, [category, location]);
  return result.rows;
};

const getFeedbackByTopic = async (topic) => {
  const query = `SELECT * FROM feedback WHERE topic = $1 ORDER BY created_at DESC`;
  const result = await pool.query(query, [topic]);
  return result.rows;
};

const getTopicStats = async () => {
  const query = `
    SELECT 
      topic,
      COUNT(*) as count,
      SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative_count,
      SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive_count
    FROM feedback
    WHERE topic IS NOT NULL
    GROUP BY topic
    ORDER BY count DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getEmotionStats = async () => {
  const query = `
    SELECT 
      emotion,
      COUNT(*) as count,
      ROUND(AVG(emotion_score), 4) as avg_score,
      ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
    FROM feedback
    WHERE emotion IS NOT NULL
    GROUP BY emotion
    ORDER BY count DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getUrgencyScores = async () => {
  const query = `
    SELECT 
      id,
      description,
      category,
      location,
      sentiment,
      emotion,
      emotion_score,
      created_at,
      ROUND(
        (
          CASE WHEN sentiment = 'escalated' THEN 40
               WHEN sentiment = 'negative' THEN 25
               WHEN sentiment = 'neutral' THEN 5
               ELSE 0 END
          +
          CASE WHEN emotion = 'anger' THEN 30
               WHEN emotion = 'disgust' THEN 25
               WHEN emotion = 'fear' THEN 20
               WHEN emotion = 'sadness' THEN 15
               ELSE 0 END
          +
          COALESCE(emotion_score * 30, 0)
        )::decimal, 1
      ) as urgency_score
    FROM feedback
    ORDER BY urgency_score DESC
    LIMIT 20
  `;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  createFeedback,
  getAllFeedback,
  getFeedbackByCategory,
  getFeedbackByLocation,
  getFeedbackBySentiment,
  updateFeedbackSentiment,
  updateFeedbackTopic,
  updateFeedbackEmotion,
  searchFeedback,
  getFeedbackPaginated,
  getRepeatedIssues,
  markIssueEscalated,
  getFeedbackByTopic,
  getTopicStats,
  getEmotionStats,
  getUrgencyScores
};