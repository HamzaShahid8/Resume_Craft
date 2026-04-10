import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import ResumeDashboard from "./components/Resume/ResumeDashboard";
import ResumeForm from "./components/Resume/ResumeForm";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" />;
};

// Redirect logged-in users away from login/register
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  return token ? <Navigate to="/dashboard" /> : children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute><ResumeDashboard /></PrivateRoute>} />
        <Route path="/resume/:id" element={<PrivateRoute><ResumeForm /></PrivateRoute>} />

        {/* Default / unknown */}
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="*" element={<Navigate to="/register" />} />
      </Routes>
    </Router>
  );
}