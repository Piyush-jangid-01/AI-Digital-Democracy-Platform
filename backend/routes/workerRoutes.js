const express = require("express");
const router = express.Router();
const { addWorker, getWorkers } = require("../controllers/workerController");
const { validateWorker } = require("../middleware/validateMiddleware");

router.post("/", validateWorker, addWorker);
router.get("/", getWorkers);

module.exports = router;