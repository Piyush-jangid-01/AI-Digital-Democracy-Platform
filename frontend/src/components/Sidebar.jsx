import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { path: "/admin", icon: "📊", label: "Dashboard" },
  { path: "/feedback", icon: "💬", label: "Feedback" },
  { path: "/analytics", icon: "📈", label: "Analytics" },
  { path: "/workers", icon: "👷", label: "Field Workers" },
  { path: "/tasks", icon: "📋", label: "Tasks" },
  { path: "/surveys", icon: "📝", label: "Surveys" },
  { path: "/constituencies", icon: "🏛️", label: "Constituencies" },
  { path: "/announcements", icon: "📢", label: "Announcements" },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <span style={styles.logoIcon}>🗳️</span>
        <div>
          <div style={styles.logoTitle}>Digital Democracy</div>
          <div style={styles.logoSubtitle}>Admin Panel</div>
        </div>
      </div>

      <div style={styles.userInfo}>
        <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
        <div>
          <div style={styles.userName}>{user?.name}</div>
          <div style={styles.userRole}>{user?.role}</div>
        </div>
      </div>

      <nav style={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.navItem,
              ...(location.pathname === item.path ? styles.navItemActive : {})
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div style={styles.bottomSection}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: { width: "250px", minHeight: "100vh", background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)", display: "flex", flexDirection: "column", padding: "20px 0", position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100, overflowY: "auto" },
  logo: { display: "flex", alignItems: "center", gap: "12px", padding: "0 20px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  logoIcon: { fontSize: "32px" },
  logoTitle: { color: "white", fontWeight: "800", fontSize: "14px" },
  logoSubtitle: { color: "rgba(255,255,255,0.5)", fontSize: "11px" },
  userInfo: { display: "flex", alignItems: "center", gap: "12px", padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  avatar: { width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, #0f3460, #533483)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "16px", flexShrink: 0 },
  userName: { color: "white", fontWeight: "600", fontSize: "13px" },
  userRole: { color: "rgba(255,255,255,0.5)", fontSize: "11px", textTransform: "capitalize" },
  nav: { flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" },
  navItem: { display: "flex", alignItems: "center", gap: "12px", padding: "11px 16px", borderRadius: "10px", color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "13px", fontWeight: "500" },
  navItemActive: { background: "rgba(255,255,255,0.15)", color: "white" },
  navIcon: { fontSize: "17px" },
  bottomSection: { padding: "12px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "8px" },
  logoutBtn: { padding: "10px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "13px", fontWeight: "500", textAlign: "left" }
};

export default Sidebar;