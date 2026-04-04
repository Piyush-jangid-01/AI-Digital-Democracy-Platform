const logger = require("./logger");

const simulateSocialMediaFetch = async (keyword) => {
  const mockPosts = [
    {
      platform: "Twitter",
      text: `Water supply is completely broken in sector 5 ${keyword}`,
      likes: 45,
      retweets: 12,
      timestamp: new Date()
    },
    {
      platform: "Twitter",
      text: `Roads are excellent after the new construction in ${keyword}`,
      likes: 89,
      retweets: 34,
      timestamp: new Date()
    },
    {
      platform: "Facebook",
      text: `Electricity outage since 3 days in ${keyword} area. Very poor service!`,
      likes: 120,
      shares: 45,
      timestamp: new Date()
    },
    {
      platform: "Facebook",
      text: `Great work by the municipality in cleaning the streets of ${keyword}`,
      likes: 200,
      shares: 67,
      timestamp: new Date()
    },
    {
      platform: "Twitter",
      text: `Hospital in ${keyword} needs more doctors. Healthcare is suffering`,
      likes: 78,
      retweets: 23,
      timestamp: new Date()
    }
  ];
  return mockPosts;
};

const processSocialMediaPosts = async (posts) => {
  const { analyzeSentiment } = require("../../ai-services/sentimentService");
  const { classifyTopic } = require("../../ai-services/topicClassifier");

  return posts.map(post => {
    const sentiment = analyzeSentiment(post.text);
    const topic = classifyTopic(post.text);
    return {
      ...post,
      sentiment: sentiment.label,
      confidence: sentiment.confidence,
      topic: topic.primaryTopic
    };
  });
};

const fetchAndProcessSocialMedia = async (keyword) => {
  try {
    logger.info(`Fetching social media posts for keyword: ${keyword}`);
    const posts = await simulateSocialMediaFetch(keyword);
    const processed = await processSocialMediaPosts(posts);
    logger.info(`Processed ${processed.length} social media posts`);
    return processed;
  } catch (error) {
    logger.error(`Social media fetch error: ${error.message}`);
    throw error;
  }
};

const getSocialMediaStats = (posts) => {
  const total = posts.length;
  const positive = posts.filter(p => p.sentiment === "positive").length;
  const negative = posts.filter(p => p.sentiment === "negative").length;
  const neutral = posts.filter(p => p.sentiment === "neutral").length;

  const topicCounts = {};
  posts.forEach(post => {
    topicCounts[post.topic] = (topicCounts[post.topic] || 0) + 1;
  });

  return {
    total,
    positive,
    negative,
    neutral,
    topicDistribution: topicCounts,
    sentimentPercentage: {
      positive: ((positive / total) * 100).toFixed(2),
      negative: ((negative / total) * 100).toFixed(2),
      neutral: ((neutral / total) * 100).toFixed(2)
    }
  };
};

module.exports = {
  fetchAndProcessSocialMedia,
  getSocialMediaStats
};