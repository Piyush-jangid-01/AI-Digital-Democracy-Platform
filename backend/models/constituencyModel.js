const pool = require("../config/db");

const createConstituency = async (name, city, state, total_voters) => {
  const query = `
    INSERT INTO constituencies (name, city, state, total_voters)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [name, city, state, total_voters];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllConstituencies = async () => {
  const result = await pool.query("SELECT * FROM constituencies");
  return result.rows;
};

module.exports = { createConstituency, getAllConstituencies };