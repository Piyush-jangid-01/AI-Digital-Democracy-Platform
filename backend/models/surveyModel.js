const pool = require("../config/db");

const createSurvey = async (worker_id, constituency_id, area, responses, total_responses, survey_date) => {
  const query = `
    INSERT INTO surveys (worker_id, constituency_id, area, responses, total_responses, survey_date)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const values = [worker_id, constituency_id, area, responses, total_responses, survey_date];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllSurveys = async () => {
  const result = await pool.query("SELECT * FROM surveys");
  return result.rows;
};

const getSurveysByWorker = async (worker_id) => {
  const query = `SELECT * FROM surveys WHERE worker_id = $1`;
  const result = await pool.query(query, [worker_id]);
  return result.rows;
};

const getSurveysByConstituency = async (constituency_id) => {
  const query = `SELECT * FROM surveys WHERE constituency_id = $1`;
  const result = await pool.query(query, [constituency_id]);
  return result.rows;
};

module.exports = { createSurvey, getAllSurveys, getSurveysByWorker, getSurveysByConstituency };