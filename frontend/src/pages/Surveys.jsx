import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";

const Surveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ worker_id: "", constituency_id: "", area: "", responses: "", total_responses: "", survey_date: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [surveysRes, workersRes, constRes] = await Promise.all([
        API.get("/surveys"),
        API.get("/workers"),
        API.get("/constituencies")
      ]);
      setSurveys(surveysRes.data.data);
      setWorkers(workersRes.data.data);
      setConstituencies(constRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await API.post("/surveys", form);
      setForm({ worker_id: "", constituency_id: "", area: "", responses: "", total_responses: "", survey_date: "" });
      setShowForm(false);
      fetchAll();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Survey Management">
      <div style={styles.topBar}>
        <span style={styles.count}>Total Surveys: {surveys.length}</span>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          + Add Survey
        </button>
      </div>

      {showForm && (
        <div style={styles.form}>
          <h3 style={styles.formTitle}>Add New Survey</h3>
          <div style={styles.formGrid}>
            <select value={form.worker_id} onChange={e => setForm({ ...form, worker_id: e.target.value })} style={styles.input}>
              <option value="">Select Worker</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select value={form.constituency_id} onChange={e => setForm({ ...form, constituency_id: e.target.value })} style={styles.input}>
              <option value="">Select Constituency</option>
              {constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="Area" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} style={styles.input} />
            <input placeholder="Total Responses" type="number" value={form.total_responses} onChange={e => setForm({ ...form, total_responses: e.target.value })} style={styles.input} />
            <input type="date" value={form.survey_date} onChange={e => setForm({ ...form, survey_date: e.target.value })} style={styles.input} />
            <textarea placeholder="Survey Responses / Notes" value={form.responses} onChange={e => setForm({ ...form, responses: e.target.value })} style={{ ...styles.input, gridColumn: "1 / -1" }} rows={3} />
          </div>
          <div style={styles.formActions}>
            <button onClick={handleSubmit} style={styles.submitBtn} disabled={submitting}>
              {submitting ? "Saving..." : "Save Survey"}
            </button>
            <button onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div style={styles.loading}>Loading surveys...</div> : (
        <div style={styles.grid}>
          {surveys.map(s => (
            <div key={s.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.area}>📍 {s.area}</span>
                <span style={styles.date}>{new Date(s.survey_date).toLocaleDateString()}</span>
              </div>
              <p style={styles.responses}>{s.responses}</p>
              <div style={styles.cardFooter}>
                <span style={styles.meta}>👷 Worker ID: {s.worker_id}</span>
                <span style={styles.meta}>🏛️ Constituency: {s.constituency_id}</span>
                <span style={styles.badge}>📊 {s.total_responses} responses</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

const styles = {
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  count: { fontSize: "14px", color: "#666", fontWeight: "600" },
  addBtn: { padding: "8px 20px", background: "#0f3460", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  form: { background: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  formTitle: { fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: "#1a1a2e" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" },
  formActions: { display: "flex", gap: "12px", marginTop: "16px" },
  submitBtn: { padding: "10px 24px", background: "#0f3460", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  cancelBtn: { padding: "10px 24px", background: "#f0f0f0", color: "#333", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  loading: { textAlign: "center", padding: "40px", color: "#666" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" },
  card: { background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  area: { fontSize: "15px", fontWeight: "700", color: "#1a1a2e" },
  date: { fontSize: "12px", color: "#888" },
  responses: { fontSize: "13px", color: "#555", lineHeight: "1.5", marginBottom: "12px" },
  cardFooter: { display: "flex", flexDirection: "column", gap: "6px" },
  meta: { fontSize: "12px", color: "#888" },
  badge: { fontSize: "12px", fontWeight: "700", color: "#0f3460", background: "#e8f0fe", padding: "4px 10px", borderRadius: "12px", display: "inline-block", width: "fit-content" }
};

export default Surveys;