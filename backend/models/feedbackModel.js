const pool = require("../config/db");

const createFeedback = async (description, category, location) => {
  const query = `
    INSERT INTO feedback (description, category, location)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const values = [description, category, location];

  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = { createFeedback };