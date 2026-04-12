const updateFeedbackPriority = async (id, priority) => {
  const result = await pool.query(
    `UPDATE feedback SET priority = $1 WHERE id = $2 RETURNING *`,
    [priority, id]
  );
  return result.rows[0];
};

const assignWorkerToFeedback = async (id, worker_id) => {
  const result = await pool.query(
    `UPDATE feedback SET assigned_worker_id = $1 WHERE id = $2 RETURNING *`,
    [worker_id, id]
  );
  return result.rows[0];
};