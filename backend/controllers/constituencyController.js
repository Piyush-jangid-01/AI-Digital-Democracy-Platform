const { createConstituency, getAllConstituencies } = require("../models/constituencyModel");

const addConstituency = async (req, res) => {
  try {
    const { name, city, state, total_voters } = req.body;
    const constituency = await createConstituency(name, city, state, total_voters);
    res.status(201).json({ success: true, data: constituency });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getConstituencies = async (req, res) => {
  try {
    const constituencies = await getAllConstituencies();
    res.status(200).json({ success: true, data: constituencies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addConstituency, getConstituencies };