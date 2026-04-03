const pool = require("../config/db");

const createVoter = async (name, age, gender, phone, booth_number, constituency_id) => {
  const query = `
    INSERT INTO voters (name, age, gender, phone, booth_number, constituency_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const values = [name, age, gender, phone, booth_number, constituency_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllVoters = async () => {
  const result = await pool.query("SELECT * FROM voters");
  return result.rows;
};

const getVotersByConstituency = async (constituency_id) => {
  const query = `SELECT * FROM voters WHERE constituency_id = $1`;
  const result = await pool.query(query, [constituency_id]);
  return result.rows;
};

const getVotersByBooth = async (booth_number) => {
  const query = `SELECT * FROM voters WHERE booth_number = $1`;
  const result = await pool.query(query, [booth_number]);
  return result.rows;
};

module.exports = { createVoter, getAllVoters, getVotersByConstituency, getVotersByBooth };