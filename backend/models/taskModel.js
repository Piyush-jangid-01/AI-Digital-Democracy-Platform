const pool = require("../config/db");

const createTask = async (title, description, worker_id, due_date) => {
  const query = `
    INSERT INTO tasks (title, description, worker_id, due_date)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [title, description, worker_id, due_date];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllTasks = async () => {
  const result = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");
  return result.rows;
};

const getTasksByWorker = async (worker_id) => {
  const query = `SELECT * FROM tasks WHERE worker_id = $1 ORDER BY created_at DESC`;
  const result = await pool.query(query, [worker_id]);
  return result.rows;
};

const getTasksByStatus = async (status) => {
  const query = `SELECT * FROM tasks WHERE status = $1 ORDER BY created_at DESC`;
  const result = await pool.query(query, [status]);
  return result.rows;
};

const updateTaskStatus = async (id, status) => {
  const query = `UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *`;
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
};

module.exports = {
  createTask,
  getAllTasks,
  getTasksByWorker,
  getTasksByStatus,
  updateTaskStatus
};