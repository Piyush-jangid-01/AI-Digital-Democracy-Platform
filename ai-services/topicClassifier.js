const topicKeywords = {
  infrastructure: ["road", "pothole", "bridge", "footpath", "construction", "building", "footpath", "pavement", "streetlight", "light", "electricity pole"],
  utilities: ["water", "supply", "pipeline", "electricity", "power cut", "load shedding", "gas", "sewage", "drain", "drainage", "tanker"],
  sanitation: ["garbage", "waste", "trash", "cleaning", "sweep", "dirty", "litter", "dump", "toilet", "hygiene", "overflowing", "smell"],
  healthcare: ["hospital", "doctor", "medicine", "ambulance", "clinic", "health", "treatment", "nurse", "pharmacy", "ration"],
  education: ["school", "teacher", "student", "book", "education", "college", "class", "exam", "fees", "scholarship", "midday meal"],
  transport: ["bus", "auto", "route", "traffic", "signal", "parking", "transport", "station", "metro", "road block"],
  security: ["police", "theft", "crime", "robbery", "cctv", "camera", "security", "unsafe", "attack", "helpline", "fir"],
  amenities: ["park", "garden", "playground", "community hall", "library", "sports", "recreation", "bench", "tree"]
};

const classifyTopic = (text) => {
  const lower = text.toLowerCase();
  const scores = {};

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    scores[topic] = keywords.filter(k => lower.includes(k)).length;
  }

  const sorted = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  return {
    primaryTopic: sorted.length > 0 ? sorted[0][0] : "general",
    allTopics: sorted.map(([topic]) => topic)
  };
};

module.exports = { classifyTopic };