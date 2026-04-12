import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";
import { io } from "socket.io-client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#0f3460", "#e94560", "#533483", "#16213e"];
const socket = io("http://localhost:5000");

const StatCard = ({ title, value, icon, color }) => (
  <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
    <div style={styles.statIcon}>{icon}</div>
    <div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statTitle}>{title}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [sentiment, setSentiment] = useState([]);
  const [topIssues, setTopIssues] = useState([]);
  const [locations, setLocations] = useState([]);
  const [workers, setWorkers] = useState([]);
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
        message: `🚨 Negative feedback alert from ${data.data.location}`,
        type: "danger"
      }, ...prev.slice(0, 4)]);
    });

    socket.on("task_updated", (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        message: `Task updated: ${data.data.title}`,
        type: "success"
      }, ...prev.slice(0, 4)]);
    });

    return () => {
      socket.off("new_feedback");
      socket.off("negative_feedback_alert");
      socket.off("task_updated");
    };
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, sentimentRes, issuesRes, locationsRes, workersRes] = await Promise.all([
        API.get("/analytics/stats/overall"),
        API.get("/analytics/stats/sentiment"),
        API.get("/analytics/stats/issues"),
        API.get("/analytics/stats/locations"),
        API.get("/analytics/stats/workers")
      ]);
      setStats(statsRes.data.data);
      setSentiment(sentimentRes.data.data);
      setTopIssues(issuesRes.data.data);
      setLocations(locationsRes.data.data);
      setWorkers(workersRes.data.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (loading) return (
    <Layout title="Dashboard">
      <div style={styles.loading}>Loading dashboard...</div>
    </Layout>
  );

  return (
    <Layout title="Dashboard">
      {notifications.length > 0 && (
        <div style={styles.notifications}>
          {notifications.map(n => (
            <div key={n.id} style={{
              ...styles.notification,
              background: n.type === "danger" ? "#fff0f0" : n.type === "success" ? "#f0fdf4" : "#f0f4ff",
              borderLeft: `4px solid ${n.type === "danger" ? "#e94560" : n.type === "success" ? "#22c55e" : "#0f3460"}`
            }}>
              <span style={styles.notifMessage}>{n.message}</span>
              <button onClick={() => removeNotification(n.id)} style={styles.notifClose}>✕</button>
            </div>
          ))}
        </div>
      )}

      <div style={styles.grid4}>
        <StatCard title="Total Feedback" value={stats?.total_feedback || 0} icon="💬" color="#0f3460" />
        <StatCard title="Positive" value={stats?.total_positive || 0} icon="✅" color="#22c55e" />
        <StatCard title="Negative" value={stats?.total_negative || 0} icon="🚨" color="#e94560" />
        <StatCard title="Top Issue" value={stats?.top_issue || "N/A"} icon="⚠️" color="#f59e0b" />
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={sentiment} dataKey="count" nameKey="sentiment" cx="50%" cy="50%" outerRadius={90} label={({ sentiment, percentage }) => `${sentiment} ${percentage}%`}>
                {sentiment.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Top Issues</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topIssues}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0f3460" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Complaints by Location</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Negative</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc, i) => (
                  <tr key={i} style={i % 2 === 0 ? styles.trEven : {}}>
                    <td style={styles.td}>{loc.location}</td>
                    <td style={styles.td}>{loc.total_complaints}</td>
                    <td style={{ ...styles.td, color: "#e94560", fontWeight: "600" }}>{loc.negative_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Worker Performance</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Worker</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Done</th>
                  <th style={styles.th}>Pending</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w, i) => (
                  <tr key={i} style={i % 2 === 0 ? styles.trEven : {}}>
                    <td style={styles.td}>{w.name}</td>
                    <td style={styles.td}>{w.total_tasks}</td>
                    <td style={{ ...styles.td, color: "#22c55e", fontWeight: "600" }}>{w.completed_tasks}</td>
                    <td style={{ ...styles.td, color: "#f59e0b", fontWeight: "600" }}>{w.pending_tasks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "400px", fontSize: "18px", color: "#666" },
  notifications: { marginBottom: "20px", display: "flex", flexDirection: "column", gap: "8px" },
  notification: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: "8px", fontSize: "14px" },
  notifMessage: { fontWeight: "500", color: "#333" },
  notifClose: { background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "14px", padding: "0 4px" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "24px" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginBottom: "24px" },
  statCard: { background: "white", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  statIcon: { fontSize: "32px" },
  statValue: { fontSize: "28px", fontWeight: "800", color: "#1a1a2e" },
  statTitle: { fontSize: "13px", color: "#666", marginTop: "2px" },
  card: { background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  cardTitle: { fontSize: "16px", fontWeight: "700", color: "#1a1a2e", marginBottom: "20px" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "700", color: "#666", textTransform: "uppercase", borderBottom: "2px solid #f0f0f0" },
  td: { padding: "10px 12px", fontSize: "14px", color: "#333", borderBottom: "1px solid #f0f0f0" },
  trEven: { background: "#fafafa" }
};

export default Dashboard;