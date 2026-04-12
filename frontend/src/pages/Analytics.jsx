import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
  LineChart, Line, AreaChart, Area
} from "recharts";

const COLORS = ["#0f3460", "#e94560", "#533483", "#22c55e", "#f59e0b"];

const Analytics = () => {
  const [sentiment, setSentiment] = useState([]);
  const [topics, setTopics] = useState([]);
  const [locations, setLocations] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [trend, setTrend] = useState([]);
  const [riskScores, setRiskScores] = useState([]);
  const [emerging, setEmerging] = useState([]);
  const [segmentation, setSegmentation] = useState({ age: [], gender: [], booth: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [
        sentimentRes, topicsRes, locationsRes, workersRes,
        trendRes, riskRes, emergingRes,
        ageRes, genderRes, boothRes
      ] = await Promise.all([
        API.get("/analytics/stats/sentiment"),
        API.get("/feedback/stats/topics"),
        API.get("/analytics/stats/locations"),
        API.get("/analytics/stats/workers"),
        API.get("/predictive/feedback-trend"),
        API.get("/predictive/location-risk"),
        API.get("/predictive/emerging-issues"),
        API.get("/segmentation/age"),
        API.get("/segmentation/gender"),
        API.get("/segmentation/booth")
      ]);
      setSentiment(sentimentRes.data.data);
      setTopics(topicsRes.data.data);
      setLocations(locationsRes.data.data);
      setWorkers(workersRes.data.data);
      setTrend(trendRes.data.data);
      setRiskScores(riskRes.data.data);
      setEmerging(emergingRes.data.data);
      setSegmentation({
        age: ageRes.data.data,
        gender: genderRes.data.data,
        booth: boothRes.data.data
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Layout title="Analytics">
      <div style={styles.loading}>Loading analytics...</div>
    </Layout>
  );

  return (
    <Layout title="Analytics & Insights">

      <div style={styles.grid2}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📊 Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={sentiment} dataKey="count" nameKey="sentiment" cx="50%" cy="50%" outerRadius={90} label={({ sentiment, percentage }) => `${sentiment} ${percentage}%`}>
                {sentiment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🏷️ Topic Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0f3460" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>📈 Feedback Trend Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => new Date(d).toLocaleDateString()} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="total" stroke="#0f3460" fill="#e8f0fe" name="Total" />
            <Area type="monotone" dataKey="negative" stroke="#e94560" fill="#fff0f0" name="Negative" />
            <Area type="monotone" dataKey="positive" stroke="#22c55e" fill="#f0fdf4" name="Positive" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>👥 Age Segmentation</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={segmentation.age}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age_group" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#533483" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>⚧ Gender Segmentation</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={segmentation.gender} dataKey="count" nameKey="gender" cx="50%" cy="50%" outerRadius={80} label={({ gender, percentage }) => `${gender} ${percentage}%`}>
                {segmentation.gender.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🚨 Location Risk Scores</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Negative</th>
                  <th style={styles.th}>Risk %</th>
                </tr>
              </thead>
              <tbody>
                {riskScores.map((r, i) => (
                  <tr key={i} style={i % 2 === 0 ? styles.trEven : {}}>
                    <td style={styles.td}>{r.location}</td>
                    <td style={styles.td}>{r.total_feedback}</td>
                    <td style={{ ...styles.td, color: "#e94560", fontWeight: "600" }}>{r.negative_count}</td>
                    <td style={{ ...styles.td, color: r.risk_score > 50 ? "#e94560" : "#22c55e", fontWeight: "700" }}>
                      {r.risk_score}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>⚠️ Emerging Issues (Last 7 Days)</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Topic</th>
                  <th style={styles.th}>Count</th>
                </tr>
              </thead>
              <tbody>
                {emerging.map((e, i) => (
                  <tr key={i} style={i % 2 === 0 ? styles.trEven : {}}>
                    <td style={styles.td}>{e.category}</td>
                    <td style={styles.td}>{e.topic}</td>
                    <td style={{ ...styles.td, fontWeight: "700", color: "#e94560" }}>{e.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>👷 Worker Performance</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={workers}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed_tasks" fill="#22c55e" name="Completed" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending_tasks" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </Layout>
  );
};

const styles = {
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "400px", fontSize: "18px", color: "#666" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginBottom: "24px" },
  card: { background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px" },
  cardTitle: { fontSize: "16px", fontWeight: "700", color: "#1a1a2e", marginBottom: "20px" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "700", color: "#666", textTransform: "uppercase", borderBottom: "2px solid #f0f0f0" },
  td: { padding: "10px 12px", fontSize: "14px", color: "#333", borderBottom: "1px solid #f0f0f0" },
  trEven: { background: "#fafafa" }
};

export default Analytics;