import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";

const platformColor = {
  twitter: { bg: "#e7f3fe", color: "#1d9bf0", icon: "𝕏" },
  reddit: { bg: "#fff3e0", color: "#ff4500", icon: "🔴" }
};
const sentimentColor = { positive: "#22c55e", negative: "#f43f5e", neutral: "#f59e0b" };
const moodEmoji = { positive: "😊", negative: "😟", mixed: "😐" };

const SocialMoodMonitor = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keywords, setKeywords] = useState("Faridabad,municipality,civic issue");
  const [filter, setFilter] = useState("all");
  const [platform, setPlatform] = useState("all");

  const fetchSentiment = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/social/sentiment?keywords=${encodeURIComponent(keywords)}`);
      setData(res.data.data);
    } catch (e) {
      setError("Failed to fetch social media data. Check your API tokens in .env");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSentiment(); }, []);

  const filtered = data?.posts?.filter(p => {
    const sentimentMatch = filter === "all" || p.sentiment === filter;
    const platformMatch = platform === "all" || p.platform === platform;
    return sentimentMatch && platformMatch;
  }) || [];

  const s = data?.summary;

  return (
    <Layout title="Social Media Mood Monitor">

      <div style={styles.searchBar}>
        <input
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          placeholder="Keywords (comma separated)..."
          style={styles.keywordInput}
          onKeyDown={e => e.key === "Enter" && fetchSentiment()}
        />
        <button onClick={fetchSentiment} style={styles.fetchBtn} disabled={loading}>
          {loading ? "Analyzing..." : "🔍 Analyze"}
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {loading ? (
        <div style={styles.loadingBox}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
          <div style={styles.loadingText}>Fetching posts from Twitter & Reddit...</div>
          <div style={styles.loadingSubText}>Running AI sentiment analysis on each post...</div>
        </div>
      ) : s ? (
        <>
          <div style={{
            ...styles.moodBanner,
            background: s.overallMood === "negative"
              ? "linear-gradient(135deg,#be123c,#9f1239)"
              : s.overallMood === "positive"
                ? "linear-gradient(135deg,#065f46,#047857)"
                : "linear-gradient(135deg,#1e293b,#334155)"
          }}>
            <div>
              <div style={styles.moodLabel}>Public Mood Right Now</div>
              <div style={styles.moodValue}>{moodEmoji[s.overallMood]} {s.overallMood.toUpperCase()}</div>
              <div style={styles.moodSub}>
                Based on {s.total} posts · Top issue: <strong>{s.topCategory}</strong>
              </div>
            </div>
            <div style={styles.moodSources}>
              <div style={styles.moodSource}>𝕏 {s.twitterCount} tweets</div>
              <div style={styles.moodSource}>🔴 {s.redditCount} Reddit posts</div>
              {data.cached && (
                <div style={{ ...styles.moodSource, background: "rgba(255,255,255,0.1)" }}>⚡ Cached</div>
              )}
            </div>
          </div>

          <div style={styles.statsRow}>
            <div style={{ ...styles.statCard, borderTop: `4px solid ${sentimentColor.positive}` }}>
              <div style={{ ...styles.statNum, color: sentimentColor.positive }}>{s.positivePercent}%</div>
              <div style={styles.statBar}>
                <div style={{ ...styles.statFill, width: `${s.positivePercent}%`, background: sentimentColor.positive }} />
              </div>
              <div style={styles.statLbl}>😊 Positive · {s.positive} posts</div>
            </div>
            <div style={{ ...styles.statCard, borderTop: `4px solid ${sentimentColor.negative}` }}>
              <div style={{ ...styles.statNum, color: sentimentColor.negative }}>{s.negativePercent}%</div>
              <div style={styles.statBar}>
                <div style={{ ...styles.statFill, width: `${s.negativePercent}%`, background: sentimentColor.negative }} />
              </div>
              <div style={styles.statLbl}>😟 Negative · {s.negative} posts</div>
            </div>
            <div style={{ ...styles.statCard, borderTop: `4px solid ${sentimentColor.neutral}` }}>
              <div style={{ ...styles.statNum, color: sentimentColor.neutral }}>{s.neutralPercent}%</div>
              <div style={styles.statBar}>
                <div style={{ ...styles.statFill, width: `${s.neutralPercent}%`, background: sentimentColor.neutral }} />
              </div>
              <div style={styles.statLbl}>😐 Neutral · {s.neutral} posts</div>
            </div>
          </div>

          {Object.keys(s.categoryBreakdown).length > 0 && (
            <div style={styles.categoryCard}>
              <div style={styles.categoryTitle}>🏷️ Issues Being Discussed</div>
              <div style={styles.categoryRow}>
                {Object.entries(s.categoryBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, count]) => (
                    <div key={cat} style={styles.categoryChip}>
                      <span style={styles.categoryName}>{cat}</span>
                      <span style={styles.categoryCount}>{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              {["all", "negative", "positive", "neutral"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}>
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div style={styles.filterGroup}>
              {["all", "twitter", "reddit"].map(p => (
                <button key={p} onClick={() => setPlatform(p)}
                  style={{ ...styles.filterBtn, ...(platform === p ? styles.filterBtnActive : {}) }}>
                  {p === "all" ? "All Platforms" : p === "twitter" ? "𝕏 Twitter" : "🔴 Reddit"}
                </button>
              ))}
            </div>
            <span style={styles.resultCount}>{filtered.length} posts</span>
          </div>

          <div style={styles.postFeed}>
            {filtered.length === 0 ? (
              <div style={styles.emptyFeed}>No posts match the selected filter</div>
            ) : filtered.map(post => {
              const pc = platformColor[post.platform];
              const sc = sentimentColor[post.sentiment];
              return (
                <div key={`${post.platform}-${post.id}`} style={styles.postCard}>
                  <div style={styles.postHeader}>
                    <div style={styles.postLeft}>
                      <span style={{ ...styles.platformBadge, background: pc.bg, color: pc.color }}>
                        {pc.icon} {post.platform === "twitter" ? "Twitter/X" : `r/${post.subreddit || "reddit"}`}
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "10px", background: sc + "22", color: sc }}>
                        ● {post.sentiment}
                      </span>
                      <span style={styles.confidenceBadge}>
                        {Math.round((post.confidence || 0) * 100)}% confidence
                      </span>
                    </div>
                    <span style={styles.postDate}>
                      {new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p style={styles.postText}>{post.text}</p>

                  <div style={styles.postFooter}>
                    <span style={styles.postAuthor}>@{post.author}</span>
                    <div style={styles.postMeta}>
                      {post.likes > 0 && <span>❤️ {post.likes}</span>}
                      {post.retweets > 0 && <span>🔁 {post.retweets}</span>}
                      {post.comments > 0 && <span>💬 {post.comments}</span>}
                    </div>
                    <a href={post.url} target="_blank" rel="noreferrer" style={styles.viewLink}>
                      View Post →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={styles.emptyFeed}>
          No data. Enter keywords above and click Analyze.
          <br />
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>
            Reddit works without any token. Twitter needs TWITTER_BEARER_TOKEN in .env
          </span>
        </div>
      )}
    </Layout>
  );
};

const styles = {
  searchBar: { display: "flex", gap: "10px", marginBottom: "20px" },
  keywordInput: { flex: 1, padding: "11px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" },
  fetchBtn: { padding: "11px 24px", background: "#0f3460", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" },
  errorBox: { background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" },
  loadingBox: { textAlign: "center", padding: "64px 20px" },
  loadingText: { fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" },
  loadingSubText: { fontSize: "13px", color: "#9ca3af" },
  moodBanner: { borderRadius: "14px", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  moodLabel: { color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" },
  moodValue: { color: "white", fontSize: "28px", fontWeight: "800", marginBottom: "4px" },
  moodSub: { color: "rgba(255,255,255,0.7)", fontSize: "12px" },
  moodSources: { display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" },
  moodSource: { background: "rgba(255,255,255,0.15)", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "16px" },
  statCard: { background: "white", borderRadius: "10px", padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  statNum: { fontSize: "28px", fontWeight: "800", marginBottom: "8px" },
  statBar: { height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden", marginBottom: "8px" },
  statFill: { height: "100%", borderRadius: "3px" },
  statLbl: { fontSize: "12px", color: "#6b7280" },
  categoryCard: { background: "white", borderRadius: "10px", padding: "16px 20px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  categoryTitle: { fontSize: "12px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" },
  categoryRow: { display: "flex", flexWrap: "wrap", gap: "8px" },
  categoryChip: { display: "flex", alignItems: "center", gap: "6px", background: "#f0f4ff", borderRadius: "20px", padding: "5px 12px" },
  categoryName: { fontSize: "12px", fontWeight: "600", color: "#0f3460" },
  categoryCount: { fontSize: "11px", fontWeight: "800", background: "#0f3460", color: "white", borderRadius: "10px", padding: "1px 7px" },
  filterRow: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "16px" },
  filterGroup: { display: "flex", gap: "4px" },
  filterBtn: { padding: "7px 14px", border: "1px solid #e2e8f0", borderRadius: "20px", background: "white", fontSize: "12px", fontWeight: "600", color: "#6b7280", cursor: "pointer" },
  filterBtnActive: { background: "#0f3460", color: "white", border: "1px solid #0f3460" },
  resultCount: { fontSize: "12px", color: "#9ca3af", marginLeft: "auto" },
  postFeed: { display: "flex", flexDirection: "column", gap: "12px" },
  emptyFeed: { textAlign: "center", padding: "48px", color: "#9ca3af", background: "white", borderRadius: "12px", lineHeight: "2" },
  postCard: { background: "white", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  postHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" },
  postLeft: { display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" },
  platformBadge: { fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "10px" },
  confidenceBadge: { fontSize: "10px", color: "#9ca3af", background: "#f8fafc", padding: "3px 8px", borderRadius: "8px" },
  postDate: { fontSize: "11px", color: "#9ca3af" },
  postText: { fontSize: "13px", color: "#374151", lineHeight: "1.6", marginBottom: "12px" },
  postFooter: { display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "10px" },
  postAuthor: { fontSize: "12px", fontWeight: "600", color: "#6b7280" },
  postMeta: { display: "flex", gap: "10px", fontSize: "11px", color: "#9ca3af" },
  viewLink: { marginLeft: "auto", fontSize: "12px", color: "#0f3460", fontWeight: "600", textDecoration: "none" }
};

export default SocialMoodMonitor;