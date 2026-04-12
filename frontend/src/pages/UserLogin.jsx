import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const UserLogin = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "register") {
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }
      try {
        await API.post("/users/register", { name: form.name, email: form.email, password: form.password, role: "citizen" });
        setMode("login");
        setError("");
        setForm({ ...form, name: "", confirmPassword: "" });
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Registration failed");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await API.post("/users/login", { email: form.email, password: form.password });
      login(res.data.user, res.data.token);
      const role = res.data.user?.role;
      if (role === "admin") navigate("/admin");
      else navigate("/citizen");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>🏛️</div>
          <h1 style={styles.title}>Citizen Portal</h1>
          <p style={styles.subtitle}>Your voice matters — Digital Democracy</p>
        </div>

        <div style={styles.tabs}>
          <button onClick={() => { setMode("login"); setError(""); }} style={{ ...styles.tab, ...(mode === "login" ? styles.tabActive : {}) }}>Login</button>
          <button onClick={() => { setMode("register"); setError(""); }} style={{ ...styles.tab, ...(mode === "register" ? styles.tabActive : {}) }}>Register</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          {mode === "register" && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter your full name" style={styles.input} required />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Enter your email" style={styles.input} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" style={styles.input} required />
          </div>

          {mode === "register" && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Re-enter your password" style={styles.input} required />
            </div>
          )}

          <button type="submit" style={loading ? styles.btnDisabled : styles.btn} disabled={loading}>
            {loading ? (mode === "register" ? "Registering..." : "Logging in...") : (mode === "register" ? "Create Account" : "Login")}
          </button>
        </form>

        <div style={styles.footer}>
          <Link to="/" style={styles.backLink}>← Back to Home</Link>
          <Link to="/login" style={styles.adminLink}>Admin Login →</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", background: "linear-gradient(135deg, #134e4a 0%, #065f46 50%, #064e3b 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  card: { background: "white", borderRadius: "20px", padding: "40px", width: "100%", maxWidth: "420px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" },
  header: { textAlign: "center", marginBottom: "28px" },
  icon: { fontSize: "48px", marginBottom: "8px" },
  title: { fontSize: "26px", fontWeight: "800", color: "#064e3b", margin: "0 0 6px 0" },
  subtitle: { fontSize: "13px", color: "#666", margin: 0 },
  tabs: { display: "flex", background: "#f0fdf4", borderRadius: "10px", padding: "4px", marginBottom: "24px" },
  tab: { flex: 1, padding: "10px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600", background: "transparent", color: "#666" },
  tabActive: { background: "white", color: "#064e3b", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  error: { background: "#fff0f0", border: "1px solid #ffcccc", color: "#cc0000", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#374151" },
  input: { padding: "12px 14px", borderRadius: "8px", border: "1px solid #d1fae5", fontSize: "14px", outline: "none" },
  btn: { padding: "14px", background: "linear-gradient(135deg, #065f46, #134e4a)", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", marginTop: "4px" },
  btnDisabled: { padding: "14px", background: "#ccc", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "not-allowed", marginTop: "4px" },
  footer: { display: "flex", justifyContent: "space-between", marginTop: "20px" },
  backLink: { fontSize: "13px", color: "#6b7280", fontWeight: "600", textDecoration: "none" },
  adminLink: { fontSize: "13px", color: "#065f46", fontWeight: "600", textDecoration: "none" }
};

export default UserLogin;