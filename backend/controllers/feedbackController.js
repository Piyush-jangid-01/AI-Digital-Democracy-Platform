const { createFeedback } = require("../models/feedbackModel");

const addFeedback = async (req, res) => {
  try {
    const { description, category, location } = req.body;
    const feedback = await createFeedback(description, category, location);
    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addFeedback };