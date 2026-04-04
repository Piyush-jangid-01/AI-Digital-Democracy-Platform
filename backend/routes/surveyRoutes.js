const express = require("express");
const router = express.Router();
const { addSurvey, getSurveys, getSurveysByWorker_, getSurveysByConstituency_ } = require("../controllers/surveyController");
const { validateSurvey } = require("../middleware/validateMiddleware");

router.post("/", validateSurvey, addSurvey);
router.get("/", getSurveys);
router.get("/worker/:worker_id", getSurveysByWorker_);
router.get("/constituency/:constituency_id", getSurveysByConstituency_);

module.exports = router;