import { Link } from "react-router-dom";
import { GraduationCap, Clock, School, ClipboardCheck, ArrowRight, UserCheck, Users, Inbox } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { Alert, EmptyState, PageLoader, StatusBadge } from "../../components/UI";
import useAsync from "../../hooks/useAsync";
import { api } from "../../services/api";
import { C } from "../../theme";

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatNumber(value) {
  return typeof value === "number" ? value.toLocaleString("en-IN") : "—";
}

function formatPercent(value) {
  return typeof value === "number" ? `${Math.round(value * 10) / 10}%` : "—";
}

function AdminDashboard() {
  const { data, loading, error, reload } = useAsync(async () => {
    const [stats, requests] = await Promise.all([api.getStats(), api.getRequests()]);
    return { stats: stats || {}, requests: Array.isArray(requests) ? requests : [] };
  }, []);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const stats = data?.stats || {};
  const recent = [...(data?.requests || [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const cards = [
    { label: "Total Students", value: formatNumber(stats.totalStudents), icon: GraduationCap, tint: C.indigoSoft, color: C.indigo },
    { label: "Pending Requests", value: formatNumber(stats.pendingRequests), icon: Clock, tint: C.amberSoft, color: C.amber },
    { label: "Total Classes", value: formatNumber(stats.totalClasses), icon: School, tint: "#ecfeff", color: "#0e7490" },
    { label: "Today's Attendance", value: formatPercent(stats.todayAttendance), icon: ClipboardCheck, tint: C.greenSoft, color: C.green },
  ];

  return (
    <AdminLayout title="Welcome back, Admin" subtitle={today}>
      {loading && <PageLoader label="Loading dashboard..." />}

      {error && (
        <Alert type="error" title="Could not load the dashboard" onRetry={reload}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          <section aria-labelledby="stats-title">
            <h2 id="stats-title" className="ae-visually-hidden">Overview</h2>
            <ul className="ae-grid-auto" style={{ listStyle: "none", margin: 0, padding: 0, gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
              {cards.map(({ label, value, icon: Icon, tint, color }) => (
                <li key={label} className="ae-card" style={{ padding: 20 }}>
                  <span style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: tint, color }}>
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <p style={{ margin: "14px 0 2px", fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>{value}</p>
                  <p style={{ margin: 0, color: C.muted, fontSize: 14, fontWeight: 600 }}>{label}</p>
                </li>
              ))}
            </ul>
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, alignItems: "start" }}>
            <section aria-labelledby="recent-title" className="ae-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 8, flexWrap: "wrap" }}>
                <h2 id="recent-title" style={{ margin: 0, fontSize: 18 }}>Recent requests</h2>
                <Link to="/admin/requests" className="ae-link" style={{ color: C.indigo, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                  View all
                </Link>
              </div>
              {recent.length === 0 ? (
                <EmptyState icon={Inbox} title="No requests yet">
                  New student registration requests will appear here.
                </EmptyState>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
                  {recent.map((r) => (
                    <li
                      key={r.id}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, overflowWrap: "anywhere" }}>{r.fullName}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 13, color: C.muted }}>
                          {[r.className, r.departmentName].filter(Boolean).join(" · ")}
                          {r.createdAt && ` · ${formatDate(r.createdAt)}`}
                        </p>
                      </div>
                      <StatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="actions-title" className="ae-card" style={{ padding: 24 }}>
              <h2 id="actions-title" style={{ margin: "0 0 16px", fontSize: 18 }}>Quick actions</h2>
              <div style={{ display: "grid", gap: 12 }}>
                <Link to="/admin/requests" className="ae-btn ae-btn-primary" style={{ justifyContent: "space-between" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <UserCheck size={18} aria-hidden="true" /> Student Requests
                  </span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link to="/admin/students" className="ae-btn ae-btn-secondary" style={{ justifyContent: "space-between" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Users size={18} aria-hidden="true" /> Manage Students
                  </span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </section>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;