import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { GraduationCap, LogIn, AlertCircle, Eye, EyeOff, Lock, X } from "lucide-react";
import PublicLayout from "../../components/PublicLayout";
import Modal from "../../components/Modal";
import { Alert, Spinner } from "../../components/UI";
import { api, studentAuth } from "../../services/api";
import { C } from "../../theme";

// Component for Forgot Password Modal
function ForgotPasswordModal({ onClose }) {
  const [form, setForm] = useState({ rollNumber: "", mobile: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
    if (apiError) setApiError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const cleaned = {
      rollNumber: form.rollNumber.trim(),
      mobile: form.mobile.replace(/[\s-]/g, ""),
    };
    const found = {};
    if (!cleaned.rollNumber) found.rollNumber = "Please enter your roll number.";
    if (!cleaned.mobile) found.mobile = "Please enter your registered mobile number.";
    else if (!/^[6-9]\d{9}$/.test(cleaned.mobile)) found.mobile = "Enter a valid 10-digit Indian mobile number.";

    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setApiError("");
    try {
      const res = await api.submitForgotPassword(cleaned.rollNumber, cleaned.mobile);
      setApiSuccess(res.message || "Request sent successfully!");
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal titleId="forgot-pass-title" onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 id="forgot-pass-title" style={{ margin: 0, fontSize: 22 }}>Reset Password</h2>
        <button type="button" className="ae-btn ae-btn-ghost" onClick={onClose} disabled={submitting} style={{ width: 38, height: 38, padding: 0, color: C.muted }}>
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {apiSuccess ? (
        <Alert type="success">{apiSuccess}</Alert>
      ) : (
        <>
          <p style={{ margin: "0 0 16px", color: C.muted, lineHeight: 1.6 }}>
            Enter your Roll Number and Mobile Number. A password reset request will be sent to your Admin. Once approved, your password will be reset to your Roll Number.
          </p>
          <form onSubmit={submit} noValidate style={{ display: "grid", gap: 16 }}>
            {apiError && <Alert type="error">{apiError}</Alert>}
            <div>
              <label htmlFor="fp-roll" className="ae-label">Roll number</label>
              <input id="fp-roll" name="rollNumber" type="text" className="ae-input" value={form.rollNumber} onChange={change} placeholder="Enter your roll number" />
              {errors.rollNumber && <p className="ae-error"><AlertCircle size={14} /> {errors.rollNumber}</p>}
            </div>
            <div>
              <label htmlFor="fp-mobile" className="ae-label">Registered Mobile number</label>
              <input id="fp-mobile" name="mobile" type="tel" maxLength={14} className="ae-input" value={form.mobile} onChange={change} placeholder="10-digit mobile number" />
              {errors.mobile && <p className="ae-error"><AlertCircle size={14} /> {errors.mobile}</p>}
            </div>
            <button type="submit" className="ae-btn ae-btn-primary" disabled={submitting}>
              {submitting ? <Spinner size={16} /> : <Lock size={16} />}
              {submitting ? "Sending Request..." : "Send Request to Admin"}
            </button>
          </form>
        </>
      )}
    </Modal>
  );
}

function StudentLogin() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ rollNumber: "", mobile: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  if (studentAuth.isLoggedIn()) return <Navigate to="/student/dashboard" replace />;

  const change = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
    if (submitError) setSubmitError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const cleaned = {
      rollNumber: values.rollNumber.trim(),
      mobile: values.mobile.replace(/[\s-]/g, ""),
      password: values.password.trim(),
    };
    const found = {};
    if (!cleaned.rollNumber) found.rollNumber = "Please enter your roll number.";
    if (!cleaned.mobile) found.mobile = "Please enter your mobile number.";
    else if (!/^[6-9]\d{9}$/.test(cleaned.mobile)) found.mobile = "Enter a valid 10-digit mobile number.";
    if (!cleaned.password) found.password = "Please enter your password.";

    setValues(cleaned);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(found.rollNumber ? "rollNumber" : found.mobile ? "mobile" : "password")?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.studentLogin(cleaned.rollNumber, cleaned.mobile, cleaned.password);
      if (!res || !res.token) throw new Error("Login failed. Please try again.");
      studentAuth.setToken(res.token);
      navigate("/student/dashboard", { replace: true });
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div
        style={{
          display: "grid",
          placeItems: "center",
          padding: "clamp(24px, 6vw, 72px) 16px",
          background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
          minHeight: "70vh",
        }}
      >
        <section
          aria-labelledby="login-title"
          className="ae-card"
          style={{ width: "100%", maxWidth: 440, padding: "clamp(24px, 6vw, 36px)", boxShadow: "0 20px 50px rgba(15,23,42,.1)" }}
        >
          <span style={{ width: 52, height: 52, borderRadius: 16, display: "grid", placeItems: "center", background: C.indigoSoft, color: C.indigo }}>
            <GraduationCap size={26} aria-hidden="true" />
          </span>
          <h1 id="login-title" style={{ margin: "18px 0 8px", fontSize: 28 }}>
            Student Login
          </h1>
          <p style={{ margin: "0 0 24px", color: C.muted, lineHeight: 1.6 }}>
            Use your roll number, mobile and password to see your attendance. <br />
            <span style={{ fontSize: 13 }}><i>(If added by admin directly, default password is your Roll Number)</i></span>
          </p>

          <form onSubmit={submit} noValidate aria-label="Student login" style={{ display: "grid", gap: 20 }}>
            {submitError && <Alert type="error">{submitError}</Alert>}

            <div>
              <label htmlFor="rollNumber" className="ae-label">Roll number</label>
              <input id="rollNumber" name="rollNumber" type="text" autoComplete="off" className="ae-input" value={values.rollNumber} onChange={change} placeholder="Enter your roll number" />
              {errors.rollNumber && <p id="rollNumber-error" role="alert" className="ae-error"><AlertCircle size={14} /> {errors.rollNumber}</p>}
            </div>

            <div>
              <label htmlFor="mobile" className="ae-label">Mobile number</label>
              <input id="mobile" name="mobile" type="tel" inputMode="numeric" maxLength={14} autoComplete="off" className="ae-input" value={values.mobile} onChange={change} placeholder="10-digit mobile number" />
              {errors.mobile && <p id="mobile-error" role="alert" className="ae-error"><AlertCircle size={14} /> {errors.mobile}</p>}
            </div>

            <div>
              <label htmlFor="password" className="ae-label">Password</label>
              <div style={{ position: "relative" }}>
                <input id="password" name="password" type={showPassword ? "text" : "password"} className="ae-input" value={values.password} onChange={change} placeholder="Enter your password" style={{ paddingRight: 48 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: C.muted, cursor: "pointer", padding: 8, display: "grid", placeItems: "center" }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p id="password-error" role="alert" className="ae-error"><AlertCircle size={14} /> {errors.password}</p>}
              
              <div style={{ textAlign: "right", marginTop: "6px" }}>
                 <button type="button" onClick={() => setShowForgotModal(true)} style={{ background: "none", border: "none", color: C.indigo, fontSize: 13, cursor: "pointer", padding: 0 }}>
                    Forgot password?
                 </button>
              </div>
            </div>

            <button type="submit" className="ae-btn ae-btn-primary ae-btn-lg ae-btn-block" disabled={submitting} aria-busy={submitting}>
              {submitting ? <Spinner size={18} /> : <LogIn size={18} aria-hidden="true" />}
              {submitting ? "Signing in..." : "Login"}
            </button>
          </form>
        </section>
      </div>
      {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}
    </PublicLayout>
  );
}

export default StudentLogin;