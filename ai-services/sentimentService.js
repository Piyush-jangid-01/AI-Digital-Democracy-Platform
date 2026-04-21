const axios = require("axios");

const HF_API_URL = "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base";
const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;

const EMOTION_TO_SENTIMENT = {
  anger: "negative",
  disgust: "negative",
  fear: "negative",
  sadness: "negative",
  joy: "positive",
  surprise: "neutral",
  neutral: "neutral"
};

const EMOTION_WEIGHTS = {
  anger: 0.95,
  disgust: 0.90,
  fear: 0.85,
  sadness: 0.80,
  joy: 0.90,
  surprise: 0.60,
  neutral: 0.70
};

const keywordFallback = (text) => {
  const lower = text.toLowerCase();

  const negativePatterns = [
    "not working", "no water", "no electricity", "power cut",
    "broken", "damaged", "pothole", "garbage", "dirty",
    "corrupt", "theft", "accident", "dangerous", "unsafe",
    "months ago", "weeks ago", "still not", "nobody", "ignored",
    "pathetic", "terrible", "worst", "useless", "failed",
    "dead", "died", "flood", "overflow", "contaminated",
    "complain", "complaint", "issue", "problem", "urgent"
  ];

  const positivePatterns = [
    "thank", "great", "excellent", "improved", "fixed",
    "resolved", "happy", "satisfied", "good work", "well done",
    "appreciate", "clean", "working now", "finally done"
  ];

  const negScore = negativePatterns.filter(p => lower.includes(p)).length;
  const posScore = positivePatterns.filter(p => lower.includes(p)).length;

  if (negScore >= 2) return { label: "negative", confidence: 0.88, emotion: "anger", source: "fallback" };
  if (negScore === 1 && posScore === 0) return { label: "negative", confidence: 0.72, emotion: "disgust", source: "fallback" };
  if (posScore >= 1 && negScore === 0) return { label: "positive", confidence: 0.82, emotion: "joy", source: "fallback" };
  return { label: "neutral", confidence: 0.65, emotion: "neutral", source: "fallback" };
};

const preprocessText = (text) => {
  return text
    .replace(/[^\w\s.,!?'-]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 512)
    .trim();
};

const analyzeSentiment = async (text) => {
  if (!HF_TOKEN) {
    console.warn("[Sentiment] No token — using fallback");
    return keywordFallback(text);
  }

  const cleanText = preprocessText(text);

  try {
    const response = await axios.post(
      HF_API_URL,
      { inputs: cleanText },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    const results = response.data[0];
    if (!results || !Array.isArray(results)) throw new Error("Bad response");

    // Sort by score
    const sorted = results.sort((a, b) => b.score - a.score);
    const topEmotion = sorted[0];

    // Get dominant sentiment
    const sentiment = EMOTION_TO_SENTIMENT[topEmotion.label] || "neutral";
    const confidence = EMOTION_WEIGHTS[topEmotion.label] * topEmotion.score;

    // Check if multiple negative emotions dominate
    const negativeScore = sorted
      .filter(e => EMOTION_TO_SENTIMENT[e.label] === "negative")
      .reduce((sum, e) => sum + e.score, 0);

    const positiveScore = sorted
      .filter(e => EMOTION_TO_SENTIMENT[e.label] === "positive")
      .reduce((sum, e) => sum + e.score, 0);

    // Final label based on combined scores
    let finalLabel = "neutral";
    if (negativeScore > 0.4) finalLabel = "negative";
    else if (positiveScore > 0.4) finalLabel = "positive";

    return {
      label: finalLabel,
      confidence: parseFloat(confidence.toFixed(4)),
      emotion: topEmotion.label,
      emotionScore: parseFloat(topEmotion.score.toFixed(4)),
      allEmotions: sorted.map(e => ({
        emotion: e.label,
        score: parseFloat(e.score.toFixed(4)),
        sentiment: EMOTION_TO_SENTIMENT[e.label]
      })),
      negativeScore: parseFloat(negativeScore.toFixed(4)),
      positiveScore: parseFloat(positiveScore.toFixed(4)),
      source: "huggingface"
    };

  } catch (error) {
    const status = error.response?.status;
    if (status === 503) {
      console.warn("[Sentiment] Model loading — using fallback");
    } else if (status === 429) {
      console.warn("[Sentiment] Rate limited — using fallback");
    } else {
      console.error("[Sentiment] Error:", error.message);
    }
    return keywordFallback(text);
  }
};

module.exports = { analyzeSentiment };