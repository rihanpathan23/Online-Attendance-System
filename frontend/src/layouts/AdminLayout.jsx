import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserCheck,
  School,
  CalendarX,
  LogOut,
  Menu,
  X,
  UserCircle,
  CalendarCheck,
} from "lucide-react";
import { C, globalCss } from "../theme";
import { auth } from "../services/api";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/requests", label: "Student Requests", icon: UserCheck },
  { to: "/admin/classes", label: "Classes", icon: School },
  { to: "/admin/holidays", label: "Off Days", icon: CalendarX },
];

// ... baaki ka poora code neeche waisa hi rahega

const css = `
  .ae-shell { display: flex; min-height: 100vh; }
  .ae-sidebar { width: 264px; background: ${C.navy}; padding: 20px 16px; display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; position: sticky; top: 0; height: 100vh; }
  .ae-nav { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; text-decoration: none; color: #cbd5e1; font: inherit; font-weight: 600; font-size: 15px; background: transparent; border: none; cursor: pointer; width: 100%; text-align: left; }
  .ae-nav:hover { background: rgba(255,255,255,.08); color: #fff; }
  .ae-nav.active { background: ${C.indigo}; color: #fff; }
  .ae-menu-btn, .ae-close-btn { display: none; }
  @media (max-width: 900px) {
    .ae-sidebar { position: fixed; z-index: 30; top: 0; bottom: 0; left: 0; transform: translateX(-100%); visibility: hidden; transition: transform .2s ease, visibility .2s; }
    .ae-sidebar.open { transform: translateX(0); visibility: visible; }
    .ae-menu-btn, .ae-close-btn { display: grid; }
    .ae-profile-text { display: none; }
  }
  @media (prefers-reduced-motion: reduce) { .ae-sidebar { transition: none; } }
`;

function Logo() {
  return (
    <Link
      to="/admin/dashboard"
      className="ae-link"
      aria-label="AttendEase dashboard"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
        color: "#fff",
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
      <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>
        AttendEase
      </span>
    </Link>
  );
}

export default function AdminLayout({ title, subtitle, actions, children }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const logout = () => {
    auth.clear();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="ae-root ae-shell">
      <style>{globalCss}</style>
      <style>{css}</style>
      <a href="#admin-main" className="ae-skip">
        Skip to main content
      </a>

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", zIndex: 20 }}
        />
      )}

      <aside
        className={`ae-sidebar${menuOpen ? " open" : ""}`}
        id="admin-sidebar"
        aria-label="Admin sidebar"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 6px 20px",
          }}
        >
          <Logo />
          <button
            type="button"
            className="ae-btn ae-close-btn"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{
              width: 36,
              height: 36,
              padding: 0,
              placeItems: "center",
              background: "transparent",
              color: "#cbd5e1",
              border: "none",
            }}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav
          aria-label="Admin navigation"
          style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}
        >
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `ae-nav${isActive ? " active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={20} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <button type="button" className="ae-nav" onClick={logout}>
          <LogOut size={20} aria-hidden="true" />
          Logout
        </button>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "12px clamp(16px, 4vw, 40px)",
            background: "#fff",
            borderBottom: `1px solid ${C.border}`,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              className="ae-btn ae-btn-secondary ae-menu-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="admin-sidebar"
              style={{ width: 40, height: 40, padding: 0, placeItems: "center" }}
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <span style={{ fontWeight: 700, color: C.muted }}>Admin Portal</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <UserCircle size={36} color={C.indigo} aria-hidden="true" />
            <div className="ae-profile-text" style={{ lineHeight: 1.25 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Administrator</div>
              <div style={{ fontSize: 12, color: C.muted }}>AttendEase Admin</div>
            </div>
          </div>
        </header>

        <main
          id="admin-main"
          style={{
            padding: "clamp(20px, 4vw, 40px)",
            display: "grid",
            gap: 24,
            maxWidth: 1240,
            width: "100%",
            alignContent: "start",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: "clamp(26px, 4vw, 34px)" }}>{title}</h1>
              {subtitle && (
                <p style={{ margin: "8px 0 0", color: C.muted, lineHeight: 1.6 }}>
                  {subtitle}
                </p>
              )}
            </div>
            {actions}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}