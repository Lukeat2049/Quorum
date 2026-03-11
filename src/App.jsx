import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import LandingPage from "./pages/LandingPage.jsx";
import SignInPage from "./pages/SignInPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TeamSetup from "./pages/TeamSetup.jsx";
import TeamApp from "./pages/TeamApp.jsx";

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  return children;
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #ffccd2", borderTopColor: "#e60023", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
        <p style={{ fontSize: 14, color: "#999", fontWeight: 600 }}>Loading Quorum...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { isLoaded } = useAuth();
  if (!isLoaded) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/team/new" element={<ProtectedRoute><TeamSetup /></ProtectedRoute>} />
      <Route path="/team/:teamId" element={<ProtectedRoute><TeamApp /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
