
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Building2, GraduationCap, AlertCircle } from "lucide-react";
import PublicLayout from "../../components/PublicLayout";
import Stepper from "../../components/Stepper";
import { Alert, EmptyState, PageLoader } from "../../components/UI";
import useAsync from "../../hooks/useAsync";
import { api } from "../../services/api";
import { C } from "../../theme";

function SelectClass() {
  const navigate = useNavigate();
  const location = useLocation();
  const department = location.state?.department ?? null;

  const { data, loading, error, reload } = useAsync(
    () => (department ? api.getClasses(department.id) : Promise.resolve([])),
    [department?.id]
  );
  const [selectedId, setSelectedId] = useState(location.state?.classItem?.id ?? null);

  if (!department) {
    return (
      <PublicLayout>
        <div className="ae-container" style={{ maxWidth: 560, padding: "clamp(40px, 8vw, 88px) 16px" }}>
          <div className="ae-card" style={{ padding: 32, textAlign: "center", boxShadow: "0 20px 50px rgba(15,23,42,.08)" }}>
            <span style={{ width: 56, height: 56, borderRadius: 16, display: "inline-grid", placeItems: "center", background: C.indigoSoft, color: C.indigo }}>
              <AlertCircle size={28} aria-hidden="true" />
            </span>
            <h1 style={{ margin: "16px 0 8px", fontSize: 26 }}>Let's start with your department</h1>
            <p style={{ margin: "0 0 24px", color: C.muted, lineHeight: 1.6 }}>
              We could not find your department selection. This can happen if you opened this page directly or
              refreshed it.
            </p>
            <Link to="/departments" className="ae-btn ae-btn-primary">
              Select department
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const classes = Array.isArray(data) ? data : [];
  const selected = classes.find((c) => String(c.id) === String(selectedId)) || null;

  const goBack = () => navigate("/departments", { state: { department } });

  const handleContinue = () => {
    if (!selected) return;
    navigate("/register", {
      state: { department, classItem: { id: selected.id, name: selected.name, fullName: selected.fullName } },
    });
  };

  return (
    <PublicLayout>
      <div className="ae-container" style={{ maxWidth: 920, padding: "clamp(28px, 6vw, 56px) clamp(16px, 5vw, 32px)" }}>
        <Stepper current={2} />

        <section
          aria-label="Selected department"
          className="ae-card"
          style={{ display: "flex", alignItems: "center", gap: 14, padding: 18, marginBottom: 28 }}
        >
          <span style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: C.indigoSoft, color: C.indigo, flexShrink: 0 }}>
            <Building2 size={22} aria-hidden="true" />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "0.06em" }}>
              SELECTED DEPARTMENT
            </p>
            <p style={{ margin: "2px 0 0", fontWeight: 700, fontSize: 17, overflowWrap: "anywhere" }}>{department.name}</p>
          </div>
          <button type="button" className="ae-btn ae-btn-ghost ae-btn-sm" onClick={goBack}>
            Change
          </button>
        </section>

        <h1 style={{ margin: 0, fontSize: "clamp(28px, 5vw, 40px)" }}>Select your class</h1>
        <p style={{ margin: "10px 0 28px", color: C.muted, fontSize: 17, lineHeight: 1.6 }}>
          Choose the year you are currently studying in.
        </p>

        {loading && <PageLoader label="Loading classes..." />}

        {error && (
          <Alert type="error" title="Could not load classes" onRetry={reload}>
            {error}
          </Alert>
        )}

        {!loading && !error && classes.length === 0 && (
          <EmptyState icon={GraduationCap} title="No classes available">
            No classes have been set up for this department yet. Please contact your college administrator.
          </EmptyState>
        )}

        {!loading && !error && classes.length > 0 && (
          <div role="group" aria-label="Classes" className="ae-grid-auto">
            {classes.map((c) => {
              const isSelected = String(c.id) === String(selectedId);
              return (
                <button
                  key={c.id}
                  type="button"
                  className="ae-choice"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(c.id)}
                >
                  <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 14,
                        display: "grid",
                        placeItems: "center",
                        background: isSelected ? C.indigo : C.indigoSoft,
                        color: isSelected ? "#fff" : C.indigo,
                      }}
                    >
                      <GraduationCap size={24} aria-hidden="true" />
                    </span>
                    <span
                      aria-hidden="true"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        border: `2px solid ${isSelected ? C.indigo : "#cbd5e1"}`,
                        background: isSelected ? C.indigo : "#fff",
                        color: "#fff",
                      }}
                    >
                      {isSelected && <Check size={14} />}
                    </span>
                  </span>
                  <span style={{ fontSize: 24, fontWeight: 800 }}>{c.name}</span>
                  {c.fullName && <span style={{ fontSize: 15, fontWeight: 600 }}>{c.fullName}</span>}
                  {c.description && (
                    <span style={{ fontSize: 14, color: C.muted, lineHeight: 1.5 }}>{c.description}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 32 }}>
          <button type="button" className="ae-btn ae-btn-secondary" onClick={goBack}>
            <ArrowLeft size={18} aria-hidden="true" />
            Back
          </button>
          <button type="button" className="ae-btn ae-btn-primary" onClick={handleContinue} disabled={!selected}>
            Continue
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </PublicLayout>
  );
}

export default SelectClass;