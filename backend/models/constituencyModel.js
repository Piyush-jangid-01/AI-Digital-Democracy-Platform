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
  const result = await pool.query("SELECT * FROM constituencies ORDER BY created_at DESC");
  return result.rows;
};

const getConstituencyById = async (id) => {
  const query = `SELECT * FROM constituencies WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const getConstituencyWithWorkerCount = async (id) => {
  const query = `
    SELECT c.*, COUNT(fw.id) as worker_count
    FROM constituencies c
    LEFT JOIN field_workers fw ON fw.constituency_id = c.id
    WHERE c.id = $1
    GROUP BY c.id
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createConstituency,
  getAllConstituencies,
  getConstituencyById,
  getConstituencyWithWorkerCount
};