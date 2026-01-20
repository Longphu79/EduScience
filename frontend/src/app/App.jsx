import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../features/auth/pages/Login.jsx";
import Register from "../features/auth/pages/Register.jsx";
import { AuthProvider, useAuth } from "../features/auth/state/auth.jsx";

function ProtectedRoute({ children }) {
  const { token, booting } = useAuth();
  if (booting) return null;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div style={{ minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20 }}>EduScience</div>
            <div style={{ opacity: 0.7, fontSize: 13 }}>Dashboard</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ padding: "10px 12px", borderRadius: 16, border: "1px solid rgba(15,23,42,.12)", background: "rgba(255,255,255,.75)" }}>
              <div style={{ fontWeight: 900 }}>{user?.username}</div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>{user?.role}</div>
            </div>
            <button onClick={logout} type="button" style={{ borderRadius: 14, padding: "10px 12px", border: "1px solid rgba(15,23,42,.14)", background: "rgba(255,255,255,.85)", fontWeight: 900, cursor: "pointer" }}>
              Logout
            </button>
          </div>
        </div>
        <div style={{ marginTop: 16, padding: 18, borderRadius: 22, border: "1px solid rgba(15,23,42,.12)", background: "rgba(255,255,255,.78)" }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Auth OK</div>
          <div style={{ opacity: 0.7, lineHeight: 1.6 }}>Bạn đã đăng nhập thành công. Tiếp theo build course/enrollment/profile.</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
