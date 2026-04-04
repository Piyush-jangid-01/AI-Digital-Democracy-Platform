const { fetchAndProcessSocialMedia, getSocialMediaStats } = require("../utils/socialMediaService");
const { createFeedback } = require("../models/feedbackModel");
const { updateFeedbackSentiment, updateFeedbackTopic } = require("../models/feedbackModel");
const { createSentimentResult } = require("../models/sentimentModel");
const logger = require("../utils/logger");

const getSocialMediaPosts = async (req, res) => {
  try {
    const keyword = req.query.keyword || "constituency";
    const posts = await fetchAndProcessSocialMedia(keyword);
    const stats = getSocialMediaStats(posts);
    res.status(200).json({
      success: true,
      data: posts,
      stats
    });
  } catch (error) {
    logger.error(`Social media controller error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const importSocialMediaToFeedback = async (req, res) => {
  try {
    const keyword = req.query.keyword || "constituency";
    const posts = await fetchAndProcessSocialMedia(keyword);

    const imported = [];
    for (const post of posts) {
      const feedback = await createFeedback(
        post.text,
        post.topic,
        keyword
      );
      await updateFeedbackSentiment(feedback.id, post.sentiment);
      await updateFeedbackTopic(feedback.id, post.topic);
      await createSentimentResult(feedback.id, post.sentiment, post.confidence);
      imported.push(feedback);
    }

    logger.info(`Imported ${imported.length} social media posts as feedback`);
    res.status(201).json({
      success: true,
      message: `${imported.length} posts imported as feedback`,
      data: imported
    });
  } catch (error) {
    logger.error(`Social media import error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSocialMediaStats_ = async (req, res) => {
  try {
    const keyword = req.query.keyword || "constituency";
    const posts = await fetchAndProcessSocialMedia(keyword);
    const stats = getSocialMediaStats(posts);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSocialMediaPosts,
  importSocialMediaToFeedback,
  getSocialMediaStats_
};