const {
  createFeedback,
  getAllFeedback,
  getFeedbackByCategory,
  getFeedbackByLocation,
  getFeedbackBySentiment,
  updateFeedbackSentiment,
  updateFeedbackTopic,
  updateFeedbackEmotion,
  searchFeedback,
  getFeedbackPaginated,
  getFeedbackByTopic,
  getTopicStats,
  getEmotionStats
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
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const feedback = await createFeedback(description, category, location, image_url);

    const sentiment = await analyzeSentiment(description);
    const topicResult = classifyTopic(description);

    await updateFeedbackSentiment(feedback.id, sentiment.label);
    await updateFeedbackTopic(feedback.id, topicResult.primaryTopic);
    await updateFeedbackEmotion(
      feedback.id,
      sentiment.emotion || null,
      sentiment.emotionScore || null
    );
    await createSentimentResult(feedback.id, sentiment.label, sentiment.confidence);

    const fullFeedback = {
      ...feedback,
      sentiment: sentiment.label,
      confidence: sentiment.confidence,
      emotion: sentiment.emotion,
      emotionScore: sentiment.emotionScore,
      allEmotions: sentiment.allEmotions,
      sentimentSource: sentiment.source,
      topic: topicResult.primaryTopic,
      allTopics: topicResult.allTopics,
      image_url
    };

    emitNewFeedback(fullFeedback);

    if (sentiment.label === "negative") {
      await sendNegativeFeedbackAlert(fullFeedback);
      emitNegativeFeedback(fullFeedback);
    }

    logger.info(`Feedback [${sentiment.source}] emotion: ${sentiment.emotion} → ${sentiment.label} (${sentiment.confidence})`);
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
    const fields = ["id", "description", "category", "location", "sentiment", "emotion", "topic", "created_at"];
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

const getEmotionStats_ = async (req, res) => {
  try {
    const stats = await getEmotionStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const { getUrgencyScores } = require("../models/feedbackModel");
const { get } = require("../routes/surveyRoutes");

const getUrgencyScores_ = async (req, res) => {
  try {
    const scores = await getUrgencyScores();
    res.status(200).json({ success: true, data: scores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const summarizeFeedback = async (req, res) => {
  try {
    if (!process.env.HUGGINGFACE_TOKEN) {
      return res.status(400).json({ success: false, message: "HuggingFace token not configured" });
    }

    const { text } = req.body;
    const axios = require("axios");

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      { inputs: text, parameters: { max_length: 50, min_length: 10 } },
      {
        headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}` },
        timeout: 15000
      }
    );

    const summary = response.data[0]?.summary_text || text.slice(0, 100);
    res.status(200).json({ success: true, summary });
  } catch (error) {
    res.status(200).json({ success: true, summary: req.body.text?.slice(0, 100) });
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
  getTopicStats_,
  getEmotionStats_,
  getUrgencyScores_,
  summarizeFeedback,
};