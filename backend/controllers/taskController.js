const { createTask, getAllTasks } = require("../models/taskModel");

const addTask = async (req, res) => {
  try {
    const { title, description, worker_id, due_date } = req.body;
    const task = await createTask(title, description, worker_id, due_date);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await getAllTasks();
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addTask, getTasks };