import { Navigate, Outlet } from "react-router-dom";
import { auth, studentAuth } from "../services/api";

// Client-side gate. The backend verifies the token on every protected request.
export default function ProtectedRoute({ role = "admin" }) {
  const store = role === "student" ? studentAuth : auth;
  const loginPath = role === "student" ? "/student/login" : "/admin/login";
  return store.isLoggedIn() ? <Outlet /> : <Navigate to={loginPath} replace />;
}