const { createWorker, getAllWorkers } = require("../models/workerModel");

const addWorker = async (req, res) => {
  try {
    const { name, phone, email, constituency_id } = req.body;
    const worker = await createWorker(name, phone, email, constituency_id);
    res.status(201).json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWorkers = async (req, res) => {
  try {
    const workers = await getAllWorkers();
    res.status(200).json({ success: true, data: workers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addWorker, getWorkers };