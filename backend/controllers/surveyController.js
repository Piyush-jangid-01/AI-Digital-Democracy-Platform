const { createSurvey, getAllSurveys, getSurveysByWorker, getSurveysByConstituency } = require("../models/surveyModel");

const addSurvey = async (req, res) => {
  try {
    const { worker_id, constituency_id, area, responses, total_responses, survey_date } = req.body;
    const survey = await createSurvey(worker_id, constituency_id, area, responses, total_responses, survey_date);
    res.status(201).json({ success: true, data: survey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSurveys = async (req, res) => {
  try {
    const surveys = await getAllSurveys();
    res.status(200).json({ success: true, data: surveys });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSurveysByWorker_ = async (req, res) => {
  try {
    const surveys = await getSurveysByWorker(req.params.worker_id);
    res.status(200).json({ success: true, data: surveys });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSurveysByConstituency_ = async (req, res) => {
  try {
    const surveys = await getSurveysByConstituency(req.params.constituency_id);
    res.status(200).json({ success: true, data: surveys });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addSurvey, getSurveys, getSurveysByWorker_, getSurveysByConstituency_ };