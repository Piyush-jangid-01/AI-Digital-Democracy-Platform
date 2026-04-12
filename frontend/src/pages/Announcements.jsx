import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", constituency_id: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [aRes, cRes] = await Promise.all([API.get("/announcements"), API.get("/constituencies")]);
      setAnnouncements(aRes.data.data);
      setConstituencies(cRes.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await API.post("/announcements", { title: form.title, content: form.content, constituency_id: form.constituency_id || null });
      setForm({ title: "", content: "", constituency_id: "" });
      setShowForm(false);
      fetchAll();
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await API.delete(`/announcements/${id}`);
      fetchAll();
    } catch (e) { console.error(e); }
  };

  return (
    <Layout title="Announcements">
      <div style={styles.topBar}>
        <span style={styles.count}>{announcements.length} total announcements</span>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>+ New Announcement</button>
      </div>

      {showForm && (
        <div style={styles.form}>
          <h3 style={styles.formTitle}>Create New Announcement</h3>
          <div style={styles.formFields}>
            <input placeholder="Announcement Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={styles.input} />
            <select value={form.constituency_id} onChange={e => setForm({ ...form, constituency_id: e.target.value })} style={styles.input}>
              <option value="">All Constituencies (broadcast)</option>
              {constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <textarea placeholder="Announcement content..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} style={styles.textarea} rows={4} />
          </div>
          <div style={styles.actions}>
            <button onClick={handleSubmit} style={styles.submitBtn} disabled={submitting}>{submitting ? "Publishing..." : "Publish"}</button>
            <button onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div style={styles.loading}>Loading...</div> : (
        <div style={styles.list}>
          {announcements.map(a => (
            <div key={a.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{a.title}</h3>
                <button onClick={() => handleDelete(a.id)} style={styles.deleteBtn}>🗑️ Delete</button>
              </div>
              <p style={styles.cardContent}>{a.content}</p>
              <div style={styles.cardFooter}>
                <span style={styles.tag}>📍 {a.constituency_name || "All Constituencies"}</span>
                <span style={styles.meta}>By {a.created_by_name}</span>
                <span style={styles.meta}>{new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
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
  count: { fontSize: "13px", color: "#666" },
  addBtn: { padding: "10px 20px", background: "#0f3460", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  form: { background: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  formTitle: { fontSize: "16px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px" },
  formFields: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" },
  textarea: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", resize: "vertical" },
  actions: { display: "flex", gap: "12px", marginTop: "16px" },
  submitBtn: { padding: "10px 24px", background: "#0f3460", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  cancelBtn: { padding: "10px 24px", background: "#f0f0f0", color: "#333", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  loading: { textAlign: "center", padding: "40px", color: "#666" },
  list: { display: "flex", flexDirection: "column", gap: "16px" },
  card: { background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: "4px solid #22c55e" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" },
  cardTitle: { fontSize: "16px", fontWeight: "700", color: "#1a1a2e", margin: 0 },
  deleteBtn: { background: "#fff0f0", border: "1px solid #ffcccc", color: "#cc0000", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  cardContent: { fontSize: "14px", color: "#444", lineHeight: "1.7", marginBottom: "16px" },
  cardFooter: { display: "flex", gap: "16px", flexWrap: "wrap", borderTop: "1px solid #f0f0f0", paddingTop: "12px" },
  tag: { fontSize: "12px", fontWeight: "600", color: "#065f46" },
  meta: { fontSize: "12px", color: "#9ca3af" }
};

export default Announcements;