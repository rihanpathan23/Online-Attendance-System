import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Building2, Info } from "lucide-react";
import PublicLayout from "../../components/PublicLayout";
import Stepper from "../../components/Stepper";
import { Alert, EmptyState, PageLoader } from "../../components/UI";
import useAsync from "../../hooks/useAsync";
import { api } from "../../services/api";
import { C } from "../../theme";

function SelectDepartment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, loading, error, reload } = useAsync(() => api.getDepartments(), []);
  const [selectedId, setSelectedId] = useState(location.state?.department?.id ?? null);

  const departments = Array.isArray(data) ? data : [];
  const selected = departments.find((d) => String(d.id) === String(selectedId)) || null;

  const handleContinue = () => {
    if (!selected) return;
    navigate("/classes", { state: { department: { id: selected.id, name: selected.name } } });
  };

  return (
    <PublicLayout>
      <div className="ae-container" style={{ maxWidth: 920, padding: "clamp(28px, 6vw, 56px) clamp(16px, 5vw, 32px)" }}>
        <Stepper current={1} />

        <h1 style={{ margin: 0, fontSize: "clamp(28px, 5vw, 40px)" }}>Select your department</h1>
        <p style={{ margin: "10px 0 28px", color: C.muted, fontSize: 17, lineHeight: 1.6 }}>
          Choose the department you belong to. You will pick your class next.
        </p>

        {loading && <PageLoader label="Loading departments..." />}

        {error && (
          <Alert type="error" title="Could not load departments" onRetry={reload}>
            {error}
          </Alert>
        )}

        {!loading && !error && departments.length === 0 && (
          <EmptyState icon={Building2} title="No departments available">
            Departments have not been set up yet. Please contact your college administrator.
          </EmptyState>
        )}

        {!loading && !error && departments.length > 0 && (
          <>
            <div role="group" aria-label="Departments" className="ae-grid-auto">
              {departments.map((d) => {
                const isSelected = String(d.id) === String(selectedId);
                return (
                  <button
                    key={d.id}
                    type="button"
                    className="ae-choice"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedId(d.id)}
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
                        <Building2 size={24} aria-hidden="true" />
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
                    <span style={{ fontSize: 18, fontWeight: 700 }}>{d.name}</span>
                    {d.description && (
                      <span style={{ fontSize: 14, color: C.muted, lineHeight: 1.5 }}>{d.description}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                marginTop: 28,
                padding: 16,
                background: "#fff",
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                color: C.muted,
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              <Info size={18} color={C.indigo} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
              <p style={{ margin: 0 }}>
                Not sure which department to choose? Check your college ID or admission receipt, or ask your
                class coordinator.
              </p>
            </div>
          </>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 32 }}>
          <button type="button" className="ae-btn ae-btn-secondary" onClick={() => navigate("/")}>
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

export default SelectDepartment;