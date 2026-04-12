import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import UserLogin from "./pages/UserLogin";
import Dashboard from "./pages/Dashboard";
import Feedback from "./pages/Feedback";
import Workers from "./pages/Workers";
import Tasks from "./pages/Tasks";
import Surveys from "./pages/Surveys";
import Analytics from "./pages/Analytics";
import Constituencies from "./pages/Constituencies";
import Announcements from "./pages/Announcements";
import CitizenDashboard from "./pages/CitizenDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/citizen-login" element={<UserLogin />} />

          {/* Citizen only */}
          <Route path="/citizen" element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute adminOnly><Feedback /></ProtectedRoute>} />
          <Route path="/workers" element={<ProtectedRoute adminOnly><Workers /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute adminOnly><Tasks /></ProtectedRoute>} />
          <Route path="/surveys" element={<ProtectedRoute adminOnly><Surveys /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute adminOnly><Analytics /></ProtectedRoute>} />
          <Route path="/constituencies" element={<ProtectedRoute adminOnly><Constituencies /></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute adminOnly><Announcements /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;