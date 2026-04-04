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
  const result = await pool.query("SELECT * FROM field_workers ORDER BY created_at DESC");
  return result.rows;
};

const getWorkersByConstituency = async (constituency_id) => {
  const query = `SELECT * FROM field_workers WHERE constituency_id = $1`;
  const result = await pool.query(query, [constituency_id]);
  return result.rows;
};

const getWorkerById = async (id) => {
  const query = `SELECT * FROM field_workers WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createWorker,
  getAllWorkers,
  getWorkersByConstituency,
  getWorkerById
};