import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ title: "", description: "", worker_id: "", due_date: "" });
  const [submitting, setSubmitting] = useState(false);
  const [liveUpdate, setLiveUpdate] = useState(null);

  useEffect(() => {
    fetchAll();

    socket.emit("join_admin");

    socket.on("task_updated", (data) => {
      setLiveUpdate(`Task updated: ${data.data.title} → ${data.data.status}`);
      fetchAll();
      setTimeout(() => setLiveUpdate(null), 4000);
    });

    return () => {
      socket.off("task_updated");
    };
  }, []);

  const fetchAll = async () => {
    try {
      const [tasksRes, workersRes] = await Promise.all([
        API.get("/tasks"),
        API.get("/workers")
      ]);
      setTasks(tasksRes.data.data);
      setWorkers(workersRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await API.post("/tasks", form);
      setForm({ title: "", description: "", worker_id: "", due_date: "" });
      setShowForm(false);
      fetchAll();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/tasks/${id}/status`, { status });
      fetchAll();
    } catch (error) {
      console.error(error);
    }
  };

  const getWorkerName = (worker_id) => {
    const w = workers.find(w => w.id === worker_id);
    return w ? w.name : `Worker #${worker_id}`;
  };

  const statusColor = (s) => {
    if (s === "completed") return "#22c55e";
    if (s === "pending") return "#f59e0b";
    return "#0f3460";
  };

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    completed: tasks.filter(t => t.status === "completed").length
  };

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  return (
    <Layout title="Task Management">
      {liveUpdate && (
        <div style={styles.liveAlert}>
          🔴 Live Update: {liveUpdate}
        </div>
      )}

      <div style={styles.statsRow}>
        {Object.entries(counts).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{ ...styles.statBtn, ...(filter === key ? styles.statBtnActive : {}) }}
          >
            <div style={styles.statVal}>{val}</div>
            <div style={styles.statLbl}>{key.charAt(0).toUpperCase() + key.slice(1)} Tasks</div>
          </button>
        ))}
      </div>

      <div style={styles.topBar}>
        <span style={styles.showing}>Showing {filtered.length} tasks</span>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          + Create Task
        </button>
      </div>

      {showForm && (
        <div style={styles.form}>
          <h3 style={styles.formTitle}>Create New Task</h3>
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Task Title</label>
              <input
                placeholder="Enter task title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Assign to Worker</label>
              <select
                value={form.worker_id}
                onChange={e => setForm({ ...form, worker_id: e.target.value })}
                style={styles.input}
              >
                <option value="">Select Worker</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                placeholder="Task description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ ...styles.input, resize: "vertical" }}
                rows={2}
              />
            </div>
          </div>
          <div style={styles.formActions}>
            <button onClick={handleSubmit} style={styles.submitBtn} disabled={submitting}>
              {submitting ? "Creating..." : "Create Task"}
            </button>
            <button onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>Loading tasks...</div>
      ) : (
        <div style={styles.grid}>
          {filtered.map(t => (
            <div key={t.id} style={{
              ...styles.card,
              borderTop: `4px solid ${statusColor(t.status)}`
            }}>
              <div style={styles.cardHeader}>
                <h4 style={styles.taskTitle}>{t.title}</h4>
                <span style={{ ...styles.status, background: statusColor(t.status) }}>
                  {t.status === "completed" ? "✅" : "⏳"} {t.status}
                </span>
              </div>

              {t.description && <p style={styles.description}>{t.description}</p>}

              <div style={styles.metaRow}>
                <div style={styles.metaItem}>
                  <span style={styles.metaIcon}>👷</span>
                  <span style={styles.metaText}>{getWorkerName(t.worker_id)}</span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaIcon}>📅</span>
                  <span style={styles.metaText}>
                    {t.due_date ? new Date(t.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "No date"}
                  </span>
                </div>
              </div>

              <div style={styles.cardFooter}>
                {t.status === "pending" && (
                  <button
                    onClick={() => updateStatus(t.id, "completed")}
                    style={styles.completeBtn}
                  >
                    ✅ Mark as Completed
                  </button>
                )}
                {t.status === "completed" && (
                  <button
                    onClick={() => updateStatus(t.id, "pending")}
                    style={styles.reopenBtn}
                  >
                    🔄 Reopen Task
                  </button>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={styles.empty}>No {filter} tasks found.</div>
          )}
        </div>
      )}
    </Layout>
  );
};

const styles = {
  liveAlert: { background: "#fff3cd", border: "1px solid #ffc107", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", fontWeight: "600", fontSize: "14px", color: "#856404" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" },
  statBtn: { background: "white", border: "2px solid #f0f0f0", borderRadius: "12px", padding: "20px", cursor: "pointer", textAlign: "center" },
  statBtnActive: { border: "2px solid #0f3460", background: "#f0f4ff" },
  statVal: { fontSize: "28px", fontWeight: "800", color: "#1a1a2e" },
  statLbl: { fontSize: "13px", color: "#888", marginTop: "4px" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  showing: { fontSize: "13px", color: "#666" },
  addBtn: { padding: "10px 20px", background: "#0f3460", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  form: { background: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  formTitle: { fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: "#1a1a2e" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#444" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" },
  formActions: { display: "flex", gap: "12px", marginTop: "16px" },
  submitBtn: { padding: "10px 24px", background: "#0f3460", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  cancelBtn: { padding: "10px 24px", background: "#f0f0f0", color: "#333", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  loading: { textAlign: "center", padding: "60px", color: "#666" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" },
  card: { background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" },
  taskTitle: { fontSize: "15px", fontWeight: "700", color: "#1a1a2e", flex: 1, marginRight: "8px" },
  status: { fontSize: "11px", fontWeight: "700", color: "white", padding: "4px 10px", borderRadius: "12px", textTransform: "capitalize", whiteSpace: "nowrap" },
  description: { fontSize: "13px", color: "#666", lineHeight: "1.5", marginBottom: "12px" },
  metaRow: { display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" },
  metaItem: { display: "flex", alignItems: "center", gap: "6px" },
  metaIcon: { fontSize: "14px" },
  metaText: { fontSize: "13px", color: "#555", fontWeight: "500" },
  cardFooter: { borderTop: "1px solid #f0f0f0", paddingTop: "12px" },
  completeBtn: { width: "100%", padding: "10px", background: "#f0fdf4", border: "1px solid #22c55e", borderRadius: "8px", color: "#22c55e", cursor: "pointer", fontWeight: "700", fontSize: "13px" },
  reopenBtn: { width: "100%", padding: "10px", background: "#fff9ec", border: "1px solid #f59e0b", borderRadius: "8px", color: "#b45309", cursor: "pointer", fontWeight: "700", fontSize: "13px" },
  empty: { gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "#888", fontSize: "14px" }
};

export default Tasks;