import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import PublicLayout from "../../components/PublicLayout";
import { Alert, Spinner } from "../../components/UI";
import { api, auth } from "../../services/api";
import { C } from "../../theme";

function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (auth.isLoggedIn()) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitError("");

    if (password.trim() === "") {
      setFieldError("Please enter your password.");
      document.getElementById("admin-password")?.focus();
      return;
    }
    setFieldError("");

    setSubmitting(true);
    try {
      const res = await api.adminLogin(password);
      if (!res || !res.token) throw new Error("Login failed. Please try again.");
      auth.setToken(res.token);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setPassword("");
      setSubmitError(err.status === 401 ? "Incorrect password. Please try again." : err.message);
      setSubmitting(false);
      document.getElementById("admin-password")?.focus();
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
            <ShieldCheck size={26} aria-hidden="true" />
          </span>
          <h1 id="login-title" style={{ margin: "18px 0 8px", fontSize: 28 }}>Admin Portal</h1>
          <p style={{ margin: "0 0 24px", color: C.muted, lineHeight: 1.6 }}>
            Secure access for authorised staff to manage student requests, records and attendance reports.
          </p>

          <form onSubmit={handleSubmit} noValidate aria-label="Admin login" style={{ display: "grid", gap: 20 }}>
            {submitError && <Alert type="error">{submitError}</Alert>}

            <div>
              <label htmlFor="admin-password" className="ae-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="ae-input"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldError) setFieldError("");
                  }}
                  aria-required="true"
                  aria-invalid={Boolean(fieldError)}
                  aria-describedby={fieldError ? "password-error" : undefined}
                  placeholder="Enter your password"
                  style={{ paddingRight: 52 }}
                />
                <button
                  type="button"
                  className="ae-btn ae-btn-ghost"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, padding: 0, color: C.muted }}
                >
                  {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                </button>
              </div>
              {fieldError && (
                <p id="password-error" role="alert" className="ae-error">
                  <AlertCircle size={14} aria-hidden="true" /> {fieldError}
                </p>
              )}
            </div>

            <button type="submit" className="ae-btn ae-btn-primary ae-btn-lg ae-btn-block" disabled={submitting} aria-busy={submitting}>
              {submitting ? <Spinner size={18} /> : <LogIn size={18} aria-hidden="true" />}
              {submitting ? "Signing in..." : "Login"}
            </button>
          </form>
        </section>
      </div>
    </PublicLayout>
  );
}

export default AdminLogin;