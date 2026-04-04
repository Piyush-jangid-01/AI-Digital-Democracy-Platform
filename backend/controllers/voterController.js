const { createVoter, getAllVoters, getVotersByConstituency, getVotersByBooth } = require("../models/voterModel");

const addVoter = async (req, res) => {
  try {
    const { name, age, gender, phone, booth_number, constituency_id } = req.body;
    const voter = await createVoter(name, age, gender, phone, booth_number, constituency_id);
    res.status(201).json({ success: true, data: voter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getVoters = async (req, res) => {
  try {
    const voters = await getAllVoters();
    res.status(200).json({ success: true, data: voters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getVotersByConstituency_ = async (req, res) => {
  try {
    const voters = await getVotersByConstituency(req.params.constituency_id);
    res.status(200).json({ success: true, data: voters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getVotersByBooth_ = async (req, res) => {
  try {
    const voters = await getVotersByBooth(req.params.booth_number);
    res.status(200).json({ success: true, data: voters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addVoter, getVoters, getVotersByConstituency_, getVotersByBooth_ };