const { createTask, getAllTasks, getTasksByWorker, getTasksByStatus, updateTaskStatus } = require("../models/taskModel");
const { getWorkerById } = require("../models/workerModel");
const { sendTaskAssignmentEmail } = require("../utils/emailService");
const { emitTaskUpdate } = require("../utils/socketService");
const logger = require("../utils/logger");

const addTask = async (req, res) => {
  try {
    const { title, description, worker_id, due_date } = req.body;
    const task = await createTask(title, description, worker_id, due_date);
    const worker = await getWorkerById(worker_id);
    if (worker && worker.email) {
      await sendTaskAssignmentEmail(worker, task);
    }
    emitTaskUpdate(task);
    logger.info(`New task created: ${title} assigned to worker ${worker_id}`);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    logger.error(`Error creating task: ${error.message}`);
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

const getTasksByWorker_ = async (req, res) => {
  try {
    const tasks = await getTasksByWorker(req.params.worker_id);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTasksByStatus_ = async (req, res) => {
  try {
    const tasks = await getTasksByStatus(req.params.status);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTaskStatus_ = async (req, res) => {
  try {
    const task = await updateTaskStatus(req.params.id, req.body.status);
    emitTaskUpdate(task);
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addTask, getTasks, getTasksByWorker_, getTasksByStatus_, updateTaskStatus_ };