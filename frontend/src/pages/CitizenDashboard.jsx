import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const statusColor = (s) => {
  if (s === "resolved") return { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" };
  if (s === "in-progress") return { bg: "#fef9ec", color: "#b45309", dot: "#f59e0b" };
  if (s === "rejected") return { bg: "#fff1f2", color: "#be123c", dot: "#f43f5e" };
  return { bg: "#f0f4ff", color: "#1d4ed8", dot: "#3b82f6" };
};

const sentimentColor = (s) => {
  if (s === "positive") return "#22c55e";
  if (s === "negative") return "#e94560";
  if (s === "escalated") return "#dc2626";
  return "#f59e0b";
};

const CitizenDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("home");
  const [myFeedback, setMyFeedback] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [ratings, setRatings] = useState({});
  const [ratedIds, setRatedIds] = useState(new Set());
  const [notifOpen, setNotifOpen] = useState(false);

  const [form, setForm] = useState({ description: "", category: "", location: "" });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState("");

  const categories = ["Water Supply", "Roads", "Electricity", "Healthcare", "Education", "Sanitation", "Security", "Public Transport"];

  useEffect(() => {
    if (!token) { navigate("/citizen-login"); return; }
    fetchMyFeedback();
    fetchAnnouncements();
    fetchConstituencies();
  }, []);

  const fetchMyFeedback = async () => {
    try {
      const res = await API.get("/feedback/mine");
      setMyFeedback(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoadingFeedback(false); }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await API.get("/announcements");
      setAnnouncements(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoadingAnnouncements(false); }
  };

  const fetchConstituencies = async () => {
    try {
      const res = await API.get("/constituencies");
      setConstituencies(res.data.data);
    } catch (e) { console.error(e); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const formData = new FormData();
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("location", form.location);
      if (image) formData.append("image", image);

      const res = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: { authorization: token },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(data.data);
        setForm({ description: "", category: "", location: "" });
        setImage(null); setImagePreview(null);
        fetchMyFeedback();
      } else {
        setSubmitError(data.errors?.[0]?.msg || data.message || "Submission failed");
      }
    } catch (e) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRating = (feedbackId, stars) => {
    setRatings(prev => ({ ...prev, [feedbackId]: stars }));
    setRatedIds(prev => new Set([...prev, feedbackId]));
    // In production: API.post(`/feedback/${feedbackId}/rating`, { stars })
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const pendingCount = myFeedback.filter(f => f.status === "open").length;
  const resolvedCount = myFeedback.filter(f => f.status === "resolved").length;
  const inProgressCount = myFeedback.filter(f => f.status === "in-progress").length;

  // Notifications: resolved items + new announcements
  const notifications = [
    ...myFeedback.filter(f => f.status === "resolved").map(f => ({ type: "resolved", text: `Your feedback on "${f.category}" has been resolved!`, id: f.id })),
    ...myFeedback.filter(f => f.status === "in-progress").map(f => ({ type: "progress", text: `Your feedback on "${f.category}" is now in progress`, id: f.id })),
    ...announcements.slice(0, 3).map(a => ({ type: "announcement", text: `New announcement: ${a.title}`, id: a.id }))
  ];

  const tabs = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "submit", icon: "📝", label: "Submit" },
    { id: "track", icon: "📊", label: "My Issues" },
    { id: "announcements", icon: "📢", label: "News" },
    { id: "constituency", icon: "🏛️", label: "Area Info" },
    { id: "profile", icon: "👤", label: "Profile" }
  ];

  return (
    <div style={styles.page}>
      {/* Top Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.navIcon}>🏛️</span>
          <div>
            <div style={styles.navTitle}>Digital Democracy</div>
            <div style={styles.navSub}>Citizen Portal</div>
          </div>
        </div>
        <div style={styles.navRight}>
          {/* Notification Bell */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setNotifOpen(!notifOpen)} style={styles.bellBtn}>
              🔔
              {notifications.length > 0 && <span style={styles.bellBadge}>{notifications.length}</span>}
            </button>
            {notifOpen && (
              <div style={styles.notifDropdown}>
                <div style={styles.notifHeader}>Notifications</div>
                {notifications.length === 0 ? (
                  <div style={styles.notifEmpty}>No notifications</div>
                ) : notifications.map((n, i) => (
                  <div key={i} style={styles.notifItem}>
                    <span style={styles.notifDot(n.type)} />
                    <span style={styles.notifText}>{n.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.userBadge}>
            <div style={styles.userAvatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userRole}>Citizen</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={styles.tabBar}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ ...styles.tabBtn, ...(activeTab === tab.id ? styles.tabBtnActive : {}) }}>
            <span style={{ fontSize: "14px" }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div style={styles.content}>

        {/* HOME TAB */}
        {activeTab === "home" && (
          <div>
            <div style={styles.welcomeBanner}>
              <div>
                <div style={styles.welcomeTitle}>Welcome back, {user?.name?.split(" ")[0]}! 👋</div>
                <div style={styles.welcomeSub}>Submit issues, track your complaints, and stay informed.</div>
              </div>
              <button onClick={() => setActiveTab("submit")} style={styles.ctaBtn}>+ New Feedback</button>
            </div>

            <div style={styles.statsRow}>
              {[
                { num: myFeedback.length, lbl: "Total Submitted", color: "#064e3b", icon: "💬" },
                { num: pendingCount, lbl: "Open", color: "#3b82f6", icon: "⏳" },
                { num: inProgressCount, lbl: "In Progress", color: "#f59e0b", icon: "🔧" },
                { num: resolvedCount, lbl: "Resolved", color: "#22c55e", icon: "✅" },
              ].map((s, i) => (
                <div key={i} style={styles.statCard}>
                  <div style={{ ...styles.statNum, color: s.color }}>{s.num}</div>
                  <div style={styles.statLbl}>{s.lbl}</div>
                  <div style={styles.statIcon}>{s.icon}</div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div style={styles.quickActions}>
              <div style={styles.qaTitle}>Quick Actions</div>
              <div style={styles.qaRow}>
                <button onClick={() => setActiveTab("submit")} style={styles.qaBtn}>📝 Submit New Issue</button>
                <button onClick={() => setActiveTab("track")} style={styles.qaBtn}>📊 Track My Issues</button>
                <button onClick={() => setActiveTab("announcements")} style={styles.qaBtn}>📢 Read Announcements</button>
                <button onClick={() => setActiveTab("constituency")} style={styles.qaBtn}>🏛️ Area Info</button>
              </div>
            </div>

            {myFeedback.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h3 style={styles.sectionTitle}>Recent Submissions</h3>
                  <button onClick={() => setActiveTab("track")} style={styles.seeAllBtn}>See All →</button>
                </div>
                <div style={styles.feedbackList}>
                  {myFeedback.slice(0, 3).map(f => {
                    const sc = statusColor(f.status);
                    return (
                      <div key={f.id} style={styles.feedbackItem}>
                        <div style={styles.feedbackLeft}>
                          <div style={styles.feedbackCategory}>{f.category}</div>
                          <div style={styles.feedbackDesc}>{f.description.slice(0, 80)}{f.description.length > 80 ? "..." : ""}</div>
                          <div style={styles.feedbackMeta}>📍 {f.location} · {new Date(f.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                        </div>
                        <div style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", background: sc.bg, color: sc.color, whiteSpace: "nowrap" }}>
                          <span style={{ color: sc.dot }}>● </span>{f.status || "open"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {announcements.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h3 style={styles.sectionTitle}>Latest Announcements</h3>
                  <button onClick={() => setActiveTab("announcements")} style={styles.seeAllBtn}>See All →</button>
                </div>
                {announcements.slice(0, 2).map(a => (
                  <div key={a.id} style={styles.announcementCard}>
                    <div style={styles.announcementTitle}>📢 {a.title}</div>
                    <div style={styles.announcementContent}>{a.content.slice(0, 120)}{a.content.length > 120 ? "..." : ""}</div>
                    <div style={styles.announcementMeta}>{a.constituency_name ? `📍 ${a.constituency_name}` : "📍 All Constituencies"} · {new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBMIT TAB */}
        {activeTab === "submit" && (
          <div style={styles.formCard}>
            <h2 style={styles.formCardTitle}>📝 Submit New Feedback</h2>
            <p style={styles.formCardSub}>Your feedback is automatically analyzed by AI and sent to the concerned authority.</p>

            {submitSuccess ? (
              <div style={styles.successBox}>
                <div style={{ fontSize: "36px" }}>✅</div>
                <div>
                  <div style={styles.successTitle}>Submitted Successfully!</div>
                  <div style={styles.successMeta}>Sentiment: <strong>{submitSuccess.sentiment}</strong></div>
                  <div style={styles.successMeta}>Topic: <strong>{submitSuccess.topic}</strong></div>
                  {submitSuccess.image_url && <div style={styles.successMeta}>Image attached ✅</div>}
                  <div style={{ ...styles.successMeta, marginTop: "8px", padding: "8px", background: "#d1fae5", borderRadius: "6px", fontSize: "12px" }}>
                    You'll receive a notification when the status updates.
                  </div>
                  <button onClick={() => setSubmitSuccess(null)} style={styles.submitAnotherBtn}>Submit Another</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} style={styles.feedbackForm}>
                {submitError && <div style={styles.formError}>{submitError}</div>}

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Describe Your Issue</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your complaint or feedback in detail..." style={styles.textarea} rows={4} required />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={styles.select} required>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Location / Area</label>
                    <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Sector 5, Faridabad" style={styles.input} required />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Attach Image (Optional)</label>
                  {!imagePreview ? (
                    <label style={styles.uploadBox}>
                      <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                      <div style={{ fontSize: "28px", marginBottom: "8px" }}>📷</div>
                      <div style={styles.uploadText}>Click to attach a photo</div>
                      <div style={styles.uploadHint}>JPEG, PNG, WEBP — max 5MB</div>
                    </label>
                  ) : (
                    <div style={{ position: "relative" }}>
                      <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
                      <button type="button" onClick={() => { setImage(null); setImagePreview(null); }} style={styles.removeImageBtn}>✕ Remove</button>
                    </div>
                  )}
                </div>

                <button type="submit" style={submitting ? styles.submitBtnDisabled : styles.submitBtnGreen} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TRACK TAB */}
        {activeTab === "track" && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.pageTitle}>📊 My Feedback History</h2>
              <span style={styles.countBadge}>{myFeedback.length} total</span>
            </div>

            {loadingFeedback ? (
              <div style={styles.loading}>Loading...</div>
            ) : myFeedback.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>💬</div>
                <div style={styles.emptyTitle}>No feedback yet</div>
                <button onClick={() => setActiveTab("submit")} style={styles.submitBtnGreen}>Submit Feedback</button>
              </div>
            ) : (
              <div style={styles.trackList}>
                {myFeedback.map(f => {
                  const sc = statusColor(f.status);
                  const isResolved = f.status === "resolved";
                  const alreadyRated = ratedIds.has(f.id);
                  const myRating = ratings[f.id];

                  return (
                    <div key={f.id} style={styles.trackCard}>
                      <div style={styles.trackCardHeader}>
                        <div style={styles.trackLeft}>
                          <span style={styles.trackCategory}>{f.category}</span>
                          {f.topic && <span style={styles.trackTopic}>🏷️ {f.topic}</span>}
                        </div>
                        <div style={styles.trackRight}>
                          <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", background: sc.bg, color: sc.color }}>
                            <span style={{ color: sc.dot }}>● </span>{f.status || "open"}
                          </span>
                          {f.sentiment && (
                            <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", color: "white", background: sentimentColor(f.sentiment) }}>
                              {f.sentiment}
                            </span>
                          )}
                        </div>
                      </div>

                      <p style={styles.trackDesc}>{f.description}</p>

                      {f.image_url && <img src={`http://localhost:5000${f.image_url}`} alt="Attached" style={styles.trackImage} />}

                      <div style={styles.trackMeta}>
                        <span>📍 {f.location}</span>
                        <span>🕐 {new Date(f.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                        <span>ID: #{f.id}</span>
                      </div>

                      {/* Rate Resolution — only for resolved issues */}
                      {isResolved && (
                        <div style={styles.ratingBox}>
                          <div style={styles.ratingLabel}>
                            {alreadyRated ? `✅ You rated this resolution: ${myRating}/5 stars` : "How satisfied are you with the resolution?"}
                          </div>
                          {!alreadyRated && (
                            <div style={styles.stars}>
                              {[1, 2, 3, 4, 5].map(s => (
                                <button key={s} onClick={() => handleRating(f.id, s)} style={{ ...styles.star, color: (ratings[f.id] || 0) >= s ? "#f59e0b" : "#d1d5db" }}>
                                  ★
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {activeTab === "announcements" && (
          <div>
            <h2 style={styles.pageTitle}>📢 Public Announcements</h2>
            <p style={styles.pageSub}>Official updates from your constituency representatives</p>

            {loadingAnnouncements ? (
              <div style={styles.loading}>Loading...</div>
            ) : announcements.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>📢</div>
                <div style={styles.emptyTitle}>No announcements yet</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {announcements.map(a => (
                  <div key={a.id} style={styles.announcementBigCard}>
                    <div style={styles.announcementBigHeader}>
                      <h3 style={styles.announcementBigTitle}>{a.title}</h3>
                      <span style={{ fontSize: "12px", color: "#9ca3af" }}>{new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.7", marginBottom: "12px" }}>{a.content}</p>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "12px", color: "#065f46", fontWeight: "600" }}>📍 {a.constituency_name || "All Constituencies"}</span>
                      {a.created_by_name && <span style={{ fontSize: "12px", color: "#9ca3af" }}>Posted by {a.created_by_name}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONSTITUENCY TAB */}
        {activeTab === "constituency" && (
          <div>
            <h2 style={styles.pageTitle}>🏛️ Area Information</h2>
            <p style={styles.pageSub}>Constituency details and voter statistics in your region</p>
            <div style={styles.constGrid}>
              {constituencies.map(c => (
                <div key={c.id} style={styles.constCard}>
                  <div style={{ fontSize: "32px", marginBottom: "10px" }}>🏛️</div>
                  <div style={styles.constName}>{c.name}</div>
                  <div style={styles.constLocation}>{c.city}, {c.state}</div>
                  <div style={{ height: "1px", background: "#f0fdf4", margin: "12px 0" }} />
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "#065f46" }}>{c.total_voters?.toLocaleString() || "—"}</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>Registered Voters</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div style={styles.profileContainer}>
            <div style={styles.profileCard}>
              <div style={styles.profileAvatar}>{user?.name?.charAt(0).toUpperCase()}</div>
              <div style={styles.profileName}>{user?.name}</div>
              <div style={styles.profileRole}>Citizen · Digital Democracy</div>
              <div style={styles.profileEmail}>{user?.email}</div>
            </div>

            <div style={styles.profileStats}>
              <div style={styles.profileStatItem}>
                <div style={styles.profileStatNum}>{myFeedback.length}</div>
                <div style={styles.profileStatLbl}>Feedback Submitted</div>
              </div>
              <div style={styles.profileStatItem}>
                <div style={{ ...styles.profileStatNum, color: "#22c55e" }}>{resolvedCount}</div>
                <div style={styles.profileStatLbl}>Resolved Issues</div>
              </div>
              <div style={styles.profileStatItem}>
                <div style={{ ...styles.profileStatNum, color: "#f59e0b" }}>{pendingCount}</div>
                <div style={styles.profileStatLbl}>Pending Issues</div>
              </div>
              <div style={styles.profileStatItem}>
                <div style={{ ...styles.profileStatNum, color: "#8b5cf6" }}>{Object.keys(ratings).length}</div>
                <div style={styles.profileStatLbl}>Issues Rated</div>
              </div>
            </div>

            <div style={styles.profileInfoCard}>
              <div style={styles.profileInfoTitle}>Account Information</div>
              <div style={styles.profileInfoRow}><span style={styles.profileInfoLabel}>Name</span><span style={styles.profileInfoValue}>{user?.name}</span></div>
              <div style={styles.profileInfoRow}><span style={styles.profileInfoLabel}>Email</span><span style={styles.profileInfoValue}>{user?.email}</span></div>
              <div style={styles.profileInfoRow}><span style={styles.profileInfoLabel}>Role</span><span style={styles.profileInfoValue}>Citizen</span></div>
              <div style={styles.profileInfoRow}><span style={styles.profileInfoLabel}>Member Since</span><span style={styles.profileInfoValue}>{new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span></div>
            </div>

            <div style={styles.profileInfoCard}>
              <div style={styles.profileInfoTitle}>My Activity Summary</div>
              {["Water Supply", "Roads", "Electricity", "Healthcare"].map(cat => {
                const count = myFeedback.filter(f => f.category === cat).length;
                if (count === 0) return null;
                return (
                  <div key={cat} style={styles.activityRow}>
                    <span style={styles.activityCat}>{cat}</span>
                    <div style={styles.activityBar}>
                      <div style={{ ...styles.activityFill, width: `${Math.min(100, (count / myFeedback.length) * 100)}%` }} />
                    </div>
                    <span style={styles.activityCount}>{count}</span>
                  </div>
                );
              })}
              {myFeedback.length === 0 && <div style={{ fontSize: "13px", color: "#9ca3af" }}>No activity yet</div>}
            </div>

            <button onClick={handleLogout} style={styles.profileLogoutBtn}>🚪 Logout</button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", background: "#f0fdf4", fontFamily: "'Segoe UI', sans-serif" },
  navbar: { background: "linear-gradient(135deg, #064e3b, #065f46)", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" },
  navLeft: { display: "flex", alignItems: "center", gap: "12px" },
  navIcon: { fontSize: "24px" },
  navTitle: { color: "white", fontWeight: "800", fontSize: "15px" },
  navSub: { color: "rgba(255,255,255,0.6)", fontSize: "11px" },
  navRight: { display: "flex", alignItems: "center", gap: "12px" },
  bellBtn: { position: "relative", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "8px 10px", cursor: "pointer", fontSize: "16px" },
  bellBadge: { position: "absolute", top: "-6px", right: "-6px", background: "#f43f5e", color: "white", borderRadius: "50%", width: "16px", height: "16px", fontSize: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" },
  notifDropdown: { position: "absolute", right: 0, top: "44px", width: "280px", background: "white", borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", zIndex: 200, overflow: "hidden" },
  notifHeader: { padding: "12px 16px", fontWeight: "700", fontSize: "13px", color: "#064e3b", borderBottom: "1px solid #f0fdf4" },
  notifEmpty: { padding: "16px", fontSize: "13px", color: "#9ca3af", textAlign: "center" },
  notifItem: { display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 16px", borderBottom: "1px solid #f9fafb" },
  notifDot: (type) => ({ width: "8px", height: "8px", borderRadius: "50%", marginTop: "4px", flexShrink: 0, background: type === "resolved" ? "#22c55e" : type === "progress" ? "#f59e0b" : "#3b82f6" }),
  notifText: { fontSize: "12px", color: "#374151", lineHeight: "1.4" },
  userBadge: { display: "flex", alignItems: "center", gap: "8px" },
  userAvatar: { width: "34px", height: "34px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px" },
  userName: { color: "white", fontWeight: "600", fontSize: "13px" },
  userRole: { color: "rgba(255,255,255,0.5)", fontSize: "11px" },
  logoutBtn: { padding: "7px 14px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "white", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  tabBar: { background: "white", borderBottom: "1px solid #d1fae5", display: "flex", padding: "0 20px", gap: "2px", overflowX: "auto" },
  tabBtn: { display: "flex", alignItems: "center", gap: "5px", padding: "12px 14px", border: "none", background: "transparent", cursor: "pointer", fontSize: "12px", fontWeight: "600", color: "#6b7280", whiteSpace: "nowrap", borderBottom: "3px solid transparent" },
  tabBtnActive: { color: "#065f46", borderBottom: "3px solid #065f46" },
  content: { maxWidth: "960px", margin: "0 auto", padding: "24px 20px" },
  welcomeBanner: { background: "linear-gradient(135deg, #064e3b, #065f46)", borderRadius: "14px", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  welcomeTitle: { color: "white", fontSize: "18px", fontWeight: "800", marginBottom: "4px" },
  welcomeSub: { color: "rgba(255,255,255,0.7)", fontSize: "12px" },
  ctaBtn: { padding: "10px 20px", background: "white", color: "#065f46", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" },
  statCard: { background: "white", borderRadius: "10px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", position: "relative", overflow: "hidden" },
  statNum: { fontSize: "24px", fontWeight: "800", color: "#064e3b", marginBottom: "4px" },
  statLbl: { fontSize: "11px", color: "#888" },
  statIcon: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "24px", opacity: 0.12 },
  quickActions: { background: "white", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  qaTitle: { fontSize: "12px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" },
  qaRow: { display: "flex", gap: "8px", flexWrap: "wrap" },
  qaBtn: { padding: "8px 14px", background: "#f0fdf4", border: "1px solid #d1fae5", borderRadius: "8px", fontSize: "12px", fontWeight: "600", color: "#065f46", cursor: "pointer" },
  section: { background: "white", borderRadius: "12px", padding: "16px 20px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" },
  sectionTitle: { fontSize: "14px", fontWeight: "700", color: "#064e3b", margin: 0 },
  seeAllBtn: { fontSize: "12px", color: "#065f46", background: "none", border: "none", cursor: "pointer", fontWeight: "600" },
  feedbackList: { display: "flex", flexDirection: "column", gap: "10px" },
  feedbackItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f9fafb", borderRadius: "8px", gap: "10px" },
  feedbackLeft: { flex: 1 },
  feedbackCategory: { fontSize: "10px", fontWeight: "700", color: "#065f46", background: "#d1fae5", padding: "2px 8px", borderRadius: "8px", display: "inline-block", marginBottom: "4px" },
  feedbackDesc: { fontSize: "12px", color: "#374151", marginBottom: "3px" },
  feedbackMeta: { fontSize: "10px", color: "#9ca3af" },
  announcementCard: { background: "#f0fdf4", border: "1px solid #d1fae5", borderRadius: "8px", padding: "14px", marginBottom: "10px" },
  announcementTitle: { fontSize: "13px", fontWeight: "700", color: "#064e3b", marginBottom: "5px" },
  announcementContent: { fontSize: "12px", color: "#374151", lineHeight: "1.5", marginBottom: "6px" },
  announcementMeta: { fontSize: "10px", color: "#6b7280" },
  formCard: { background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", maxWidth: "680px", margin: "0 auto" },
  formCardTitle: { fontSize: "18px", fontWeight: "800", color: "#064e3b", marginBottom: "6px" },
  formCardSub: { fontSize: "12px", color: "#6b7280", marginBottom: "20px" },
  successBox: { background: "#f0fdf4", border: "1px solid #22c55e", borderRadius: "12px", padding: "20px", display: "flex", gap: "14px" },
  successTitle: { fontSize: "15px", fontWeight: "700", color: "#15803d", marginBottom: "6px" },
  successMeta: { fontSize: "12px", color: "#166534", marginBottom: "4px" },
  submitAnotherBtn: { marginTop: "12px", padding: "8px 16px", background: "#22c55e", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "12px" },
  feedbackForm: { display: "flex", flexDirection: "column", gap: "16px" },
  formError: { background: "#fff0f0", border: "1px solid #ffcccc", color: "#cc0000", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
  label: { fontSize: "12px", fontWeight: "600", color: "#374151" },
  textarea: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1fae5", fontSize: "13px", resize: "vertical" },
  select: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1fae5", fontSize: "13px" },
  input: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1fae5", fontSize: "13px" },
  formRow: { display: "flex", gap: "12px" },
  uploadBox: { border: "2px dashed #6ee7b7", borderRadius: "10px", padding: "24px", textAlign: "center", cursor: "pointer", display: "block" },
  uploadText: { fontSize: "13px", fontWeight: "600", color: "#065f46", marginBottom: "4px" },
  uploadHint: { fontSize: "11px", color: "#9ca3af" },
  imagePreview: { width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "8px" },
  removeImageBtn: { position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "6px", padding: "5px 10px", cursor: "pointer", fontSize: "11px", fontWeight: "600" },
  submitBtnGreen: { padding: "13px", background: "linear-gradient(135deg, #065f46, #064e3b)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer" },
  submitBtnDisabled: { padding: "13px", background: "#ccc", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "not-allowed" },
  pageTitle: { fontSize: "18px", fontWeight: "800", color: "#064e3b", marginBottom: "4px" },
  pageSub: { fontSize: "12px", color: "#6b7280", marginBottom: "20px" },
  countBadge: { background: "#d1fae5", color: "#065f46", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  loading: { textAlign: "center", padding: "48px", color: "#6b7280", fontSize: "14px" },
  emptyState: { textAlign: "center", padding: "48px 20px" },
  emptyTitle: { fontSize: "16px", fontWeight: "700", color: "#064e3b", marginBottom: "12px" },
  trackList: { display: "flex", flexDirection: "column", gap: "14px" },
  trackCard: { background: "white", borderRadius: "12px", padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  trackCardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "6px" },
  trackLeft: { display: "flex", gap: "6px", flexWrap: "wrap" },
  trackRight: { display: "flex", gap: "6px", flexWrap: "wrap" },
  trackCategory: { fontSize: "11px", fontWeight: "700", color: "#065f46", background: "#d1fae5", padding: "3px 8px", borderRadius: "10px" },
  trackTopic: { fontSize: "11px", color: "#6b7280", background: "#f3f4f6", padding: "3px 8px", borderRadius: "10px" },
  trackDesc: { fontSize: "13px", color: "#374151", lineHeight: "1.6", marginBottom: "8px" },
  trackImage: { width: "100%", maxHeight: "140px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" },
  trackMeta: { display: "flex", gap: "14px", flexWrap: "wrap", fontSize: "11px", color: "#9ca3af", borderTop: "1px solid #f3f4f6", paddingTop: "8px" },
  ratingBox: { marginTop: "12px", padding: "12px 14px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #d1fae5" },
  ratingLabel: { fontSize: "12px", fontWeight: "600", color: "#064e3b", marginBottom: "8px" },
  stars: { display: "flex", gap: "4px" },
  star: { fontSize: "24px", background: "none", border: "none", cursor: "pointer", padding: "0 2px" },
  announcementBigCard: { background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: "4px solid #22c55e" },
  announcementBigHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexWrap: "wrap", gap: "6px" },
  announcementBigTitle: { fontSize: "15px", fontWeight: "700", color: "#064e3b", margin: 0 },
  constGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" },
  constCard: { background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", textAlign: "center" },
  constName: { fontSize: "15px", fontWeight: "700", color: "#064e3b", marginBottom: "4px" },
  constLocation: { fontSize: "12px", color: "#9ca3af", marginBottom: "12px" },
  profileContainer: { maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" },
  profileCard: { background: "linear-gradient(135deg, #064e3b, #065f46)", borderRadius: "16px", padding: "32px", textAlign: "center" },
  profileAvatar: { width: "72px", height: "72px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "28px", margin: "0 auto 12px" },
  profileName: { color: "white", fontSize: "20px", fontWeight: "800", marginBottom: "4px" },
  profileRole: { color: "rgba(255,255,255,0.6)", fontSize: "12px", marginBottom: "4px" },
  profileEmail: { color: "rgba(255,255,255,0.5)", fontSize: "12px" },
  profileStats: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" },
  profileStatItem: { background: "white", borderRadius: "10px", padding: "14px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  profileStatNum: { fontSize: "22px", fontWeight: "800", color: "#064e3b", marginBottom: "4px" },
  profileStatLbl: { fontSize: "10px", color: "#9ca3af", fontWeight: "600" },
  profileInfoCard: { background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  profileInfoTitle: { fontSize: "13px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "14px" },
  profileInfoRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f9fafb" },
  profileInfoLabel: { fontSize: "13px", color: "#9ca3af" },
  profileInfoValue: { fontSize: "13px", fontWeight: "600", color: "#064e3b" },
  activityRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" },
  activityCat: { fontSize: "12px", color: "#374151", width: "110px", flexShrink: 0 },
  activityBar: { flex: 1, height: "6px", background: "#f0fdf4", borderRadius: "3px", overflow: "hidden" },
  activityFill: { height: "100%", background: "#22c55e", borderRadius: "3px" },
  activityCount: { fontSize: "12px", fontWeight: "700", color: "#065f46", width: "20px", textAlign: "right" },
  profileLogoutBtn: { padding: "13px", background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", textAlign: "center" }
};

export default CitizenDashboard;