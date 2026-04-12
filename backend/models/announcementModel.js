const pool = require("../config/db");

const createAnnouncement = async (title, content, constituency_id, created_by) => {
  const query = `
    INSERT INTO announcements (title, content, constituency_id, created_by)
    VALUES ($1, $2, $3, $4) RETURNING *
  `;
  const result = await pool.query(query, [title, content, constituency_id, created_by]);
  return result.rows[0];
};

const getAllAnnouncements = async () => {
  const query = `
    SELECT a.*, c.name as constituency_name, u.name as created_by_name
    FROM announcements a
    LEFT JOIN constituencies c ON c.id = a.constituency_id
    LEFT JOIN users u ON u.id = a.created_by
    ORDER BY a.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getAnnouncementsByConstituency = async (constituency_id) => {
  const query = `
    SELECT a.*, c.name as constituency_name
    FROM announcements a
    LEFT JOIN constituencies c ON c.id = a.constituency_id
    WHERE a.constituency_id = $1 OR a.constituency_id IS NULL
    ORDER BY a.created_at DESC
  `;
  const result = await pool.query(query, [constituency_id]);
  return result.rows;
};

const deleteAnnouncement = async (id) => {
  const result = await pool.query(`DELETE FROM announcements WHERE id = $1 RETURNING *`, [id]);
  return result.rows[0];
};

module.exports = { createAnnouncement, getAllAnnouncements, getAnnouncementsByConstituency, deleteAnnouncement };