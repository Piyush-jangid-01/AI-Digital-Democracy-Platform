const { preprocessText } = require("./sentimentService");

const topicKeywords = {
  "Water Supply": [
    "water", "supply", "pipeline", "tap", "drainage", "sewage", "flood",
    "waterlogging", "drinking", "shortage", "tanker", "borewell", "contaminated"
  ],
  "Roads & Infrastructure": [
    "road", "pothole", "bridge", "footpath", "construction", "pavement",
    "streetlight", "broken road", "damaged road", "speed breaker", "divider"
  ],
  "Electricity": [
    "electricity", "power", "light", "current", "voltage", "transformer",
    "power cut", "blackout", "electric", "no power", "outage", "load shedding"
  ],
  "Healthcare": [
    "hospital", "doctor", "medicine", "health", "clinic", "ambulance",
    "medical", "nurse", "treatment", "pharmacy", "disease", "ration"
  ],
  "Education": [
    "school", "college", "teacher", "education", "student", "books",
    "university", "classes", "exam", "fees", "library", "midday meal"
  ],
  "Sanitation": [
    "garbage", "waste", "trash", "cleaning", "dirty", "hygiene",
    "toilet", "sanitation", "dustbin", "sweeper", "filth", "overflowing"
  ],
  "Security": [
    "crime", "theft", "police", "safety", "robbery", "harassment",
    "security", "assault", "violence", "danger", "unsafe", "cctv", "fir"
  ],
  "Public Transport": [
    "bus", "metro", "auto", "taxi", "transport", "route",
    "station", "rickshaw", "commute", "fare", "traffic", "signal"
  ],
  "Parks & Amenities": [
    "park", "garden", "playground", "community", "library", "sports",
    "recreation", "bench", "tree", "green", "open space"
  ]
};

// ─── MAIN CLASSIFIER ──────────────────────────────────────────────────────────
const classifyTopic = (text) => {
  // preprocess first
  const preprocessed = preprocessText(text);
  const lowerText = (preprocessed.cleaned || text).toLowerCase();

  const scores = {};
  const matchedKeywords = {};

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    const matched = keywords.filter(k => lowerText.includes(k));
    scores[topic] = matched.length;
    if (matched.length > 0) matchedKeywords[topic] = matched;
  }

  const sorted = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  const primaryTopic = sorted.length > 0 ? sorted[0][0] : "General";
  const confidence = sorted.length > 0
    ? Math.min(sorted[0][1] * 0.25, 1.0)
    : 0.0;

  return {
    primaryTopic,
    confidence: parseFloat(confidence.toFixed(2)),
    allTopics: sorted.map(([topic, score]) => ({ topic, score })),
    matchedKeywords: matchedKeywords[primaryTopic] || [],
    preprocessing: preprocessed
  };
};

// ─── BATCH CLASSIFIER ─────────────────────────────────────────────────────────
const classifyTopicBatch = (texts) => {
  return texts.map(text => classifyTopic(text));
};

// ─── TOPIC DISTRIBUTION FROM ARRAY OF TEXTS ──────────────────────────────────
const getTopicDistribution = (texts) => {
  const results = classifyTopicBatch(texts);
  const distribution = {};

  results.forEach(r => {
    distribution[r.primaryTopic] = (distribution[r.primaryTopic] || 0) + 1;
  });

  const total = results.length;
  return Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({
      topic,
      count,
      percentage: Math.round((count / total) * 100)
    }));
};

module.exports = { classifyTopic, classifyTopicBatch, getTopicDistribution };