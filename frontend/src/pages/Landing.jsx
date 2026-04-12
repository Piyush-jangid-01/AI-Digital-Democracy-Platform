import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo}>🗳️</div>
          <h1 style={styles.title}>Digital Democracy</h1>
          <p style={styles.subtitle}>AI-Powered Civic Engagement Platform</p>
          <p style={styles.tagline}>
            Bridging citizens and government through real-time feedback, transparency, and action.
          </p>
        </div>

        <div style={styles.cards}>
          <div style={styles.card} onClick={() => navigate("/login")}>
            <div style={styles.cardIcon}>🛡️</div>
            <h2 style={styles.cardTitle}>Admin / Officer</h2>
            <p style={styles.cardDesc}>
              Manage feedback, assign field workers, publish announcements, view analytics and escalate issues.
            </p>
            <div style={styles.cardFeatures}>
              <span style={styles.feature}>📊 Analytics Dashboard</span>
              <span style={styles.feature}>👷 Worker Management</span>
              <span style={styles.feature}>📋 Task Assignment</span>
              <span style={styles.feature}>📢 Announcements</span>
            </div>
            <div style={styles.btn}>Login as Admin →</div>
          </div>

          <div style={{ ...styles.card, ...styles.cardGreen }} onClick={() => navigate("/citizen-login")}>
            <div style={styles.cardIcon}>🏛️</div>
            <h2 style={styles.cardTitle}>Citizen / Public</h2>
            <p style={styles.cardDesc}>
              Submit complaints, track your feedback, read announcements, and rate how your issues were resolved.
            </p>
            <div style={styles.cardFeatures}>
              <span style={{ ...styles.feature, ...styles.featureGreen }}>📝 Submit Feedback</span>
              <span style={{ ...styles.feature, ...styles.featureGreen }}>📊 Track Status</span>
              <span style={{ ...styles.feature, ...styles.featureGreen }}>🔔 Notifications</span>
              <span style={{ ...styles.feature, ...styles.featureGreen }}>⭐ Rate Resolutions</span>
            </div>
            <div style={{ ...styles.btn, ...styles.btnGreen }}>Login as Citizen →</div>
          </div>
        </div>

        <div style={styles.stats}>
          <div style={styles.stat}><span style={styles.statNum}>12</span><span style={styles.statLbl}>API Modules</span></div>
          <div style={styles.statDiv} />
          <div style={styles.stat}><span style={styles.statNum}>AI</span><span style={styles.statLbl}>Sentiment Analysis</span></div>
          <div style={styles.statDiv} />
          <div style={styles.stat}><span style={styles.statNum}>RT</span><span style={styles.statLbl}>Real-time Updates</span></div>
          <div style={styles.statDiv} />
          <div style={styles.stat}><span style={styles.statNum}>9</span><span style={styles.statLbl}>Database Tables</span></div>
        </div>

        <p style={styles.footer}>Hackolock 2026 · AI-Digital-Democracy Platform</p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f3460 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  container: { maxWidth: "860px", width: "100%", textAlign: "center" },
  header: { marginBottom: "48px" },
  logo: { fontSize: "56px", marginBottom: "12px", display: "block" },
  title: { fontSize: "36px", fontWeight: "800", color: "white", margin: "0 0 8px 0", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "16px", color: "rgba(255,255,255,0.5)", margin: "0 0 12px 0", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" },
  tagline: { fontSize: "15px", color: "rgba(255,255,255,0.6)", margin: 0, maxWidth: "480px", marginLeft: "auto", marginRight: "auto", lineHeight: "1.6" },
  cards: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" },
  card: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "32px 28px", cursor: "pointer", transition: "all 0.2s", textAlign: "left" },
  cardGreen: { border: "1px solid rgba(6,95,70,0.4)", background: "rgba(6,95,70,0.1)" },
  cardIcon: { fontSize: "36px", marginBottom: "16px", display: "block" },
  cardTitle: { fontSize: "20px", fontWeight: "800", color: "white", margin: "0 0 10px 0" },
  cardDesc: { fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: "1.6", margin: "0 0 20px 0" },
  cardFeatures: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" },
  feature: { fontSize: "11px", fontWeight: "600", padding: "4px 10px", borderRadius: "20px", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" },
  featureGreen: { background: "rgba(6,95,70,0.3)", color: "#6ee7b7" },
  btn: { padding: "12px 20px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", color: "white", fontWeight: "700", fontSize: "14px", textAlign: "center", cursor: "pointer" },
  btnGreen: { background: "rgba(6,95,70,0.4)", border: "1px solid rgba(6,95,70,0.6)", color: "#6ee7b7" },
  stats: { display: "flex", justifyContent: "center", alignItems: "center", gap: "24px", marginBottom: "32px", background: "rgba(255,255,255,0.04)", borderRadius: "14px", padding: "20px 32px", border: "1px solid rgba(255,255,255,0.08)" },
  stat: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  statNum: { fontSize: "20px", fontWeight: "800", color: "white" },
  statLbl: { fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: "600" },
  statDiv: { width: "1px", height: "32px", background: "rgba(255,255,255,0.1)" },
  footer: { fontSize: "12px", color: "rgba(255,255,255,0.25)" }
};

export default Landing;