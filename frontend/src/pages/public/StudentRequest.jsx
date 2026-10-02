import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Building2, GraduationCap, AlertCircle, Send, CheckCircle2 } from "lucide-react";
import PublicLayout from "../../components/PublicLayout";
import Stepper from "../../components/Stepper";
import { Alert, Spinner } from "../../components/UI";
import { api } from "../../services/api";
import { C } from "../../theme";

function validate({ fullName, rollNumber, mobile }) {
  const errors = {};
  if (!fullName) errors.fullName = "Please enter your full name.";
  if (!rollNumber) errors.rollNumber = "Please enter your roll number.";
  if (!mobile) errors.mobile = "Please enter your mobile number.";
  else if (!/^[6-9]\d{9}$/.test(mobile))
    errors.mobile = "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.";
  return errors;
}

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="ae-error">
      <AlertCircle size={14} aria-hidden="true" /> {message}
    </p>
  );
}

function StudentRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const department = location.state?.department ?? null;
  const classItem = location.state?.classItem ?? null;

  const [values, setValues] = useState({ fullName: "", rollNumber: "", mobile: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(null);

  if (!department || !classItem) {
    return (
      <PublicLayout>
        <div className="ae-container" style={{ maxWidth: 560, padding: "clamp(40px, 8vw, 88px) 16px" }}>
          <div className="ae-card" style={{ padding: 32, textAlign: "center", boxShadow: "0 20px 50px rgba(15,23,42,.08)" }}>
            <span style={{ width: 56, height: 56, borderRadius: 16, display: "inline-grid", placeItems: "center", background: C.indigoSoft, color: C.indigo }}>
              <AlertCircle size={28} aria-hidden="true" />
            </span>
            <h1 style={{ margin: "16px 0 8px", fontSize: 26 }}>Your selections are missing</h1>
            <p style={{ margin: "0 0 24px", color: C.muted, lineHeight: 1.6 }}>
              Please choose your department and class first. This can happen if you opened this page directly or
              refreshed it.
            </p>
            <Link to="/departments" className="ae-btn ae-btn-primary">
              Start from department
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const classLabel = classItem.fullName ? `${classItem.name} (${classItem.fullName})` : classItem.name;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
    if (submitError) setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const cleaned = {
      fullName: values.fullName.trim().replace(/\s+/g, " "),
      rollNumber: values.rollNumber.trim(),
      mobile: values.mobile.replace(/[\s-]/g, ""),
    };
    const found = validate(cleaned);
    setValues(cleaned);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = ["fullName", "rollNumber", "mobile"].find((k) => found[k]);
      document.getElementById(first)?.focus();
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      await api.submitRequest({
        ...cleaned,
        departmentId: department.id,
        classId: classItem.id,
      });
      setSubmitted(cleaned);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => navigate("/classes", { state: { department, classItem } });

  if (submitted) {
    return (
      <PublicLayout>
        <div className="ae-container" style={{ maxWidth: 640, padding: "clamp(28px, 6vw, 64px) clamp(16px, 5vw, 32px)" }}>
          <section
            role="status"
            className="ae-card"
            style={{ padding: "clamp(24px, 5vw, 40px)", textAlign: "center", boxShadow: "0 20px 50px rgba(15,23,42,.08)" }}
          >
            <span style={{ width: 64, height: 64, borderRadius: "50%", display: "inline-grid", placeItems: "center", background: C.greenSoft, color: C.green }}>
              <CheckCircle2 size={34} aria-hidden="true" />
            </span>
            <h1 style={{ margin: "18px 0 10px", fontSize: "clamp(24px, 4vw, 32px)" }}>Request submitted</h1>
            <p style={{ margin: "0 0 22px", color: C.muted, lineHeight: 1.7 }}>
              Thank you, {submitted.fullName}. Your request has been sent to the administrator for review. You
              will be able to view your attendance once it is approved.
            </p>
            <dl style={{ margin: "0 0 26px", display: "grid", gap: 10, padding: 16, background: C.bg, borderRadius: 14, border: `1px solid ${C.border}`, textAlign: "left" }}>
              {[
                ["Department", department.name],
                ["Class", classLabel],
                ["Roll number", submitted.rollNumber],
                ["Mobile number", submitted.mobile],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <dt style={{ color: C.muted, fontSize: 14 }}>{k}</dt>
                  <dd style={{ margin: 0, fontWeight: 600, overflowWrap: "anywhere" }}>{v}</dd>
                </div>
              ))}
            </dl>
            <Link to="/" className="ae-btn ae-btn-primary">
              Back to Home
            </Link>
          </section>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="ae-container" style={{ maxWidth: 720, padding: "clamp(28px, 6vw, 56px) clamp(16px, 5vw, 32px)" }}>
        <Stepper current={3} />

        <section aria-label="Your selections" className="ae-two" style={{ marginBottom: 28 }}>
          {[
            { icon: Building2, label: "Department", value: department.name },
            { icon: GraduationCap, label: "Class", value: classLabel },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="ae-card" style={{ display: "flex", alignItems: "center", gap: 12, padding: 16 }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, display: "grid", placeItems: "center", background: C.indigoSoft, color: C.indigo, flexShrink: 0 }}>
                <Icon size={20} aria-hidden="true" />
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "0.06em" }}>{label.toUpperCase()}</p>
                <p style={{ margin: "2px 0 0", fontWeight: 700, overflowWrap: "anywhere" }}>{value}</p>
              </div>
            </div>
          ))}
        </section>

        <h1 style={{ margin: 0, fontSize: "clamp(28px, 5vw, 40px)" }}>Enter your details</h1>
        <p style={{ margin: "10px 0 24px", color: C.muted, fontSize: 17, lineHeight: 1.6 }}>
          Fill in your student information to request access.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Student registration request"
          className="ae-card"
          style={{ padding: "clamp(20px, 5vw, 32px)", display: "grid", gap: 20, boxShadow: "0 20px 50px rgba(15,23,42,.08)" }}
        >
          {submitError && (
            <Alert type="error" title="Could not submit your request">
              {submitError}
            </Alert>
          )}

          <div>
            <label htmlFor="fullName" className="ae-label">Full name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              className="ae-input"
              value={values.fullName}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              placeholder="Enter your full name"
            />
            <FieldError id="fullName-error" message={errors.fullName} />
          </div>

          <div>
            <label htmlFor="rollNumber" className="ae-label">Roll number</label>
            <input
              id="rollNumber"
              name="rollNumber"
              type="text"
              autoComplete="off"
              className="ae-input"
              value={values.rollNumber}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={Boolean(errors.rollNumber)}
              aria-describedby={errors.rollNumber ? "rollNumber-error" : "rollNumber-hint"}
              placeholder="Enter your roll number"
            />
            <p id="rollNumber-hint" className="ae-hint">Your roll number is your primary identifier.</p>
            <FieldError id="rollNumber-error" message={errors.rollNumber} />
          </div>

          <div>
            <label htmlFor="mobile" className="ae-label">Mobile number</label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={14}
              className="ae-input"
              value={values.mobile}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={Boolean(errors.mobile)}
              aria-describedby={errors.mobile ? "mobile-error" : "mobile-hint"}
              placeholder="10-digit mobile number"
            />
            <p id="mobile-hint" className="ae-hint">Used for contact. Enter 10 digits without country code.</p>
            <FieldError id="mobile-error" message={errors.mobile} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
            <button type="button" className="ae-btn ae-btn-secondary" onClick={goBack} disabled={submitting}>
              <ArrowLeft size={18} aria-hidden="true" />
              Back
            </button>
            <button type="submit" className="ae-btn ae-btn-primary" disabled={submitting} aria-busy={submitting}>
              {submitting ? <Spinner size={18} /> : <Send size={18} aria-hidden="true" />}
              {submitting ? "Submitting..." : "Submit request"}
            </button>
          </div>
        </form>
      </div>
    </PublicLayout>
  );
}

export default StudentRequest;