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
  const result = await pool.query("SELECT * FROM tasks");
  return result.rows;
};

module.exports = { createTask, getAllTasks };