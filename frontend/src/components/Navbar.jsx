const Navbar = ({ title }) => {
  return (
    <div style={styles.navbar}>
      <h1 style={styles.title}>{title}</h1>
      <div style={styles.right}>
        <span style={styles.time}>
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          })}
        </span>
      </div>
    </div>
  );
};

const styles = {
  navbar: {
    height: "65px",
    background: "white",
    borderBottom: "1px solid #eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 30px",
    position: "sticky",
    top: 0,
    zIndex: 99
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1a1a2e"
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  time: {
    fontSize: "13px",
    color: "#666"
  }
};

export default Navbar;