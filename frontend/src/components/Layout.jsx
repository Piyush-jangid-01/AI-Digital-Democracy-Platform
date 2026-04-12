import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, title }) => {
  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <Navbar title={title} />
        <div style={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh"
  },
  main: {
    marginLeft: "250px",
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },
  content: {
    padding: "30px",
    flex: 1
  }
};

export default Layout;