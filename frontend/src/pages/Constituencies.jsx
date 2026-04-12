import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";

const Constituencies = () => {
  const [constituencies, setConstituencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", state: "", total_voters: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchConstituencies(); }, []);

  const fetchConstituencies = async () => {
    try {
      const res = await API.get("/constituencies");
      setConstituencies(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await API.post("/constituencies", form);
      setForm({ name: "", city: "", state: "", total_voters: "" });
      setShowForm(false);
      fetchConstituencies();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Constituencies">
      <div style={styles.topBar}>
        <span style={styles.count}>Total: {constituencies.length}</span>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          + Add Constituency
        </button>
      </div>

      {showForm && (
        <div style={styles.form}>
          <h3 style={styles.formTitle}>Add New Constituency</h3>
          <div style={styles.formGrid}>
            <input placeholder="Constituency Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={styles.input} />
            <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} style={styles.input} />
            <input placeholder="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} style={styles.input} />
            <input placeholder="Total Voters" type="number" value={form.total_voters} onChange={e => setForm({ ...form, total_voters: e.target.value })} style={styles.input} />
          </div>
          <div style={styles.formActions}>
            <button onClick={handleSubmit} style={styles.submitBtn} disabled={submitting}>
              {submitting ? "Adding..." : "Add Constituency"}
            </button>
            <button onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div style={styles.loading}>Loading...</div> : (
        <div style={styles.grid}>
          {constituencies.map(c => (
            <div key={c.id} style={styles.card}>
              <div style={styles.cardTop}>
                <span style={styles.icon}>🏛️</span>
                <div>
                  <div style={styles.name}>{c.name}</div>
                  <div style={styles.location}>{c.city}, {c.state}</div>
                </div>
              </div>
              <div style={styles.divider} />
              <div style={styles.stats}>
                <div style={styles.stat}>
                  <div style={styles.statVal}>{c.total_voters?.toLocaleString()}</div>
                  <div style={styles.statLbl}>Total Voters</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statVal}>#{c.id}</div>
                  <div style={styles.statLbl}>ID</div>
                </div>
              </div>
              <div style={styles.date}>
                Added: {new Date(c.created_at).toLocaleDateString()}
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
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" },
  card: { background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  cardTop: { display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" },
  icon: { fontSize: "36px" },
  name: { fontSize: "17px", fontWeight: "700", color: "#1a1a2e" },
  location: { fontSize: "13px", color: "#888", marginTop: "4px" },
  divider: { height: "1px", background: "#f0f0f0", marginBottom: "16px" },
  stats: { display: "flex", gap: "24px", marginBottom: "16px" },
  stat: { flex: 1 },
  statVal: { fontSize: "22px", fontWeight: "800", color: "#0f3460" },
  statLbl: { fontSize: "12px", color: "#888", marginTop: "2px" },
  date: { fontSize: "12px", color: "#aaa" }
};

export default Constituencies;