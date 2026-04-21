const axios = require("axios");
const { analyzeSentiment } = require("./sentimentService");

// ─── TWITTER / X ───────────────────────────────────────────────
// Uses Twitter API v2 (free tier: 500k tweets/month read)
const TWITTER_BEARER = process.env.TWITTER_BEARER_TOKEN;

const searchTwitter = async (query, maxResults = 20) => {
  if (!TWITTER_BEARER) {
    console.warn("[Social] No TWITTER_BEARER_TOKEN — skipping Twitter");
    return [];
  }
  try {
    const res = await axios.get("https://api.twitter.com/2/tweets/search/recent", {
      headers: { Authorization: `Bearer ${TWITTER_BEARER}` },
      params: {
        query: `${query} lang:en -is:retweet`,
        max_results: Math.min(maxResults, 100),
        "tweet.fields": "created_at,public_metrics,author_id",
        expansions: "author_id",
        "user.fields": "username,name"
      },
      timeout: 10000
    });

    const tweets = res.data?.data || [];
    const users = res.data?.includes?.users || [];
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    return tweets.map(t => ({
      id: t.id,
      text: t.text,
      platform: "twitter",
      author: userMap[t.author_id]?.username || "unknown",
      created_at: t.created_at,
      likes: t.public_metrics?.like_count || 0,
      retweets: t.public_metrics?.retweet_count || 0,
      url: `https://twitter.com/i/web/status/${t.id}`
    }));
  } catch (err) {
    console.error("[Social] Twitter fetch error:", err.response?.data || err.message);
    return [];
  }
};

// ─── REDDIT ────────────────────────────────────────────────────
// Uses Reddit public JSON API — no auth needed
const searchReddit = async (query, subreddits = ["india", "delhi", "Faridabad", "Haryana"], limit = 10) => {
  const results = [];
  for (const sub of subreddits) {
    try {
      const res = await axios.get(
        `https://www.reddit.com/r/${sub}/search.json`,
        {
          params: { q: query, sort: "new", limit, restrict_sr: true },
          headers: { "User-Agent": "DigitalDemocracy/1.0" },
          timeout: 8000
        }
      );
      const posts = res.data?.data?.children || [];
      posts.forEach(p => {
        const d = p.data;
        if (d.score > 0) {
          results.push({
            id: d.id,
            text: `${d.title}. ${d.selftext?.slice(0, 300) || ""}`.trim(),
            platform: "reddit",
            author: d.author,
            subreddit: d.subreddit,
            created_at: new Date(d.created_utc * 1000).toISOString(),
            likes: d.score,
            comments: d.num_comments,
            url: `https://reddit.com${d.permalink}`
          });
        }
      });
    } catch (err) {
      console.warn(`[Social] Reddit r/${sub} error:`, err.message);
    }
  }
  return results;
};

// ─── MAIN ANALYZER ─────────────────────────────────────────────
const analyzeSocialMedia = async (keywords = ["Faridabad", "civic issue", "municipality"]) => {
  const query = keywords.join(" OR ");

  // Fetch from both platforms in parallel
  const [tweets, redditPosts] = await Promise.all([
    searchTwitter(query, 20),
    searchReddit(keywords[0], ["india", "Faridabad", "Haryana", "delhi"], 8)
  ]);

  const allPosts = [...tweets, ...redditPosts];

  if (allPosts.length === 0) {
    return { posts: [], summary: null };
  }

  // Run sentiment on each post
  const analyzed = await Promise.all(
    allPosts.map(async (post) => {
      const sentiment = await analyzeSentiment(post.text);
      return { ...post, sentiment: sentiment.label, confidence: sentiment.confidence };
    })
  );

  // Build summary stats
  const total = analyzed.length;
  const neg = analyzed.filter(p => p.sentiment === "negative").length;
  const pos = analyzed.filter(p => p.sentiment === "positive").length;
  const neu = analyzed.filter(p => p.sentiment === "neutral").length;

  // Category auto-detection from post text
  const categoryMap = {
    "water": "Water Supply", "pipeline": "Water Supply",
    "road": "Roads", "pothole": "Roads",
    "electricity": "Electricity", "power cut": "Electricity",
    "garbage": "Sanitation", "waste": "Sanitation",
    "hospital": "Healthcare", "doctor": "Healthcare",
    "school": "Education", "teacher": "Education",
    "bus": "Public Transport", "traffic": "Public Transport",
    "police": "Security", "theft": "Security"
  };

  const categoryCount = {};
  analyzed.forEach(post => {
    const lower = post.text.toLowerCase();
    for (const [kw, cat] of Object.entries(categoryMap)) {
      if (lower.includes(kw)) {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        break;
      }
    }
  });

  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "General";
  const mood = neg / total > 0.6 ? "negative" : pos / total > 0.5 ? "positive" : "mixed";

  return {
    posts: analyzed.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    summary: {
      total,
      positive: pos,
      negative: neg,
      neutral: neu,
      positivePercent: Math.round((pos / total) * 100),
      negativePercent: Math.round((neg / total) * 100),
      neutralPercent: Math.round((neu / total) * 100),
      overallMood: mood,
      topCategory,
      categoryBreakdown: categoryCount,
      twitterCount: tweets.length,
      redditCount: redditPosts.length,
      fetchedAt: new Date().toISOString()
    }
  };
};

// Cache layer — avoid hammering APIs on every admin page load
let cache = { data: null, timestamp: null };
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const getSocialSentiment = async (keywords) => {
  const now = Date.now();
  if (cache.data && cache.timestamp && (now - cache.timestamp) < CACHE_TTL) {
    console.log("[Social] Returning cached result");
    return { ...cache.data, cached: true };
  }
  const result = await analyzeSocialMedia(keywords);
  cache = { data: result, timestamp: now };
  return { ...result, cached: false };
};

module.exports = { getSocialSentiment, searchTwitter, searchReddit };