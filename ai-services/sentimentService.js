const axios = require("axios");

const HF_API_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest";
const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;

// Fallback keyword-based (used if API fails or is cold-starting)
const keywordFallback = (text) => {
  const lower = text.toLowerCase();
  const negWords = ["broken", "damaged", "not working", "no water", "dirty", "illegal", "dead", "accident", "pothole", "corruption", "theft", "failed", "terrible", "worst", "pathetic", "useless", "sick", "contaminated", "dangerous", "urgent", "stranded", "overflow", "died", "stopped", "cancelled", "busy", "absent"];
  const posWords = ["good", "great", "excellent", "thank", "happy", "improved", "helpful", "well maintained", "best", "appreciate", "satisfied", "nice", "clean", "working", "fixed", "resolved"];

  const negScore = negWords.filter(w => lower.includes(w)).length;
  const posScore = posWords.filter(w => lower.includes(w)).length;

  if (negScore >= 2) return { label: "negative", confidence: 0.85, source: "fallback" };
  if (posScore >= 1 && negScore === 0) return { label: "positive", confidence: 0.80, source: "fallback" };
  if (negScore === 1) return { label: "negative", confidence: 0.65, source: "fallback" };
  return { label: "neutral", confidence: 0.70, source: "fallback" };
};

const mapHFLabel = (label) => {
  // cardiffnlp model returns: LABEL_0 = negative, LABEL_1 = neutral, LABEL_2 = positive
  if (label === "LABEL_0" || label === "negative") return "negative";
  if (label === "LABEL_2" || label === "positive") return "positive";
  return "neutral";
};

const analyzeSentiment = async (text) => {
  // If no HuggingFace token, use fallback immediately
  if (!HF_TOKEN) {
    console.warn("[Sentiment] No HUGGINGFACE_TOKEN set — using keyword fallback");
    return keywordFallback(text);
  }

  try {
    const response = await axios.post(
      HF_API_URL,
      { inputs: text.slice(0, 512) }, // model max is 512 tokens
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        timeout: 8000 // 8 second timeout
      }
    );

    const results = response.data[0]; // array of { label, score }
    if (!results || !Array.isArray(results)) throw new Error("Unexpected HF response");

    // Pick the highest score
    const best = results.reduce((a, b) => (a.score > b.score ? a : b));

    return {
      label: mapHFLabel(best.label),
      confidence: parseFloat(best.score.toFixed(4)),
      source: "huggingface",
      raw: results
    };
  } catch (error) {
    // Model cold-starting (503) or rate limit (429) — fallback gracefully
    const status = error.response?.status;
    if (status === 503) {
      console.warn("[Sentiment] HuggingFace model is loading (cold start) — using fallback");
    } else if (status === 429) {
      console.warn("[Sentiment] HuggingFace rate limit hit — using fallback");
    } else {
      console.error("[Sentiment] HuggingFace error:", error.message);
    }
    return keywordFallback(text);
  }
};

module.exports = { analyzeSentiment };