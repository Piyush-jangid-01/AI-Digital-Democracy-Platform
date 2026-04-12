import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";

const sentimentColors = {
  positive: { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  negative: { bg: "#fff1f2", color: "#be123c", dot: "#f43f5e" },
  neutral: { bg: "#f8fafc", color: "#475569", dot: "#94a3b8" },
  escalated: { bg: "#fff7ed", color: "#c2410c", dot: "#f97316" }
};

const statusOptions = ["open", "in-progress", "resolved", "rejected"];
const priorityOptions = ["low", "medium", "high", "critical"];

const priorityColor = (p) => {
  if (p === "critical") return { bg: "#fff1f2", color: "#be123c" };
  if (p === "high") return { bg: "#fff7ed", color: "#c2410c" };
  if (p === "medium") return { bg: "#fefce8", color: "#a16207" };
  return { bg: "#f0fdf4", color: "#15803d" };
};

const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSentiment, setFilterSentiment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [lightbox, setLightbox] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [fRes, wRes] = await Promise.all([
        API.get("/feedback"),
        API.get("/workers")
      ]);
      setFeedback(fRes.data.data);
      setWorkers(wRes.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/feedback/${id}/status`, { status });
      setFeedback(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    } catch (e) { console.error(e); }
  };

  const updatePriority = async (id, priority) => {
    try {
      await API.patch(`/feedback/${id}/priority`, { priority });
      setFeedback(prev => prev.map(f => f.id === id ? { ...f, priority } : f));
    } catch (e) { console.error("Priority update:", e); }
    setFeedback(prev => prev.map(f => f.id === id ? { ...f, priority } : f));
  };

  const assignWorker = async (id, worker_id) => {
    try {
      await API.patch(`/feedback/${id}/assign`, { worker_id });
      const worker = workers.find(w => w.id === parseInt(worker_id));
      setFeedback(prev => prev.map(f => f.id === id ? { ...f, assigned_worker: worker?.name || "Assigned" } : f));
    } catch (e) { console.error("Assign worker:", e); }
  };

  const exportCSV = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/feedback/export/csv");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "feedback.csv"; a.click();
    } catch (e) { console.error(e); }
  };

  const categories = [...new Set(feedback.map(f => f.category).filter(Boolean))];

  const filtered = feedback.filter(f => {
    const matchSentiment = filterSentiment === "all" || f.sentiment === filterSentiment;
    const matchStatus = filterStatus === "all" || (f.status || "open") === filterStatus;
    const matchCategory = filterCategory === "all" || f.category === filterCategory;
    const matchSearch = !search || f.description?.toLowerCase().includes(search.toLowerCase()) || f.location?.toLowerCase().includes(search.toLowerCase());
    return matchSentiment && matchStatus && matchCategory && matchSearch;
  });

  const counts = {
    total: feedback.length,
    open: feedback.filter(f => !f.status || f.status === "open").length,
    inProgress: feedback.filter(f => f.status === "in-progress").length,
    resolved: feedback.filter(f => f.status === "resolved").length,
    negative: feedback.filter(f => f.sentiment === "negative").length,
  };

  return (
    <Layout title="Feedback Management">
      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.stat}><div style={styles.statNum}>{counts.total}</div><div style={styles.statLbl}>Total</div></div>
        <div style={{ ...styles.stat, borderLeft: "3px solid #3b82f6" }}><div style={{ ...styles.statNum, color: "#3b82f6" }}>{counts.open}</div><div style={styles.statLbl}>Open</div></div>
        <div style={{ ...styles.stat, borderLeft: "3px solid #f59e0b" }}><div style={{ ...styles.statNum, color: "#f59e0b" }}>{counts.inProgress}</div><div style={styles.statLbl}>In Progress</div></div>
        <div style={{ ...styles.stat, borderLeft: "3px solid #22c55e" }}><div style={{ ...styles.statNum, color: "#22c55e" }}>{counts.resolved}</div><div style={styles.statLbl}>Resolved</div></div>
        <div style={{ ...styles.stat, borderLeft: "3px solid #f43f5e" }}><div style={{ ...styles.statNum, color: "#f43f5e" }}>{counts.negative}</div><div style={styles.statLbl}>Negative</div></div>
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <input placeholder="🔍  Search feedback or location..." value={search} onChange={e => setSearch(e.target.value)} style={styles.searchInput} />
        <select value={filterSentiment} onChange={e => setFilterSentiment(e.target.value)} style={styles.select}>
          <option value="all">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
          <option value="escalated">Escalated</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={styles.select}>
          <option value="all">All Statuses</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={styles.select}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={exportCSV} style={styles.exportBtn}>⬇ Export CSV</button>
      </div>

      <div style={styles.resultCount}>{filtered.length} feedback entries</div>

      {/* Feedback List */}
      {loading ? (
        <div style={styles.loading}>Loading feedback...</div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>No feedback matches the selected filters</div>
      ) : (
        <div style={styles.list}>
          {filtered.map(f => {
            const sc = sentimentColors[f.sentiment] || sentimentColors.neutral;
            const isExpanded = expanded === f.id;
            const pc = priorityColor(f.priority);

            return (
              <div key={f.id} style={styles.card}>
                {/* Card Header */}
                <div style={styles.cardHeader} onClick={() => setExpanded(isExpanded ? null : f.id)}>
                  <div style={styles.cardLeft}>
                    <span style={styles.catBadge}>{f.category}</span>
                    {f.topic && <span style={styles.topicBadge}>🏷️ {f.topic}</span>}
                    {f.priority && (
                      <span style={{ ...styles.priorityBadge, background: pc.bg, color: pc.color }}>
                        ⚑ {f.priority}
                      </span>
                    )}
                  </div>
                  <div style={styles.cardRight}>
                    <span style={{ ...styles.sentimentBadge, background: sc.bg, color: sc.color }}>
                      <span style={{ color: sc.dot }}>●</span> {f.sentiment || "neutral"}
                    </span>
                    <span style={styles.dateText}>{new Date(f.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Description */}
                <p style={styles.desc}>{isExpanded ? f.description : `${f.description?.slice(0, 100)}${f.description?.length > 100 ? "..." : ""}`}</p>

                {/* Meta */}
                <div style={styles.meta}>
                  <span>📍 {f.location}</span>
                  <span>🆔 #{f.id}</span>
                  {f.assigned_worker && <span>👷 {f.assigned_worker}</span>}
                  {f.image_url && (
                    <span style={styles.imgLink} onClick={() => setLightbox(`http://localhost:5000${f.image_url}`)}>
                      📷 View Image
                    </span>
                  )}
                </div>

                {/* Admin Controls — always visible */}
                <div style={styles.controls}>
                  <div style={styles.controlGroup}>
                    <label style={styles.controlLabel}>Status</label>
                    <select value={f.status || "open"} onChange={e => updateStatus(f.id, e.target.value)} style={styles.controlSelect}>
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div style={styles.controlGroup}>
                    <label style={styles.controlLabel}>Priority</label>
                    <select value={f.priority || "low"} onChange={e => updatePriority(f.id, e.target.value)} style={styles.controlSelect}>
                      {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  {workers.length > 0 && (
                    <div style={styles.controlGroup}>
                      <label style={styles.controlLabel}>Assign Worker</label>
                      <select onChange={e => assignWorker(f.id, e.target.value)} style={styles.controlSelect} defaultValue="">
                        <option value="">Select worker...</option>
                        {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div style={styles.lightboxOverlay} onClick={() => setLightbox(null)}>
          <div style={styles.lightboxContent} onClick={e => e.stopPropagation()}>
            <img src={lightbox} alt="Feedback" style={styles.lightboxImg} />
            <button onClick={() => setLightbox(null)} style={styles.lightboxClose}>✕ Close</button>
          </div>
        </div>
      )}
    </Layout>
  );
};

const styles = {
  statsRow: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "20px" },
  stat: { background: "white", borderRadius: "10px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: "3px solid #e2e8f0" },
  statNum: { fontSize: "24px", fontWeight: "800", color: "#1a1a2e", marginBottom: "2px" },
  statLbl: { fontSize: "11px", color: "#9ca3af", fontWeight: "600" },
  filterBar: { display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px", alignItems: "center" },
  searchInput: { flex: 2, minWidth: "200px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" },
  select: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", background: "white" },
  exportBtn: { padding: "10px 18px", background: "#0f3460", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap" },
  resultCount: { fontSize: "12px", color: "#9ca3af", marginBottom: "16px" },
  loading: { textAlign: "center", padding: "48px", color: "#9ca3af" },
  empty: { textAlign: "center", padding: "48px", color: "#9ca3af", background: "white", borderRadius: "12px" },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  card: { background: "white", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", cursor: "pointer", flexWrap: "wrap", gap: "8px" },
  cardLeft: { display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" },
  cardRight: { display: "flex", gap: "8px", alignItems: "center" },
  catBadge: { fontSize: "11px", fontWeight: "700", color: "#0f3460", background: "#e0e7ff", padding: "3px 10px", borderRadius: "10px" },
  topicBadge: { fontSize: "11px", color: "#6b7280", background: "#f3f4f6", padding: "3px 10px", borderRadius: "10px" },
  priorityBadge: { fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "10px" },
  sentimentBadge: { fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "4px" },
  dateText: { fontSize: "11px", color: "#9ca3af" },
  desc: { fontSize: "13px", color: "#374151", lineHeight: "1.6", marginBottom: "8px" },
  meta: { display: "flex", gap: "14px", flexWrap: "wrap", fontSize: "11px", color: "#9ca3af", marginBottom: "12px" },
  imgLink: { color: "#0f3460", cursor: "pointer", fontWeight: "600" },
  controls: { display: "flex", gap: "12px", flexWrap: "wrap", paddingTop: "12px", borderTop: "1px solid #f1f5f9" },
  controlGroup: { display: "flex", flexDirection: "column", gap: "4px" },
  controlLabel: { fontSize: "10px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" },
  controlSelect: { padding: "6px 10px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px", background: "white", cursor: "pointer" },
  lightboxOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  lightboxContent: { maxWidth: "90vw", maxHeight: "90vh", display: "flex", flexDirection: "column", gap: "12px" },
  lightboxImg: { maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "8px" },
  lightboxClose: { padding: "8px 20px", background: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }
};

export default Feedback;