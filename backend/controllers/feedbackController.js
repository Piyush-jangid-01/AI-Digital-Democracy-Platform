const {
  createFeedback,
  getAllFeedback,
  getFeedbackByCategory,
  getFeedbackByLocation,
  getFeedbackBySentiment,
  updateFeedbackSentiment,
  updateFeedbackTopic,
  searchFeedback,
  getFeedbackPaginated,
  getFeedbackByTopic,
  getTopicStats
} = require("../models/feedbackModel");

const { createSentimentResult } = require("../models/sentimentModel");
const { analyzeSentiment } = require("../../ai-services/sentimentService");
const { classifyTopic } = require("../../ai-services/topicClassifier");
const { exportToCSV } = require("../utils/exportCSV");
const { sendNegativeFeedbackAlert } = require("../utils/emailService");
const { emitNewFeedback, emitNegativeFeedback } = require("../utils/socketService");
const logger = require("../utils/logger");

const addFeedback = async (req, res) => {
  try {
    const { description, category, location } = req.body;

    const feedback = await createFeedback(description, category, location);
    const sentiment = analyzeSentiment(description);
    const topicResult = classifyTopic(description);

    await updateFeedbackSentiment(feedback.id, sentiment.label);
    await updateFeedbackTopic(feedback.id, topicResult.primaryTopic);
    await createSentimentResult(feedback.id, sentiment.label, sentiment.confidence);

    const fullFeedback = {
      ...feedback,
      sentiment: sentiment.label,
      confidence: sentiment.confidence,
      topic: topicResult.primaryTopic,
      allTopics: topicResult.allTopics
    };

    emitNewFeedback(fullFeedback);

    if (sentiment.label === "negative") {
      await sendNegativeFeedbackAlert(fullFeedback);
      emitNegativeFeedback(fullFeedback);
    }

    logger.info(`New feedback submitted from ${location} - sentiment: ${sentiment.label} - topic: ${topicResult.primaryTopic}`);

    res.status(201).json({ success: true, data: fullFeedback });
  } catch (error) {
    logger.error(`Error adding feedback: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFeedback = async (req, res) => {
  try {
    const feedback = await getAllFeedback();
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFeedbackByCategory_ = async (req, res) => {
  try {
    const feedback = await getFeedbackByCategory(req.params.category);
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFeedbackByLocation_ = async (req, res) => {
  try {
    const feedback = await getFeedbackByLocation(req.params.location);
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFeedbackBySentiment_ = async (req, res) => {
  try {
    const feedback = await getFeedbackBySentiment(req.params.sentiment);
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const searchFeedback_ = async (req, res) => {
  try {
    const feedback = await searchFeedback(req.query.keyword);
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFeedbackPaginated_ = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const result = await getFeedbackPaginated(page, limit);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportFeedbackCSV = async (req, res) => {
  try {
    const feedback = await getAllFeedback();
    const fields = ["id", "description", "category", "location", "sentiment", "topic", "created_at"];
    const csv = exportToCSV(feedback, fields);
    res.header("Content-Type", "text/csv");
    res.attachment("feedback.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFeedbackByTopic_ = async (req, res) => {
  try {
    const feedback = await getFeedbackByTopic(req.params.topic);
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTopicStats_ = async (req, res) => {
  try {
    const stats = await getTopicStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addFeedback,
  getFeedback,
  getFeedbackByCategory_,
  getFeedbackByLocation_,
  getFeedbackBySentiment_,
  searchFeedback_,
  getFeedbackPaginated_,
  exportFeedbackCSV,
  getFeedbackByTopic_,
  getTopicStats_
};