import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", constituency_id: "" });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [workersRes, constRes] = await Promise.all([
        API.get("/workers"),
        API.get("/constituencies")
      ]);
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
      await API.post("/workers", form);
      setForm({ name: "", phone: "", email: "", constituency_id: "" });
      setShowForm(false);
      fetchAll();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = workers.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Field Workers">
      <div style={styles.topBar}>
        <input
          placeholder="Search workers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.search}
        />
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          + Add Worker
        </button>
      </div>

      {showForm && (
        <div style={styles.form}>
          <h3 style={styles.formTitle}>Add New Field Worker</h3>
          <div style={styles.formGrid}>
            <input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={styles.input} />
            <input placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={styles.input} />
            <input placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={styles.input} />
            <select value={form.constituency_id} onChange={e => setForm({ ...form, constituency_id: e.target.value })} style={styles.input}>
              <option value="">Select Constituency</option>
              {constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={styles.formActions}>
            <button onClick={handleSubmit} style={styles.submitBtn} disabled={submitting}>
              {submitting ? "Adding..." : "Add Worker"}
            </button>
            <button onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div style={styles.loading}>Loading workers...</div> : (
        <div style={styles.grid}>
          {filtered.map(w => (
            <div key={w.id} style={styles.card}>
              <div style={styles.avatar}>{w.name.charAt(0).toUpperCase()}</div>
              <div style={styles.info}>
                <div style={styles.name}>{w.name}</div>
                <div style={styles.meta}>📧 {w.email}</div>
                <div style={styles.meta}>📱 {w.phone}</div>
                <div style={styles.meta}>🏛️ Constituency ID: {w.constituency_id}</div>
                <div style={styles.date}>Joined: {new Date(w.created_at).toLocaleDateString()}</div>
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
  search: { padding: "8px 16px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", width: "250px" },
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
  card: { background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", gap: "16px", alignItems: "flex-start" },
  avatar: { width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, #0f3460, #533483)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "20px", flexShrink: 0 },
  info: { flex: 1 },
  name: { fontSize: "16px", fontWeight: "700", color: "#1a1a2e", marginBottom: "8px" },
  meta: { fontSize: "13px", color: "#666", marginBottom: "4px" },
  date: { fontSize: "12px", color: "#aaa", marginTop: "8px" }
};

export default Workers;