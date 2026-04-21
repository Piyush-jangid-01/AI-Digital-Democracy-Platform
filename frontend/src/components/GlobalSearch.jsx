import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const [feedbackRes, workersRes, votersRes] = await Promise.all([
          API.get(`/feedback/search?keyword=${query}`),
          API.get("/workers"),
          API.get("/voters")
        ]);

        const feedback = (feedbackRes.data.data || []).slice(0, 4).map(f => ({
          type: "feedback", icon: "💬", title: f.description.slice(0, 60) + "...",
          sub: `${f.category} · ${f.location}`, path: "/feedback"
        }));

        const workers = (workersRes.data.data || [])
          .filter(w => w.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3).map(w => ({
            type: "worker", icon: "👷", title: w.name,
            sub: `${w.email} · ${w.phone}`, path: "/workers"
          }));

        const voters = (votersRes.data.data || [])
          .filter(v => v.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3).map(v => ({
            type: "voter", icon: "🗳️", title: v.name,
            sub: `Booth ${v.booth_number} · ${v.gender} · Age ${v.age}`, path: "/voters"
          }));

        setResults([...feedback, ...workers, ...voters]);
        setOpen(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (path) => {
    navigate(path);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={ref} style={styles.wrapper}>
      <div style={styles.inputWrapper}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search anything..."
          style={styles.input}
        />
        {loading && <span style={styles.spinner}>⏳</span>}
      </div>

      {open && results.length > 0 && (
        <div style={styles.dropdown}>
          {results.map((r, i) => (
            <div key={i} onClick={() => handleSelect(r.path)} style={styles.item}>
              <span style={styles.itemIcon}>{r.icon}</span>
              <div>
                <div style={styles.itemTitle}>{r.title}</div>
                <div style={styles.itemSub}>{r.sub}</div>
              </div>
              <span style={styles.itemType}>{r.type}</span>
            </div>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div style={styles.dropdown}>
          <div style={styles.noResults}>No results for "{query}"</div>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: { position: "relative", width: "320px" },
  inputWrapper: { display: "flex", alignItems: "center", background: "#f5f5f5", borderRadius: "10px", padding: "8px 14px", gap: "8px" },
  searchIcon: { fontSize: "14px" },
  input: { flex: 1, border: "none", background: "transparent", fontSize: "14px", outline: "none", color: "#333" },
  spinner: { fontSize: "12px" },
  dropdown: { position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "white", borderRadius: "12px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)", zIndex: 1000, overflow: "hidden" },
  item: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #f0f0f0", transition: "background 0.1s" },
  itemIcon: { fontSize: "20px", flexShrink: 0 },
  itemTitle: { fontSize: "13px", fontWeight: "600", color: "#1a1a2e", marginBottom: "2px" },
  itemSub: { fontSize: "11px", color: "#888" },
  itemType: { marginLeft: "auto", fontSize: "10px", fontWeight: "700", color: "#0f3460", background: "#e8f0fe", padding: "2px 8px", borderRadius: "8px", textTransform: "capitalize", flexShrink: 0 },
  noResults: { padding: "16px", textAlign: "center", color: "#888", fontSize: "13px" }
};

export default GlobalSearch;