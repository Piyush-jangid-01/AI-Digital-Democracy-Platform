const pool = require("../config/db");

const createSentimentResult = async (feedback_id, sentiment_label, confidence_score) => {
  const query = `
    INSERT INTO sentiment_results (feedback_id, sentiment_label, confidence_score)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [feedback_id, sentiment_label, confidence_score];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllSentimentResults = async () => {
  const result = await pool.query("SELECT * FROM sentiment_results");
  return result.rows;
};

module.exports = { createSentimentResult, getAllSentimentResults };