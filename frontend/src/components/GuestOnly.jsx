import { Navigate, Outlet } from "react-router-dom";
import { studentAuth } from "../services/api";

export default function GuestOnly() {
  return studentAuth.isLoggedIn() ? <Navigate to="/student/dashboard" replace /> : <Outlet />;
}