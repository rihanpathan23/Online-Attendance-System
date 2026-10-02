import { useNavigate } from "react-router-dom";
import { LogOut, Building2, GraduationCap, Hash, Lock, CalendarCheck, BookOpen } from "lucide-react";
import PublicLayout from "../../components/PublicLayout";
import { Alert, PageLoader } from "../../components/UI";
import useAsync from "../../hooks/useAsync";
import { api, studentAuth } from "../../services/api";
import { C } from "../../theme";

const MIN_ATTENDANCE = 75; // below this percentage the card turns red

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const colorFor = (pct) => (!isNum(pct) ? "#cbd5e1" : pct >= MIN_ATTENDANCE ? C.green : C.red);

function formatDate(value) {
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function Ring({ value }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const pct = isNum(value) ? Math.min(100, Math.max(0, value)) : 0;
  return (
    <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
      <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={isNum(value) ? `Overall attendance ${value} percent` : "No attendance recorded yet"}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={colorFor(value)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{isNum(value) ? `${value}%` : "—"}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Overall</div>
        </div>
      </div>
    </div>
  );
}

function StudentDashboard() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(() => api.getMyAttendance(), []);

  const logout = () => {
    studentAuth.clear();
    navigate("/", { replace: true });
  };

  const student = data?.student;
  const overall = data?.overall;
  const subjects = data?.subjects || [];
  const recent = data?.recent || [];

  return (
    <PublicLayout>
      <div className="ae-container" style={{ padding: "clamp(24px, 5vw, 48px) clamp(16px, 5vw, 32px)", display: "grid", gap: 24 }}>
        {loading && !data && <PageLoader label="Loading your attendance..." />}

        {error && (
          <Alert type="error" title="Could not load your attendance" onRetry={reload}>
            {error}
          </Alert>
        )}

        {student && overall && (
          <>
            <section aria-labelledby="me-title" className="ae-card" style={{ padding: "clamp(20px, 4vw, 32px)", boxShadow: "0 20px 50px rgba(15,23,42,.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: `linear-gradient(135deg, ${C.indigo}, #3b82f6)`,
                      color: "#fff",
                      fontSize: 24,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {student.fullName.trim().charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.muted }}>Welcome back</p>
                    <h1 id="me-title" style={{ margin: "2px 0 0", fontSize: "clamp(24px, 4vw, 32px)", overflowWrap: "anywhere" }}>
                      {student.fullName}
                    </h1>
                  </div>
                </div>
                <button type="button" className="ae-btn ae-btn-secondary ae-btn-sm" onClick={logout}>
                  <LogOut size={16} aria-hidden="true" /> Logout
                </button>
              </div>

              <ul className="ae-grid-auto" style={{ listStyle: "none", margin: "24px 0 0", padding: 0 }}>
                {[
                  { icon: Hash, label: "Roll number", value: student.rollNumber },
                  { icon: GraduationCap, label: "Class", value: student.classCode },
                  { icon: Building2, label: "Department", value: student.departmentName },
                ].map(({ icon: Icon, label, value }) => (
                  <li key={label} style={{ display: "flex", gap: 12, alignItems: "center", padding: 14, background: C.bg, borderRadius: 14, border: `1px solid ${C.border}` }}>
                    <span style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", background: C.indigoSoft, color: C.indigo, flexShrink: 0 }}>
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "0.06em" }}>{label.toUpperCase()}</p>
                      <p style={{ margin: "2px 0 0", fontWeight: 700, overflowWrap: "anywhere" }}>{value}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <p style={{ margin: "16px 0 0", display: "flex", gap: 8, alignItems: "center", color: C.muted, fontSize: 13 }}>
                <Lock size={14} aria-hidden="true" />
                Your class is set by the administrator. To change it, please contact your admin.
              </p>
            </section>

            <section aria-labelledby="overall-title" className="ae-card" style={{ padding: "clamp(20px, 4vw, 32px)", display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap", border: overall.percentage < MIN_ATTENDANCE ? `2px solid ${C.red}` : `1px solid ${C.border}` }}>
              <Ring value={overall.percentage} />
              <div style={{ flex: 1, minWidth: 220 }}>
                <h2 id="overall-title" style={{ margin: 0, fontSize: 22 }}>Your overall attendance</h2>
                {overall.total > 0 ? (
                  <>
                    <p style={{ margin: "8px 0 0", color: C.muted, lineHeight: 1.6 }}>
                      You were present in <strong style={{ color: C.navy }}>{overall.present}</strong> of{" "}
                      <strong style={{ color: C.navy }}>{overall.total}</strong> recorded lectures.
                    </p>
                    {overall.percentage < MIN_ATTENDANCE && (
                      <p style={{ margin: "10px 0 0", color: C.red, fontWeight: 600 }}>
                        Your attendance is below {MIN_ATTENDANCE}%. Try not to miss upcoming lectures.
                      </p>
                    )}
                  </>
                ) : (
                  <p style={{ margin: "8px 0 0", color: C.muted, lineHeight: 1.6 }}>
                    No lectures have been recorded for you yet. Your attendance will appear here once your teachers start marking it.
                  </p>
                )}
              </div>
            </section>

            <section aria-labelledby="subjects-title">
              <h2 id="subjects-title" style={{ margin: "0 0 16px", fontSize: 22 }}>Subject-wise attendance</h2>
              {subjects.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", background: "#fff", border: `1px dashed ${C.border}`, borderRadius: 16 }}>
                  <BookOpen size={32} color={C.muted} style={{ margin: "0 auto 12px" }} />
                  <h3 style={{ margin: "0 0 8px" }}>No subjects yet</h3>
                  <p style={{ margin: 0, color: C.muted }}>Subjects for your class have not been added yet.</p>
                </div>
              ) : (
                <ul className="ae-grid-auto" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {subjects.map((s) => (
                    <li key={s.id} className="ae-card" style={{ padding: 20, display: "grid", gap: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                        <h3 style={{ margin: 0, fontSize: 17, overflowWrap: "anywhere" }}>{s.name}</h3>
                        <strong style={{ fontSize: 22, color: colorFor(s.percentage) }}>{isNum(s.percentage) ? `${s.percentage}%` : "—"}</strong>
                      </div>
                      <div aria-hidden="true" style={{ height: 8, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ width: `${isNum(s.percentage) ? Math.min(100, s.percentage) : 0}%`, height: "100%", background: colorFor(s.percentage) }} />
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: C.muted }}>
                        {s.total > 0 ? `Present in ${s.present} of ${s.total} lectures` : "No lectures recorded yet"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="recent-title" className="ae-card" style={{ padding: "clamp(20px, 4vw, 28px)" }}>
              <h2 id="recent-title" style={{ margin: "0 0 12px", fontSize: 20, display: "flex", gap: 8, alignItems: "center" }}>
                <CalendarCheck size={20} color={C.indigo} aria-hidden="true" /> Recent attendance
              </h2>
              {recent.length === 0 ? (
                <p style={{ margin: 0, color: C.muted }}>Nothing recorded yet.</p>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {recent.map((r, i) => (
                    <li key={`${r.date}-${r.subjectName}-${i}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i === recent.length - 1 ? "none" : `1px solid ${C.border}` }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, overflowWrap: "anywhere" }}>{r.subjectName}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 13, color: C.muted }}>{formatDate(r.date)}</p>
                      </div>
                      <span
                        style={{
                          minWidth: 44,
                          textAlign: "center",
                          padding: "6px 12px",
                          borderRadius: 10,
                          fontWeight: 800,
                          background: r.present ? C.greenSoft : C.redSoft,
                          color: r.present ? "#065f46" : "#991b1b",
                        }}
                      >
                        <span aria-hidden="true">{r.present ? "P" : "A"}</span>
                        <span className="ae-visually-hidden">{r.present ? "Present" : "Absent"}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </PublicLayout>
  );
}

export default StudentDashboard;