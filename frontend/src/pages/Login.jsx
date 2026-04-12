import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/users/login", { email: form.email, password: form.password });
      login(res.data.user, res.data.token);
      // Smart redirect based on role
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
          <div style={styles.icon}>🛡️</div>
          <h1 style={styles.title}>Admin Login</h1>
          <p style={styles.subtitle}>Digital Democracy — Officer Portal</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Enter your email" style={styles.input} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" style={styles.input} required />
          </div>
          <button type="submit" style={loading ? styles.btnDisabled : styles.btn} disabled={loading}>
            {loading ? "Logging in..." : "Login to Admin Panel"}
          </button>
        </form>
        <div style={styles.footer}>
          <Link to="/" style={styles.backLink}>← Back to Home</Link>
          <Link to="/citizen-login" style={styles.switchLink}>Citizen Login →</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f3460 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  card: { background: "white", borderRadius: "20px", padding: "40px", width: "100%", maxWidth: "420px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" },
  header: { textAlign: "center", marginBottom: "28px" },
  icon: { fontSize: "48px", marginBottom: "8px" },
  title: { fontSize: "26px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0" },
  subtitle: { fontSize: "13px", color: "#666", margin: 0 },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  error: { background: "#fff0f0", border: "1px solid #ffcccc", color: "#cc0000", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#374151" },
  input: { padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none" },
  btn: { padding: "14px", background: "linear-gradient(135deg, #0f3460, #1e293b)", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", marginTop: "4px" },
  btnDisabled: { padding: "14px", background: "#ccc", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "not-allowed", marginTop: "4px" },
  footer: { display: "flex", justifyContent: "space-between", marginTop: "20px" },
  backLink: { fontSize: "13px", color: "#64748b", fontWeight: "600", textDecoration: "none" },
  switchLink: { fontSize: "13px", color: "#0f3460", fontWeight: "600", textDecoration: "none" }
};

export default Login;