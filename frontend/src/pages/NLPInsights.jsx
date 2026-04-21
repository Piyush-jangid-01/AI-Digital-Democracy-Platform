import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from "recharts";

const COLORS = ["#0f3460", "#e94560", "#533483", "#22c55e", "#f59e0b", "#06b6d4", "#8b5cf6", "#ec4899", "#14b8a6"];

const NLPInsights = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoText, setDemoText] = useState("");
  const [demoResult, setDemoResult] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("heatmap");

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/nlp/feedback-stats");
      setStats(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const runDemo = async () => {
    if (!demoText.trim()) return;
    setDemoLoading(true);
    setDemoResult(null);
    try {
      const res = await API.post("/nlp/pipeline-demo", { text: demoText });
      setDemoResult(res.data.pipeline);
    } catch (e) { console.error(e); }
    finally { setDemoLoading(false); }
  };

  const sentimentColor = (s) => {
    if (s === "positive") return "#22c55e";
    if (s === "negative") return "#e94560";
    return "#f59e0b";
  };

  // build heatmap data — topics vs sentiment intensity
  const buildHeatmapData = () => {
    if (!stats?.topicSentimentBreakdown) return [];
    return Object.entries(stats.topicSentimentBreakdown).map(([topic, data]) => ({
      topic: topic.length > 18 ? topic.slice(0, 16) + "…" : topic,
      fullTopic: topic,
      negative: data.negative || 0,
      positive: data.positive || 0,
      neutral: data.neutral || 0,
      total: data.total || 0,
      riskScore: data.total > 0 ? Math.round((data.negative / data.total) * 100) : 0
    })).sort((a, b) => b.riskScore - a.riskScore);
  };

  const heatmapData = buildHeatmapData();

  const getRiskColor = (score) => {
    if (score >= 70) return { bg: "#fee2e2", border: "#ef4444", text: "#991b1b", label: "HIGH RISK" };
    if (score >= 40) return { bg: "#fef9ec", border: "#f59e0b", text: "#92400e", label: "MEDIUM" };
    return { bg: "#f0fdf4", border: "#22c55e", text: "#166534", label: "LOW" };
  };

  return (
    <Layout title="NLP Insights & Issue Heatmap">

      <div style={styles.tabBar}>
        {[
          { id: "heatmap", label: "🗺️ Issue Heatmap" },
          { id: "sentiment", label: "📊 Sentiment Analysis" },
          { id: "topics", label: "🏷️ Topic Distribution" },
          { id: "keywords", label: "🔑 Top Keywords" },
          { id: "pipeline", label: "⚙️ NLP Pipeline Demo" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ ...styles.tabBtn, ...(activeTab === tab.id ? styles.tabBtnActive : {}) }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loading}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>🧠</div>
          <div>Loading NLP analysis...</div>
        </div>
      ) : !stats ? (
        <div style={styles.empty}>
          No feedback data available yet. Submit some feedback first to see NLP insights.
        </div>
      ) : (
        <>

          {/* ── HEATMAP TAB ── */}
          {activeTab === "heatmap" && (
            <div>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>Issue Risk Heatmap</h2>
                  <p style={styles.sectionSub}>
                    Each cell shows how many negative complaints exist per issue category.
                    Darker red = higher risk area requiring attention.
                  </p>
                </div>
                <div style={styles.legend}>
                  <span style={{ ...styles.legendDot, background: "#ef4444" }} /> High Risk (70%+)
                  <span style={{ ...styles.legendDot, background: "#f59e0b", marginLeft: "12px" }} /> Medium (40–70%)
                  <span style={{ ...styles.legendDot, background: "#22c55e", marginLeft: "12px" }} /> Low (0–40%)
                </div>
              </div>

              {/* Heatmap Grid */}
              <div style={styles.heatmapGrid}>
                {heatmapData.map((item, i) => {
                  const risk = getRiskColor(item.riskScore);
                  const intensity = Math.min(item.riskScore / 100, 1);
                  const bgColor = `rgba(239, 68, 68, ${0.08 + intensity * 0.72})`;
                  return (
                    <div
                      key={i}
                      style={{
                        ...styles.heatCell,
                        background: bgColor,
                        border: `2px solid ${risk.border}`
                      }}
                    >
                      <div style={styles.heatCellTitle}>{item.fullTopic}</div>
                      <div style={{ ...styles.heatRiskScore, color: risk.text }}>
                        {item.riskScore}%
                      </div>
                      <div style={styles.heatRiskLabel}>
                        <span style={{
                          ...styles.riskBadge,
                          background: risk.bg,
                          color: risk.text,
                          border: `1px solid ${risk.border}`
                        }}>
                          {risk.label}
                        </span>
                      </div>
                      <div style={styles.heatBreakdown}>
                        <span style={styles.heatNeg}>🔴 {item.negative} neg</span>
                        <span style={styles.heatPos}>🟢 {item.positive} pos</span>
                        <span style={styles.heatNeu}>🟡 {item.neutral} neu</span>
                      </div>
                      <div style={styles.heatTotal}>Total: {item.total} reports</div>
                    </div>
                  );
                })}
              </div>

              {/* Stacked bar for heatmap */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Issue Sentiment Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={heatmapData} margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="topic" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="negative" stackId="a" fill="#e94560" name="Negative" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="neutral" stackId="a" fill="#f59e0b" name="Neutral" />
                    <Bar dataKey="positive" stackId="a" fill="#22c55e" name="Positive" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── SENTIMENT TAB ── */}
          {activeTab === "sentiment" && (
            <div>
              <div style={styles.statsRow}>
                <div style={{ ...styles.bigStatCard, borderTop: "4px solid #22c55e" }}>
                  <div style={{ ...styles.bigStatNum, color: "#22c55e" }}>
                    {stats.sentimentStats?.positivePercent || 0}%
                  </div>
                  <div style={styles.bigStatBar}>
                    <div style={{ ...styles.bigStatFill, width: `${stats.sentimentStats?.positivePercent || 0}%`, background: "#22c55e" }} />
                  </div>
                  <div style={styles.bigStatLbl}>😊 Positive Sentiment</div>
                  <div style={styles.bigStatCount}>{stats.sentimentStats?.positive || 0} feedback entries</div>
                </div>
                <div style={{ ...styles.bigStatCard, borderTop: "4px solid #e94560" }}>
                  <div style={{ ...styles.bigStatNum, color: "#e94560" }}>
                    {stats.sentimentStats?.negativePercent || 0}%
                  </div>
                  <div style={styles.bigStatBar}>
                    <div style={{ ...styles.bigStatFill, width: `${stats.sentimentStats?.negativePercent || 0}%`, background: "#e94560" }} />
                  </div>
                  <div style={styles.bigStatLbl}>😟 Negative Sentiment</div>
                  <div style={styles.bigStatCount}>{stats.sentimentStats?.negative || 0} feedback entries</div>
                </div>
                <div style={{ ...styles.bigStatCard, borderTop: "4px solid #f59e0b" }}>
                  <div style={{ ...styles.bigStatNum, color: "#f59e0b" }}>
                    {stats.sentimentStats?.neutralPercent || 0}%
                  </div>
                  <div style={styles.bigStatBar}>
                    <div style={{ ...styles.bigStatFill, width: `${stats.sentimentStats?.neutralPercent || 0}%`, background: "#f59e0b" }} />
                  </div>
                  <div style={styles.bigStatLbl}>😐 Neutral Sentiment</div>
                  <div style={styles.bigStatCount}>{stats.sentimentStats?.neutral || 0} feedback entries</div>
                </div>
              </div>

              <div style={styles.infoRow}>
                <div style={styles.infoCard}>
                  <div style={styles.infoIcon}>🤗</div>
                  <div style={styles.infoLabel}>HuggingFace NLP</div>
                  <div style={styles.infoVal}>{stats.sentimentStats?.huggingfaceUsed || 0} analyzed</div>
                </div>
                <div style={styles.infoCard}>
                  <div style={styles.infoIcon}>📝</div>
                  <div style={styles.infoLabel}>Keyword Fallback</div>
                  <div style={styles.infoVal}>{stats.sentimentStats?.fallbackUsed || 0} analyzed</div>
                </div>
                <div style={styles.infoCard}>
                  <div style={styles.infoIcon}>🎯</div>
                  <div style={styles.infoLabel}>Avg Confidence</div>
                  <div style={styles.infoVal}>{((stats.sentimentStats?.avgConfidence || 0) * 100).toFixed(1)}%</div>
                </div>
                <div style={styles.infoCard}>
                  <div style={styles.infoIcon}>📊</div>
                  <div style={styles.infoLabel}>Total Analyzed</div>
                  <div style={styles.infoVal}>{stats.totalAnalyzed}</div>
                </div>
              </div>

              {/* Radar chart for topic sentiment */}
              {heatmapData.length > 0 && (
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Issue Risk Radar</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={heatmapData.slice(0, 8)}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                      <Radar name="Risk Score %" dataKey="riskScore" stroke="#e94560" fill="#e94560" fillOpacity={0.3} />
                      <Radar name="Total Reports" dataKey="total" stroke="#0f3460" fill="#0f3460" fillOpacity={0.2} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* ── TOPICS TAB ── */}
          {activeTab === "topics" && (
            <div>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Topic Distribution from NLP Classification</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.topicDistribution || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="topic" type="category" width={160} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {(stats.topicDistribution || []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.topicTableCard}>
                <h3 style={styles.cardTitle}>Topic Details</h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Rank</th>
                      <th style={styles.th}>Topic</th>
                      <th style={styles.th}>Count</th>
                      <th style={styles.th}>Share</th>
                      <th style={styles.th}>Distribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.topicDistribution || []).map((t, i) => (
                      <tr key={i} style={i % 2 === 0 ? styles.trEven : {}}>
                        <td style={styles.td}>#{i + 1}</td>
                        <td style={{ ...styles.td, fontWeight: "600" }}>
                          <span style={{ ...styles.topicDot, background: COLORS[i % COLORS.length] }} />
                          {t.topic}
                        </td>
                        <td style={styles.td}>{t.count}</td>
                        <td style={styles.td}>{t.percentage}%</td>
                        <td style={styles.td}>
                          <div style={styles.miniBar}>
                            <div style={{
                              ...styles.miniBarFill,
                              width: `${t.percentage}%`,
                              background: COLORS[i % COLORS.length]
                            }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── KEYWORDS TAB ── */}
          {activeTab === "keywords" && (
            <div>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Top Keywords Extracted from All Feedback</h3>
                <p style={styles.cardSub}>
                  These are the most frequently occurring meaningful words after text preprocessing
                  (stop words removed, text cleaned and tokenized).
                </p>
                <div style={styles.keywordCloud}>
                  {(stats.sentimentStats?.topKeywords || []).map((kw, i) => {
                    const size = 14 + Math.min(kw.count * 2, 14);
                    return (
                      <div key={i} style={{
                        ...styles.keywordChip,
                        fontSize: `${size}px`,
                        background: COLORS[i % COLORS.length] + "18",
                        color: COLORS[i % COLORS.length],
                        border: `1px solid ${COLORS[i % COLORS.length]}44`,
                        padding: `${6 + i % 3}px ${12 + i % 4}px`
                      }}>
                        {kw.word}
                        <span style={styles.keywordCount}>{kw.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Keyword Frequency</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={stats.sentimentStats?.topKeywords || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="word" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {(stats.sentimentStats?.topKeywords || []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── PIPELINE DEMO TAB ── */}
          {activeTab === "pipeline" && (
            <div>
              <div style={styles.demoCard}>
                <h2 style={styles.demoTitle}>⚙️ Live NLP Pipeline Demo</h2>
                <p style={styles.demoSub}>
                  Enter any text and watch the full AI pipeline process it step by step —
                  exactly as described in the project synopsis.
                </p>
                <div style={styles.demoInputRow}>
                  <textarea
                    value={demoText}
                    onChange={e => setDemoText(e.target.value)}
                    placeholder="Enter feedback text here... e.g. 'The water supply pipeline has been broken for 3 days. This is terrible and pathetic service!'"
                    style={styles.demoTextarea}
                    rows={3}
                  />
                  <button
                    onClick={runDemo}
                    style={demoLoading ? styles.demoBtnDisabled : styles.demoBtn}
                    disabled={demoLoading}
                  >
                    {demoLoading ? "⏳ Processing..." : "▶ Run Pipeline"}
                  </button>
                </div>

                <div style={styles.sampleTexts}>
                  <span style={styles.sampleLabel}>Try a sample:</span>
                  {[
                    "Water supply has been unavailable for 3 days. This is a terrible problem!",
                    "The new road construction is excellent. Great work by the municipality!",
                    "School teachers are absent regularly. Education quality is very poor."
                  ].map((sample, i) => (
                    <button key={i} onClick={() => setDemoText(sample)} style={styles.sampleBtn}>
                      Sample {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {demoResult && (
                <div style={styles.pipelineSteps}>
                  {demoResult.map((step, i) => (
                    <div key={i} style={styles.pipelineStep}>
                      <div style={styles.stepHeader}>
                        <div style={styles.stepNum}>{step.step}</div>
                        <div>
                          <div style={styles.stepName}>{step.name}</div>
                          <div style={styles.stepDesc}>
                            {step.step === 1 && `${step.tokensRemoved} noise words removed · ${step.tokens?.length} meaningful tokens extracted`}
                            {step.step === 2 && `Model: ${step.source === "huggingface" ? "HuggingFace Transformer (cardiffnlp/twitter-roberta)" : "Keyword Fallback"} · Confidence: ${(step.confidence * 100).toFixed(1)}%`}
                            {step.step === 3 && `Matched keywords: ${step.matchedKeywords?.join(", ") || "none"} · Confidence: ${(step.confidence * 100).toFixed(0)}%`}
                          </div>
                        </div>
                        <div style={{
                          ...styles.stepOutput,
                          background: step.step === 2
                            ? (step.output === "positive" ? "#f0fdf4" : step.output === "negative" ? "#fff0f0" : "#fef9ec")
                            : "#f0f4ff",
                          color: step.step === 2
                            ? (step.output === "positive" ? "#15803d" : step.output === "negative" ? "#be123c" : "#92400e")
                            : "#1d4ed8"
                        }}>
                          {step.output}
                        </div>
                      </div>

                      {step.step === 1 && (
                        <div style={styles.stepDetail}>
                          <div style={styles.detailLabel}>Cleaned text:</div>
                          <div style={styles.detailText}>"{step.output}"</div>
                          {step.tokens && (
                            <div style={styles.tokenRow}>
                              {step.tokens.map((t, ti) => (
                                <span key={ti} style={styles.token}>{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {step.step === 3 && step.matchedKeywords?.length > 0 && (
                        <div style={styles.stepDetail}>
                          <div style={styles.detailLabel}>Keywords that triggered this classification:</div>
                          <div style={styles.tokenRow}>
                            {step.matchedKeywords.map((kw, ki) => (
                              <span key={ki} style={{ ...styles.token, background: "#fef9ec", color: "#92400e", border: "1px solid #fcd34d" }}>{kw}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {i < demoResult.length - 1 && <div style={styles.pipelineArrow}>↓</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

const styles = {
  tabBar: { display: "flex", gap: "4px", marginBottom: "24px", background: "white", padding: "6px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flexWrap: "wrap" },
  tabBtn: { padding: "10px 16px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#6b7280", background: "transparent" },
  tabBtnActive: { background: "#1a1a2e", color: "white" },
  loading: { textAlign: "center", padding: "80px", color: "#666", fontSize: "16px" },
  empty: { textAlign: "center", padding: "60px", color: "#9ca3af", background: "white", borderRadius: "12px" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  sectionTitle: { fontSize: "18px", fontWeight: "800", color: "#1a1a2e", marginBottom: "4px" },
  sectionSub: { fontSize: "13px", color: "#6b7280" },
  legend: { display: "flex", alignItems: "center", fontSize: "12px", color: "#6b7280", fontWeight: "600" },
  legendDot: { display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", marginRight: "4px" },
  heatmapGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "24px" },
  heatCell: { borderRadius: "12px", padding: "16px", transition: "transform 0.2s" },
  heatCellTitle: { fontSize: "13px", fontWeight: "700", color: "#1a1a2e", marginBottom: "8px" },
  heatRiskScore: { fontSize: "32px", fontWeight: "900", marginBottom: "4px" },
  heatRiskLabel: { marginBottom: "10px" },
  riskBadge: { fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "8px", textTransform: "uppercase", letterSpacing: "0.5px" },
  heatBreakdown: { display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" },
  heatNeg: { fontSize: "11px", color: "#be123c" },
  heatPos: { fontSize: "11px", color: "#15803d" },
  heatNeu: { fontSize: "11px", color: "#92400e" },
  heatTotal: { fontSize: "11px", color: "#6b7280", marginTop: "4px" },
  card: { background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "20px" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "6px" },
  cardSub: { fontSize: "12px", color: "#9ca3af", marginBottom: "20px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" },
  bigStatCard: { background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  bigStatNum: { fontSize: "40px", fontWeight: "900", marginBottom: "10px" },
  bigStatBar: { height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" },
  bigStatFill: { height: "100%", borderRadius: "4px" },
  bigStatLbl: { fontSize: "14px", fontWeight: "700", color: "#374151", marginBottom: "4px" },
  bigStatCount: { fontSize: "12px", color: "#9ca3af" },
  infoRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" },
  infoCard: { background: "white", borderRadius: "10px", padding: "16px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  infoIcon: { fontSize: "24px", marginBottom: "6px" },
  infoLabel: { fontSize: "11px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" },
  infoVal: { fontSize: "18px", fontWeight: "800", color: "#1a1a2e" },
  topicTableCard: { background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 12px", fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", borderBottom: "2px solid #f0f0f0" },
  td: { padding: "12px", fontSize: "14px", color: "#374151", borderBottom: "1px solid #f5f5f5" },
  trEven: { background: "#fafafa" },
  topicDot: { display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", marginRight: "8px" },
  miniBar: { height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden", width: "100px" },
  miniBarFill: { height: "100%", borderRadius: "3px" },
  keywordCloud: { display: "flex", flexWrap: "wrap", gap: "10px", padding: "16px 0" },
  keywordChip: { borderRadius: "20px", fontWeight: "700", cursor: "default", display: "flex", alignItems: "center", gap: "6px" },
  keywordCount: { fontSize: "11px", fontWeight: "800", opacity: 0.7 },
  demoCard: { background: "white", borderRadius: "12px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "20px" },
  demoTitle: { fontSize: "18px", fontWeight: "800", color: "#1a1a2e", marginBottom: "6px" },
  demoSub: { fontSize: "13px", color: "#6b7280", marginBottom: "20px" },
  demoInputRow: { display: "flex", gap: "12px", marginBottom: "14px" },
  demoTextarea: { flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", resize: "vertical" },
  demoBtn: { padding: "12px 24px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "14px", whiteSpace: "nowrap" },
  demoBtnDisabled: { padding: "12px 24px", background: "#ccc", color: "white", border: "none", borderRadius: "8px", cursor: "not-allowed", fontWeight: "700", fontSize: "14px", whiteSpace: "nowrap" },
  sampleTexts: { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" },
  sampleLabel: { fontSize: "12px", color: "#9ca3af", fontWeight: "600" },
  sampleBtn: { padding: "6px 14px", background: "#f0f4ff", color: "#0f3460", border: "1px solid #c7d2fe", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  pipelineSteps: { display: "flex", flexDirection: "column", gap: "0" },
  pipelineStep: { background: "white", borderRadius: "12px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "4px" },
  stepHeader: { display: "flex", alignItems: "flex-start", gap: "16px" },
  stepNum: { width: "36px", height: "36px", borderRadius: "50%", background: "#1a1a2e", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "16px", flexShrink: 0 },
  stepName: { fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "3px" },
  stepDesc: { fontSize: "12px", color: "#6b7280" },
  stepOutput: { marginLeft: "auto", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "800", whiteSpace: "nowrap", textTransform: "capitalize" },
  stepDetail: { marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #f0f0f0", paddingLeft: "52px" },
  detailLabel: { fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", marginBottom: "8px" },
  detailText: { fontSize: "13px", color: "#374151", fontStyle: "italic", marginBottom: "10px" },
  tokenRow: { display: "flex", flexWrap: "wrap", gap: "6px" },
  token: { padding: "3px 10px", background: "#f0f4ff", color: "#0f3460", borderRadius: "12px", fontSize: "12px", fontWeight: "600", border: "1px solid #c7d2fe" },
  pipelineArrow: { textAlign: "center", fontSize: "20px", color: "#9ca3af", padding: "4px 0", marginLeft: "52px" }
};

export default NLPInsights;