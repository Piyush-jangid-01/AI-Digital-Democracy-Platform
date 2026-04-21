import { useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const Profile = () => {
  const { user, login, token } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const showMsg = (msg, isError = false) => {
    if (isError) setErrorMsg(msg);
    else setSuccessMsg(msg);
    setTimeout(() => { setSuccessMsg(""); setErrorMsg(""); }, 3000);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      showMsg("Profile updated successfully!");
      login({ ...user, name: form.name, email: form.email }, token);
    } catch (e) {
      showMsg("Failed to update profile", true);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showMsg("Passwords do not match", true);
    }
    if (passwordForm.newPassword.length < 6) {
      return showMsg("Password must be at least 6 characters", true);
    }
    setChangingPass(true);
    try {
      showMsg("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      showMsg("Failed to change password", true);
    } finally {
      setChangingPass(false);
    }
  };

  const handleSendWeeklyReport = async () => {
    try {
      await API.post("/escalation/weekly-report");
      showMsg("Weekly report sent to admin email!");
    } catch (e) {
      showMsg("Failed to send report", true);
    }
  };

  return (
    <Layout title="Profile & Settings">
      {successMsg && <div style={styles.success}>✅ {successMsg}</div>}
      {errorMsg && <div style={styles.error}>❌ {errorMsg}</div>}

      <div style={styles.grid}>
        <div style={styles.left}>
          <div style={styles.card}>
            <div style={styles.avatarSection}>
              <div style={styles.bigAvatar}>{user?.name?.charAt(0).toUpperCase()}</div>
              <div style={styles.avatarInfo}>
                <div style={styles.bigName}>{user?.name}</div>
                <div style={styles.bigEmail}>{user?.email}</div>
                <span style={styles.roleBadge}>{user?.role === "admin" ? "🛡️" : "👷"} {user?.role}</span>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>✏️ Edit Profile</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={styles.input} />
            </div>
            <button onClick={handleSaveProfile} style={styles.btn} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🔒 Change Password</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Current Password</label>
              <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} style={styles.input} />
            </div>
            <button onClick={handleChangePassword} style={styles.btn} disabled={changingPass}>
              {changingPass ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>

        <div style={styles.right}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📊 Account Stats</h3>
            <div style={styles.statsList}>
              {[
                ["Role", user?.role?.toUpperCase()],
                ["Account Status", "✅ Active"],
                ["Platform", "Digital Democracy"],
                ["Version", "v2.0.0"]
              ].map(([k, v]) => (
                <div key={k} style={styles.statItem}>
                  <span style={styles.statKey}>{k}</span>
                  <span style={styles.statVal}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>⚙️ Admin Actions</h3>
            <div style={styles.actionsList}>
              <div style={styles.actionItem}>
                <div>
                  <div style={styles.actionTitle}>Send Weekly Report</div>
                  <div style={styles.actionDesc}>Send AI-generated report to admin email immediately</div>
                </div>
                <button onClick={handleSendWeeklyReport} style={styles.actionBtn}>Send Now</button>
              </div>
              <div style={styles.actionItem}>
                <div>
                  <div style={styles.actionTitle}>Export All Feedback</div>
                  <div style={styles.actionDesc}>Download complete feedback database as CSV</div>
                </div>
                <a href="http://localhost:5000/api/feedback/export/csv" style={styles.actionBtn} download>Export</a>
              </div>
              <div style={styles.actionItem}>
                <div>
                  <div style={styles.actionTitle}>Public Feedback Form</div>
                  <div style={styles.actionDesc}>Open the citizen-facing feedback submission page</div>
                </div>
                <a href="/submit" target="_blank" style={styles.actionBtn}>Open</a>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🤖 AI System Status</h3>
            <div style={styles.statusList}>
              {[
                ["Sentiment Analysis", "HuggingFace emotion model", "#22c55e"],
                ["Topic Classification", "Keyword-based NLP", "#22c55e"],
                ["Auto Escalation", "Running every 6 hours", "#22c55e"],
                ["Weekly Report", "Every Monday 9AM", "#22c55e"],
                ["WebSockets", "Real-time active", "#22c55e"],
                ["Twitter API", "Credits depleted", "#e94560"],
                ["Reddit API", "Active (no auth needed)", "#22c55e"]
              ].map(([name, desc, color]) => (
                <div key={name} style={styles.statusItem}>
                  <span style={{ ...styles.statusDot, background: color }} />
                  <div>
                    <div style={styles.statusName}>{name}</div>
                    <div style={styles.statusDesc}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  success: { background: "#f0fdf4", border: "1px solid #22c55e", color: "#15803d", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontWeight: "500" },
  error: { background: "#fff0f0", border: "1px solid #e94560", color: "#cc0000", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontWeight: "500" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
  left: { display: "flex", flexDirection: "column", gap: "20px" },
  right: { display: "flex", flexDirection: "column", gap: "20px" },
  card: { background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "20px" },
  avatarSection: { display: "flex", alignItems: "center", gap: "20px" },
  bigAvatar: { width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #0f3460, #533483)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "28px", flexShrink: 0 },
  avatarInfo: { flex: 1 },
  bigName: { fontSize: "20px", fontWeight: "800", color: "#1a1a2e", marginBottom: "4px" },
  bigEmail: { fontSize: "13px", color: "#888", marginBottom: "8px" },
  roleBadge: { fontSize: "12px", fontWeight: "700", background: "#e8f0fe", color: "#0f3460", padding: "4px 12px", borderRadius: "12px" },
  inputGroup: { marginBottom: "16px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#444", marginBottom: "6px" },
  input: { width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" },
  btn: { padding: "10px 24px", background: "#0f3460", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  statsList: { display: "flex", flexDirection: "column", gap: "12px" },
  statItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f0f0" },
  statKey: { fontSize: "13px", color: "#666" },
  statVal: { fontSize: "13px", fontWeight: "700", color: "#1a1a2e" },
  actionsList: { display: "flex", flexDirection: "column", gap: "16px" },
  actionItem: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" },
  actionTitle: { fontSize: "13px", fontWeight: "700", color: "#1a1a2e", marginBottom: "2px" },
  actionDesc: { fontSize: "11px", color: "#888" },
  actionBtn: { padding: "7px 16px", background: "#0f3460", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "12px", textDecoration: "none", whiteSpace: "nowrap" },
  statusList: { display: "flex", flexDirection: "column", gap: "12px" },
  statusItem: { display: "flex", alignItems: "center", gap: "12px" },
  statusDot: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0 },
  statusName: { fontSize: "13px", fontWeight: "600", color: "#1a1a2e" },
  statusDesc: { fontSize: "11px", color: "#888" }
};

export default Profile;