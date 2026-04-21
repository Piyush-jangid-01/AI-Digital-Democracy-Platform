import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";
import { io } from "socket.io-client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#0f3460", "#e94560", "#533483", "#f59e0b", "#22c55e", "#06b6d4", "#8b5cf6"];
const EMOTION_COLORS = { anger: "#e94560", disgust: "#f59e0b", fear: "#8b5cf6", sadness: "#06b6d4", joy: "#22c55e", surprise: "#0f3460", neutral: "#9ca3af" };
const EMOTION_EMOJI = { anger: "😠", disgust: "🤢", fear: "😨", sadness: "😢", joy: "😊", surprise: "😲", neutral: "😐" };

const socket = io("http://localhost:5000");

const StatCard = ({ title, value, icon, color, sub }) => (
  <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
    <div style={styles.statIcon}>{icon}</div>
    <div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statTitle}>{title}</div>
      {sub && <div style={styles.statSub}>{sub}</div>}
    </div>
  </div>
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [sentiment, setSentiment] = useState([]);
  const [topIssues, setTopIssues] = useState([]);
  const [emotions, setEmotions] = useState([]);
  const [urgency, setUrgency] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchAll();
    socket.emit("join_admin");

    socket.on("new_feedback", (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        message: `New feedback from ${data.data.location}`,
        type: "info"
      }, ...prev.slice(0, 4)]);
      fetchAll();
    });

    socket.on("negative_feedback_alert", (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        message: `🚨 Negative alert from ${data.data.location}`,
        type: "danger"
      }, ...prev.slice(0, 4)]);
    });

    return () => {
      socket.off("new_feedback");
      socket.off("negative_feedback_alert");
    };
  }, []);

  const fetchAll = async () => {
    try {
      const [summaryRes, sentimentRes, issuesRes, emotionsRes, urgencyRes] = await Promise.all([
        API.get("/summary/overall"),
        API.get("/analytics/stats/sentiment"),
        API.get("/analytics/stats/issues"),
        API.get("/feedback/stats/emotions"),
        API.get("/feedback/stats/urgency")
      ]);
      setSummary(summaryRes.data.data);
      setSentiment(sentimentRes.data.data);
      setTopIssues(issuesRes.data.data);
      setEmotions(emotionsRes.data.data);
      setUrgency(urgencyRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Layout title="Dashboard">
      <div style={styles.loading}>Loading dashboard...</div>
    </Layout>
  );

  const s = summary;

  return (
    <Layout title="Dashboard">
      {notifications.length > 0 && (
        <div style={styles.notifications}>
          {notifications.map(n => (
            <div key={n.id} style={{
              ...styles.notification,
              background: n.type === "danger" ? "#fff0f0" : "#f0f4ff",
              borderLeft: `4px solid ${n.type === "danger" ? "#e94560" : "#0f3460"}`
            }}>
              <span>{n.message}</span>
              <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} style={styles.notifClose}>✕</button>
            </div>
          ))}
        </div>
      )}

      {s?.alerts?.urgentCount > 0 && (
        <div style={styles.alertBanner}>
          🚨 {s.alerts.urgentCount} urgent negative feedback in last 24 hours — immediate attention required
        </div>
      )}

      <div style={styles.grid4}>
        <StatCard title="Total Feedback" value={s?.feedback?.total || 0} icon="💬" color="#0f3460" sub={`${s?.alerts?.recentFeedback || 0} in last 24hrs`} />
        <StatCard title="Positive" value={s?.feedback?.positive || 0} icon="✅" color="#22c55e" sub={`${s?.feedback?.positivePercent || 0}% of total`} />
        <StatCard title="Negative" value={s?.feedback?.negative || 0} icon="🚨" color="#e94560" sub={`${s?.feedback?.negativePercent || 0}% of total`} />
        <StatCard title="Task Completion" value={`${s?.tasks?.completionRate || 0}%`} icon="📋" color="#f59e0b" sub={`${s?.tasks?.completed}/${s?.tasks?.total} done`} />
      </div>

      <div style={styles.grid4}>
        <StatCard title="Field Workers" value={s?.workers?.total || 0} icon="👷" color="#533483" />
        <StatCard title="Voters Registered" value={s?.voters?.total || 0} icon="🗳️" color="#06b6d4" />
        <StatCard title="Surveys Done" value={s?.surveys?.total || 0} icon="📝" color="#8b5cf6" />
        <StatCard title="Top Issue" value={s?.feedback?.topCategory || "N/A"} icon="⚠️" color="#f59e0b" sub={`Emotion: ${s?.feedback?.topEmotion || "N/A"}`} />
      </div>

      <div style={styles.grid3}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>😤 Emotion Analysis</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={emotions} dataKey="count" nameKey="emotion" cx="50%" cy="50%" outerRadius={80}
                label={({ emotion, percentage }) => `${EMOTION_EMOJI[emotion] || ""}${emotion} ${percentage}%`}>
                {emotions.map((e, i) => (
                  <Cell key={i} fill={EMOTION_COLORS[e.emotion] || COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val, name) => [val, `${EMOTION_EMOJI[name] || ""} ${name}`]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📊 Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={sentiment} dataKey="count" nameKey="sentiment" cx="50%" cy="50%" outerRadius={80}
                label={({ sentiment, percentage }) => `${sentiment} ${percentage}%`}>
                {sentiment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🏷️ Top Issues</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topIssues} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#0f3460" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>🚨 Urgency Scores — Top Priority Feedback</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Emotion</th>
                <th style={styles.th}>Urgency</th>
              </tr>
            </thead>
            <tbody>
              {urgency.slice(0, 8).map((u, i) => (
                <tr key={i} style={i % 2 === 0 ? styles.trEven : {}}>
                  <td style={{ ...styles.td, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {u.description}
                  </td>
                  <td style={styles.td}>{u.category}</td>
                  <td style={styles.td}>{u.location}</td>
                  <td style={styles.td}>
                    {EMOTION_EMOJI[u.emotion] || ""} {u.emotion}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.urgencyBar}>
                      <div style={{
                        ...styles.urgencyFill,
                        width: `${Math.min(u.urgency_score, 100)}%`,
                        background: u.urgency_score > 70 ? "#e94560" : u.urgency_score > 40 ? "#f59e0b" : "#22c55e"
                      }} />
                      <span style={styles.urgencyScore}>{u.urgency_score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </Layout>
  );
};

const styles = {
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "400px", fontSize: "18px", color: "#666" },
  notifications: { marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" },
  notification: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: "8px", fontSize: "14px" },
  notifClose: { background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "14px" },
  alertBanner: { background: "#fff0f0", border: "1px solid #e94560", color: "#cc0000", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontWeight: "600", fontSize: "14px" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "24px" },
  statCard: { background: "white", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  statIcon: { fontSize: "28px" },
  statValue: { fontSize: "24px", fontWeight: "800", color: "#1a1a2e" },
  statTitle: { fontSize: "12px", color: "#666", marginTop: "2px" },
  statSub: { fontSize: "11px", color: "#aaa", marginTop: "2px" },
  card: { background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 12px", fontSize: "11px", fontWeight: "700", color: "#666", textTransform: "uppercase", borderBottom: "2px solid #f0f0f0" },
  td: { padding: "10px 12px", fontSize: "13px", color: "#333", borderBottom: "1px solid #f0f0f0" },
  trEven: { background: "#fafafa" },
  urgencyBar: { display: "flex", alignItems: "center", gap: "8px" },
  urgencyFill: { height: "8px", borderRadius: "4px", flex: 1, minWidth: "40px" },
  urgencyScore: { fontSize: "12px", fontWeight: "700", color: "#333", minWidth: "28px" }
};

export default Dashboard;