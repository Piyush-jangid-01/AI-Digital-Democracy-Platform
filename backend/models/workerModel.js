const pool = require("../config/db");

const createWorker = async (name, phone, email, constituency_id) => {
  const query = `
    INSERT INTO field_workers (name, phone, email, constituency_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [name, phone, email, constituency_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllWorkers = async () => {
  const result = await pool.query("SELECT * FROM field_workers");
  return result.rows;
};

module.exports = { createWorker, getAllWorkers };