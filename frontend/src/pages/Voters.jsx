import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";

const Voters = () => {
  const [voters, setVoters] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", age: "", gender: "", phone: "", booth_number: "", constituency_id: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [votersRes, constRes] = await Promise.all([
        API.get("/voters"),
        API.get("/constituencies")
      ]);
      setVoters(votersRes.data.data);
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
      await API.post("/voters", form);
      setForm({ name: "", age: "", gender: "", phone: "", booth_number: "", constituency_id: "" });
      setShowForm(false);
      fetchAll();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = voters.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.booth_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Voter Registry">
      <div style={styles.topBar}>
        <input
          placeholder="Search by name or booth..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.search}
        />
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          + Add Voter
        </button>
      </div>

      {showForm && (
        <div style={styles.form}>
          <h3 style={styles.formTitle}>Register New Voter</h3>
          <div style={styles.formGrid}>
            <input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={styles.input} />
            <input placeholder="Age" type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} style={styles.input} />
            <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} style={styles.input}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={styles.input} />
            <input placeholder="Booth Number" value={form.booth_number} onChange={e => setForm({ ...form, booth_number: e.target.value })} style={styles.input} />
            <select value={form.constituency_id} onChange={e => setForm({ ...form, constituency_id: e.target.value })} style={styles.input}>
              <option value="">Select Constituency</option>
              {constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={styles.formActions}>
            <button onClick={handleSubmit} style={styles.submitBtn} disabled={submitting}>
              {submitting ? "Registering..." : "Register Voter"}
            </button>
            <button onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
          </div>
        </div>
      )}

      <div style={styles.statsRow}>
        <span style={styles.count}>Total Voters: {voters.length} | Showing: {filtered.length}</span>
      </div>

      {loading ? <div style={styles.loading}>Loading voters...</div> : (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["ID", "Name", "Age", "Gender", "Phone", "Booth", "Constituency"].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => (
                <tr key={v.id} style={i % 2 === 0 ? styles.trEven : {}}>
                  <td style={styles.td}>{v.id}</td>
                  <td style={{ ...styles.td, fontWeight: "600" }}>{v.name}</td>
                  <td style={styles.td}>{v.age}</td>
                  <td style={styles.td}>{v.gender}</td>
                  <td style={styles.td}>{v.phone}</td>
                  <td style={styles.td}>{v.booth_number}</td>
                  <td style={styles.td}>{v.constituency_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

const styles = {
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  search: { padding: "8px 16px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", width: "280px" },
  addBtn: { padding: "8px 20px", background: "#0f3460", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  form: { background: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  formTitle: { fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: "#1a1a2e" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" },
  formActions: { display: "flex", gap: "12px", marginTop: "16px" },
  submitBtn: { padding: "10px 24px", background: "#0f3460", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  cancelBtn: { padding: "10px 24px", background: "#f0f0f0", color: "#333", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  statsRow: { marginBottom: "16px" },
  count: { fontSize: "13px", color: "#666" },
  loading: { textAlign: "center", padding: "40px", color: "#666" },
  tableCard: { background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px", fontSize: "12px", fontWeight: "700", color: "#666", textTransform: "uppercase", borderBottom: "2px solid #f0f0f0" },
  td: { padding: "12px", fontSize: "14px", color: "#333", borderBottom: "1px solid #f0f0f0" },
  trEven: { background: "#fafafa" }
};

export default Voters;