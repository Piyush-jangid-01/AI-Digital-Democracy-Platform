import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await API.post("/users/register", form);
      setSuccess("User registered successfully!");
      setForm({ name: "", email: "", password: "", role: "admin" });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || u.role === filter;
    return matchSearch && matchFilter;
  });

  const roleColor = (role) => {
    if (role === "admin") return { bg: "#e8f0fe", color: "#0f3460" };
    if (role === "worker") return { bg: "#f0fdf4", color: "#15803d" };
    return { bg: "#fef9ec", color: "#b45309" };
  };

  const totalAdmins = users.filter(u => u.role === "admin").length;
  const totalWorkers = users.filter(u => u.role === "worker").length;
  const totalViewers = users.filter(u => u.role === "viewer").length;

  return (
    <Layout title="User Management">

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div>
            <div style={styles.statVal}>{users.length}</div>
            <div style={styles.statLbl}>Total Users</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🛡️</div>
          <div>
            <div style={styles.statVal}>{totalAdmins}</div>
            <div style={styles.statLbl}>Admins</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👷</div>
          <div>
            <div style={styles.statVal}>{totalWorkers}</div>
            <div style={styles.statLbl}>Workers</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👁️</div>
          <div>
            <div style={styles.statVal}>{totalViewers}</div>
            <div style={styles.statLbl}>Viewers</div>
          </div>
        </div>
      </div>

      {success && (
        <div style={styles.successMsg}>✅ {success}</div>
      )}

      <div style={styles.topBar}>
        <div style={styles.left}>
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.search}
          />
          <div style={styles.filters}>
            {["all", "admin", "worker", "viewer"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => { setShowForm(!showForm); setError(""); }} style={styles.addBtn}>
          + Add User
        </button>
      </div>

      {showForm && (
        <div style={styles.form}>
          <h3 style={styles.formTitle}>Register New User</h3>
          {error && <div style={styles.errorMsg}>❌ {error}</div>}
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                placeholder="Enter full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Role</label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                style={styles.input}
              >
                <option value="admin">Admin</option>
                <option value="worker">Worker</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>

          <div style={styles.roleInfo}>
            <div style={styles.roleInfoItem}>
              <span style={{ ...styles.roleBadge, background: "#e8f0fe", color: "#0f3460" }}>Admin</span>
              <span style={styles.roleDesc}>Full access to all features</span>
            </div>
            <div style={styles.roleInfoItem}>
              <span style={{ ...styles.roleBadge, background: "#f0fdf4", color: "#15803d" }}>Worker</span>
              <span style={styles.roleDesc}>Can manage tasks and surveys</span>
            </div>
            <div style={styles.roleInfoItem}>
              <span style={{ ...styles.roleBadge, background: "#fef9ec", color: "#b45309" }}>Viewer</span>
              <span style={styles.roleDesc}>Read only access to dashboard</span>
            </div>
          </div>

          <div style={styles.formActions}>
            <button onClick={handleSubmit} style={styles.submitBtn} disabled={submitting}>
              {submitting ? "Registering..." : "Register User"}
            </button>
            <button onClick={() => { setShowForm(false); setError(""); }} style={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>Loading users...</div>
      ) : (
        <>
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <span style={styles.tableTitle}>
                Showing {filtered.length} of {users.length} users
              </span>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Joined</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} style={i % 2 === 0 ? styles.trEven : {}}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={{
                          ...styles.avatar,
                          background: u.role === "admin"
                            ? "linear-gradient(135deg, #0f3460, #533483)"
                            : u.role === "worker"
                            ? "linear-gradient(135deg, #15803d, #166534)"
                            : "linear-gradient(135deg, #b45309, #92400e)"
                        }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={styles.userName}>{u.name}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.rolePill,
                        background: roleColor(u.role).bg,
                        color: roleColor(u.role).color
                      }}>
                        {u.role === "admin" ? "🛡️" : u.role === "worker" ? "👷" : "👁️"} {u.role}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(u.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.activePill}>● Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={styles.empty}>No users found matching your search.</div>
            )}
          </div>

          <div style={styles.rolesCard}>
            <h3 style={styles.rolesTitle}>Role Permissions Overview</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Feature</th>
                  <th style={styles.th}>Admin</th>
                  <th style={styles.th}>Worker</th>
                  <th style={styles.th}>Viewer</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["View Dashboard", true, true, true],
                  ["Submit Feedback", true, true, false],
                  ["Manage Workers", true, false, false],
                  ["Manage Tasks", true, true, false],
                  ["View Analytics", true, true, true],
                  ["Manage Voters", true, false, false],
                  ["Conduct Surveys", true, true, false],
                  ["Manage Users", true, false, false],
                  ["Export Reports", true, false, false],
                  ["Trigger Escalation", true, false, false],
                ].map(([feature, admin, worker, viewer], i) => (
                  <tr key={i} style={i % 2 === 0 ? styles.trEven : {}}>
                    <td style={{ ...styles.td, fontWeight: "600" }}>{feature}</td>
                    <td style={styles.td}>{admin ? "✅" : "❌"}</td>
                    <td style={styles.td}>{worker ? "✅" : "❌"}</td>
                    <td style={styles.td}>{viewer ? "✅" : "❌"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  );
};

const styles = {
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
  statCard: { background: "white", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  statIcon: { fontSize: "28px" },
  statVal: { fontSize: "24px", fontWeight: "800", color: "#1a1a2e" },
  statLbl: { fontSize: "12px", color: "#888", marginTop: "2px" },
  successMsg: { background: "#f0fdf4", border: "1px solid #22c55e", color: "#15803d", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontWeight: "500" },
  errorMsg: { background: "#fff0f0", border: "1px solid #ffcccc", color: "#cc0000", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontWeight: "500" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "16px", flexWrap: "wrap" },
  left: { display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" },
  search: { padding: "8px 16px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", width: "250px" },
  filters: { display: "flex", gap: "8px" },
  filterBtn: { padding: "8px 16px", borderRadius: "20px", border: "1px solid #ddd", background: "white", cursor: "pointer", fontSize: "13px", fontWeight: "500" },
  filterBtnActive: { background: "#1a1a2e", color: "white", border: "1px solid #1a1a2e" },
  addBtn: { padding: "10px 20px", background: "#0f3460", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  form: { background: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  formTitle: { fontSize: "16px", fontWeight: "700", marginBottom: "20px", color: "#1a1a2e" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#444" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" },
  roleInfo: { display: "flex", gap: "20px", padding: "16px", background: "#f8f9fa", borderRadius: "8px", marginBottom: "20px", flexWrap: "wrap" },
  roleInfoItem: { display: "flex", alignItems: "center", gap: "8px" },
  roleBadge: { padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" },
  roleDesc: { fontSize: "12px", color: "#666" },
  formActions: { display: "flex", gap: "12px" },
  submitBtn: { padding: "10px 24px", background: "#0f3460", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  cancelBtn: { padding: "10px 24px", background: "#f0f0f0", color: "#333", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  loading: { textAlign: "center", padding: "40px", color: "#666" },
  tableCard: { background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "24px", overflowX: "auto" },
  tableHeader: { marginBottom: "16px" },
  tableTitle: { fontSize: "13px", color: "#666" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px", fontSize: "12px", fontWeight: "700", color: "#666", textTransform: "uppercase", borderBottom: "2px solid #f0f0f0" },
  td: { padding: "12px", fontSize: "14px", color: "#333", borderBottom: "1px solid #f0f0f0" },
  trEven: { background: "#fafafa" },
  userCell: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px", flexShrink: 0 },
  userName: { fontWeight: "600", color: "#1a1a2e" },
  rolePill: { padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "700", textTransform: "capitalize" },
  activePill: { color: "#22c55e", fontWeight: "600", fontSize: "13px" },
  empty: { textAlign: "center", padding: "30px", color: "#888", fontSize: "14px" },
  rolesCard: { background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  rolesTitle: { fontSize: "16px", fontWeight: "700", color: "#1a1a2e", marginBottom: "20px" }
};

export default Users;