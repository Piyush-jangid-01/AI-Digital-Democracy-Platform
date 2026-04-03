const pool = require("../config/db");

const createUser = async (name, email, password, role) => {
  const query = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [name, email, password, role];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const getAllUsers = async () => {
  const result = await pool.query("SELECT id, name, email, role, created_at FROM users");
  return result.rows;
};

module.exports = { createUser, getUserByEmail, getAllUsers };