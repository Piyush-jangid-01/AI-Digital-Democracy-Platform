const express = require("express");
const router = express.Router();
const { addTask, getTasks, getTasksByWorker_, getTasksByStatus_, updateTaskStatus_ } = require("../controllers/taskController");
const { validateTask } = require("../middleware/validateMiddleware");

router.post("/", validateTask, addTask);
router.get("/", getTasks);
router.get("/worker/:worker_id", getTasksByWorker_);
router.get("/status/:status", getTasksByStatus_);
router.patch("/:id/status", updateTaskStatus_);

module.exports = router;