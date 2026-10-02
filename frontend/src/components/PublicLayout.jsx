import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogIn, LogOut, CalendarCheck } from "lucide-react";
import { C, globalCss } from "../theme";
import { auth, studentAuth } from "../services/api";

function Logo() {
  return (
    <Link
      to="/"
      className="ae-link"
      aria-label="AttendEase home"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
        color: C.navy,
        borderRadius: 10,
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          display: "grid",
          placeItems: "center",
          background: `linear-gradient(135deg, ${C.indigo}, #3b82f6)`,
          color: "#fff",
          flexShrink: 0,
        }}
      >
        <CalendarCheck size={22} aria-hidden="true" />
      </span>
      <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>AttendEase</span>
    </Link>
  );
}

const navClass = ({ isActive }) => `ae-navtop${isActive ? " active" : ""}`;

export default function PublicLayout({ children }) {
  const navigate = useNavigate();
  const student = studentAuth.isLoggedIn();
  const admin = auth.isLoggedIn();

  const logoutStudent = () => {
    studentAuth.clear();
    navigate("/", { replace: true });
  };

  return (
    <div className="ae-root" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{globalCss}</style>
      <a href="#main" className="ae-skip">
        Skip to main content
      </a>

      <header style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 20 }}>
        <div
          className="ae-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "12px clamp(16px, 5vw, 32px)",
            flexWrap: "wrap",
          }}
        >
          <Logo />
          <nav aria-label="Main" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            <NavLink to="/about" className={navClass}>
              About
            </NavLink>
            {student ? (
              <>
                <NavLink to="/student/dashboard" className={navClass}>
                  My Attendance
                </NavLink>
                <button
                  type="button"
                  className="ae-btn ae-btn-secondary ae-btn-sm"
                  onClick={logoutStudent}
                  style={{ marginLeft: 6 }}
                >
                  <LogOut size={16} aria-hidden="true" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/student/login" className={navClass}>
                  Student Login
                </NavLink>
                <Link
                  to={admin ? "/admin/dashboard" : "/admin/login"}
                  className="ae-btn ae-btn-secondary ae-btn-sm"
                  style={{ marginLeft: 6 }}
                >
                  <LogIn size={16} aria-hidden="true" />
                  {admin ? "Admin Dashboard" : "Admin Login"}
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main id="main" style={{ flex: 1 }}>
        {children}
      </main>

      <footer style={{ background: "#fff", borderTop: `1px solid ${C.border}` }}>
        <div
          className="ae-container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 20,
            flexWrap: "wrap",
            padding: "28px clamp(16px, 5vw, 32px)",
          }}
        >
          <div style={{ maxWidth: 420 }}>
            <strong style={{ fontSize: 17 }}>AttendEase</strong>
            <p style={{ margin: "6px 0 0", color: C.muted, fontSize: 14, lineHeight: 1.6 }}>
              The student portal for requesting access and viewing your attendance once your request is approved.
            </p>
          </div>
          <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.8 }}>
            <Link to="/about" className="ae-link" style={{ color: C.indigo, fontWeight: 600, textDecoration: "none" }}>
              About AttendEase
            </Link>
            <p style={{ margin: 0 }}>Made by Alfiya Shaikh, K.J. Somaiya College</p>
          </div>
        </div>
      </footer>
    </div>
  );
}