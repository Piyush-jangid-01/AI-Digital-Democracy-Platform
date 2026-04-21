const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { analyzeSentiment, getNLPStats, preprocessText } = require("../../ai-services/sentimentService");
const { classifyTopic, getTopicDistribution } = require("../../ai-services/topicClassifier");
const pool = require("../config/db");

// analyze single text — shows full NLP pipeline
router.post("/analyze", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "text is required" });

    const preprocessing = preprocessText(text);
    const sentiment = await analyzeSentiment(text);
    const topic = classifyTopic(text);

    res.status(200).json({
      success: true,
      data: {
        original: text,
        preprocessing: {
          cleaned: preprocessing.cleaned,
          tokens: preprocessing.tokens,
          tokenCount: preprocessing.tokenCount
        },
        sentiment: {
          label: sentiment.label,
          confidence: sentiment.confidence,
          source: sentiment.source
        },
        topic: {
          primary: topic.primaryTopic,
          confidence: topic.confidence,
          matchedKeywords: topic.matchedKeywords,
          allTopics: topic.allTopics
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// batch analyze all feedback in DB and return NLP stats
router.get("/feedback-stats", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, description, sentiment, topic FROM feedback ORDER BY created_at DESC LIMIT 100"
    );
    const feedbacks = result.rows;

    if (feedbacks.length === 0) {
      return res.status(200).json({ success: true, data: null });
    }

    const texts = feedbacks.map(f => f.description);
    const stats = await getNLPStats(texts);
    const topicDist = getTopicDistribution(texts);

    // sentiment breakdown by topic
    const topicSentiment = {};
    feedbacks.forEach(f => {
      if (!f.topic) return;
      if (!topicSentiment[f.topic]) {
        topicSentiment[f.topic] = { positive: 0, negative: 0, neutral: 0, total: 0 };
      }
      topicSentiment[f.topic][f.sentiment || "neutral"]++;
      topicSentiment[f.topic].total++;
    });

    res.status(200).json({
      success: true,
      data: {
        totalAnalyzed: feedbacks.length,
        sentimentStats: stats,
        topicDistribution: topicDist,
        topicSentimentBreakdown: topicSentiment
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// preprocess + analyze a text without saving — useful for demo
router.post("/pipeline-demo", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "text is required" });

    const step1 = preprocessText(text);
    const step2 = await analyzeSentiment(text);
    const step3 = classifyTopic(text);

    res.status(200).json({
      success: true,
      pipeline: [
        {
          step: 1,
          name: "Text Preprocessing",
          input: text,
          output: step1.cleaned,
          tokens: step1.tokens,
          tokensRemoved: text.split(" ").length - step1.tokens.length
        },
        {
          step: 2,
          name: "Sentiment Analysis (NLP Model)",
          input: step1.cleaned,
          output: step2.label,
          confidence: step2.confidence,
          source: step2.source
        },
        {
          step: 3,
          name: "Topic Classification",
          input: step1.cleaned,
          output: step3.primaryTopic,
          matchedKeywords: step3.matchedKeywords,
          confidence: step3.confidence
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;