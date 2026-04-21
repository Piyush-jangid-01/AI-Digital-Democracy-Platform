import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";

const moodConfig = {
  critical: { color: "#dc2626", bg: "#fee2e2", icon: "🔴", border: "#ef4444" },
  concerning: { color: "#d97706", bg: "#fef9ec", icon: "🟡", border: "#f59e0b" },
  mixed: { color: "#2563eb", bg: "#eff6ff", icon: "🔵", border: "#3b82f6" },
  "mostly positive": { color: "#059669", bg: "#ecfdf5", icon: "🟢", border: "#10b981" },
  positive: { color: "#16a34a", bg: "#f0fdf4", icon: "✅", border: "#22c55e" }
};

const Reports = () => {
  const [constituencies, setConstituencies] = useState([]);
  const [selected, setSelected] = useState("overall");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchConstituencies();
    fetchReport("overall");
  }, []);

  const fetchConstituencies = async () => {
    try {
      const res = await API.get("/summary/list");
      setConstituencies(res.data.data);
    } catch (e) { console.error(e); }
  };

  const fetchReport = async (id) => {
    setLoading(true);
    setReport(null);
    try {
      const url = id === "overall"
        ? "/summary/overall"
        : `/summary/constituency/${id}`;
      const res = await API.get(url);
      setReport(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSelect = (val) => {
    setSelected(val);
    fetchReport(val);
  };

  const copyReport = () => {
    if (report?.summary) {
      navigator.clipboard.writeText(report.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadReport = () => {
    if (!report?.summary) return;
    const blob = new Blob([report.summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `constituency-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const mood = report?.stats?.overallMood;
  const moodStyle = moodConfig[mood] || moodConfig["mixed"];

  return (
    <Layout title="Constituency Intelligence Reports">

      <div style={styles.topBar}>
        <div style={styles.selectorGroup}>
          <label style={styles.selectorLabel}>Generate Report For:</label>
          <select
            value={selected}
            onChange={e => handleSelect(e.target.value)}
            style={styles.selector}
          >
            <option value="overall">🌐 All Constituencies (Overall)</option>
            {constituencies.map(c => (
              <option key={c.id} value={c.id}>🏛️ {c.name} — {c.city}</option>
            ))}
          </select>
          <button onClick={() => fetchReport(selected)} style={styles.refreshBtn}>
            🔄 Regenerate
          </button>
        </div>
        <div style={styles.actionBtns}>
          <button onClick={copyReport} style={styles.copyBtn}>
            {copied ? "✅ Copied!" : "📋 Copy Report"}
          </button>
          <button onClick={downloadReport} style={styles.downloadBtn}>
            📥 Download .txt
          </button>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📊</div>
          <div style={styles.loadingText}>Generating AI Report...</div>
          <div style={styles.loadingSub}>Analyzing sentiment, issues, and trends...</div>
        </div>
      ) : report ? (
        <div>
          {/* mood banner */}
          {mood && (
            <div style={{
              ...styles.moodBanner,
              background: moodStyle.bg,
              border: `2px solid ${moodStyle.border}`
            }}>
              <span style={styles.moodIcon}>{moodStyle.icon}</span>
              <div>
                <div style={{ ...styles.moodLabel, color: moodStyle.color }}>
                  Overall Public Mood: {mood?.toUpperCase()}
                </div>
                <div style={styles.moodSub}>
                  Based on {report.stats?.feedback?.total} feedback submissions ·
                  Generated {new Date(report.generatedAt).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          )}

          {/* stat cards */}
          {report.stats && (
            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <div style={styles.statNum}>{report.stats.feedback.total}</div>
                <div style={styles.statLbl}>Total Feedback</div>
              </div>
              <div style={{ ...styles.statCard, borderTop: "3px solid #22c55e" }}>
                <div style={{ ...styles.statNum, color: "#22c55e" }}>
                  {report.stats.feedback.posPercent}%
                </div>
                <div style={styles.statLbl}>Positive</div>
              </div>
              <div style={{ ...styles.statCard, borderTop: "3px solid #e94560" }}>
                <div style={{ ...styles.statNum, color: "#e94560" }}>
                  {report.stats.feedback.negPercent}%
                </div>
                <div style={styles.statLbl}>Negative</div>
              </div>
              <div style={{ ...styles.statCard, borderTop: "3px solid #f59e0b" }}>
                <div style={{ ...styles.statNum, color: "#f59e0b" }}>
                  {report.stats.feedback.escalated}
                </div>
                <div style={styles.statLbl}>Escalated</div>
              </div>
              <div style={{ ...styles.statCard, borderTop: "3px solid #0f3460" }}>
                <div style={{ ...styles.statNum, color: "#0f3460" }}>
                  {report.stats.workers}
                </div>
                <div style={styles.statLbl}>Field Workers</div>
              </div>
              <div style={{ ...styles.statCard, borderTop: "3px solid #533483" }}>
                <div style={{ ...styles.statNum, color: "#533483" }}>
                  {report.stats.tasks.completed}/{report.stats.tasks.total}
                </div>
                <div style={styles.statLbl}>Tasks Done</div>
              </div>
            </div>
          )}

          <div style={styles.contentGrid}>

            {/* top issues */}
            {report.stats?.topIssues?.length > 0 && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>🔥 Top Issues</h3>
                {report.stats.topIssues.map((issue, i) => (
                  <div key={i} style={styles.issueRow}>
                    <div style={styles.issueRank}>#{i + 1}</div>
                    <div style={styles.issueName}>{issue.topic}</div>
                    <div style={styles.issueCount}>{issue.count} reports</div>
                    <div style={styles.issueBar}>
                      <div style={{
                        ...styles.issueBarFill,
                        width: `${Math.min(issue.count * 10, 100)}%`
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* top locations */}
            {report.stats?.topLocations?.length > 0 && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>📍 Most Active Locations</h3>
                {report.stats.topLocations.map((loc, i) => (
                  <div key={i} style={styles.issueRow}>
                    <div style={styles.issueRank}>#{i + 1}</div>
                    <div style={styles.issueName}>{loc.location}</div>
                    <div style={styles.issueCount}>{loc.count} reports</div>
                    <div style={styles.issueBar}>
                      <div style={{
                        ...styles.issueBarFill,
                        width: `${Math.min(loc.count * 10, 100)}%`,
                        background: "#533483"
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* recent critical complaints */}
          {report.stats?.recentNegative?.length > 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🚨 Recent Critical Complaints</h3>
              {report.stats.recentNegative.map((f, i) => (
                <div key={i} style={styles.complaintRow}>
                  <div style={styles.complaintHeader}>
                    <span style={styles.complaintCategory}>{f.category || "General"}</span>
                    <span style={styles.complaintLocation}>📍 {f.location}</span>
                    <span style={styles.complaintDate}>
                      {new Date(f.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p style={styles.complaintText}>{f.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* full text report */}
          <div style={styles.reportCard}>
            <div style={styles.reportHeader}>
              <h3 style={styles.cardTitle}>📄 Full Intelligence Report</h3>
              <div style={styles.reportActions}>
                <button onClick={copyReport} style={styles.smallCopyBtn}>
                  {copied ? "✅" : "📋"} Copy
                </button>
                <button onClick={downloadReport} style={styles.smallDownloadBtn}>
                  📥 Download
                </button>
              </div>
            </div>
            <pre style={styles.reportText}>{report.summary}</pre>
          </div>

        </div>
      ) : null}
    </Layout>
  );
};

const styles = {
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" },
  selectorGroup: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  selectorLabel: { fontSize: "13px", fontWeight: "600", color: "#374151" },
  selector: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", minWidth: "280px" },
  refreshBtn: { padding: "10px 16px", background: "#f0f4ff", color: "#0f3460", border: "1px solid #c7d2fe", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  actionBtns: { display: "flex", gap: "8px" },
  copyBtn: { padding: "10px 16px", background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  downloadBtn: { padding: "10px 16px", background: "#0f3460", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  loading: { textAlign: "center", padding: "80px", background: "white", borderRadius: "12px" },
  loadingText: { fontSize: "16px", fontWeight: "700", color: "#1a1a2e", marginBottom: "6px" },
  loadingSub: { fontSize: "13px", color: "#9ca3af" },
  moodBanner: { borderRadius: "12px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" },
  moodIcon: { fontSize: "36px" },
  moodLabel: { fontSize: "18px", fontWeight: "800", marginBottom: "4px" },
  moodSub: { fontSize: "12px", color: "#6b7280" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px", marginBottom: "20px" },
  statCard: { background: "white", borderRadius: "10px", padding: "16px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  statNum: { fontSize: "22px", fontWeight: "800", color: "#1a1a2e", marginBottom: "4px" },
  statLbl: { fontSize: "11px", color: "#9ca3af", fontWeight: "600" },
  contentGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" },
  card: { background: "white", borderRadius: "12px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "16px" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px" },
  issueRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" },
  issueRank: { width: "28px", height: "28px", borderRadius: "50%", background: "#f0f4ff", color: "#0f3460", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", flexShrink: 0 },
  issueName: { flex: 1, fontSize: "13px", fontWeight: "600", color: "#374151" },
  issueCount: { fontSize: "12px", color: "#9ca3af", whiteSpace: "nowrap" },
  issueBar: { width: "80px", height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" },
  issueBarFill: { height: "100%", background: "#e94560", borderRadius: "3px" },
  complaintRow: { padding: "14px", background: "#fff8f8", borderRadius: "8px", border: "1px solid #fecdd3", marginBottom: "10px" },
  complaintHeader: { display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" },
  complaintCategory: { fontSize: "11px", fontWeight: "700", background: "#fee2e2", color: "#991b1b", padding: "3px 10px", borderRadius: "10px" },
  complaintLocation: { fontSize: "12px", color: "#6b7280" },
  complaintDate: { fontSize: "11px", color: "#9ca3af", marginLeft: "auto" },
  complaintText: { fontSize: "13px", color: "#374151", lineHeight: "1.5", margin: 0 },
  reportCard: { background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  reportHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  reportActions: { display: "flex", gap: "8px" },
  smallCopyBtn: { padding: "6px 14px", background: "#f0f0f0", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  smallDownloadBtn: { padding: "6px 14px", background: "#0f3460", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  reportText: { background: "#f8fafc", padding: "20px", borderRadius: "8px", fontSize: "12px", lineHeight: "1.8", color: "#374151", whiteSpace: "pre-wrap", fontFamily: "monospace", overflowX: "auto" }
};

export default Reports;