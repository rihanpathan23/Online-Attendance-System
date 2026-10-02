import { Link } from "react-router-dom";
import {
  CalendarCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  Clock,
  XCircle,
} from "lucide-react";
import { C } from "../theme";

export function Logo({ light = false, to = "/" }) {
  return (
    <Link
      to={to}
      className="ae-link"
      aria-label="AttendEase home"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
        color: light ? "#fff" : C.navy,
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

export function Spinner({ size = 20 }) {
  return <Loader2 size={size} className="ae-spin" aria-hidden="true" />;
}

export function PageLoader({ label = "Loading..." }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "56px 16px",
        color: C.muted,
        fontWeight: 600,
      }}
    >
      <Spinner size={22} />
      {label}
    </div>
  );
}

const ALERT_STYLES = {
  error: { bg: C.redSoft, border: "#fecaca", color: "#991b1b", icon: AlertCircle },
  success: { bg: C.greenSoft, border: "#a7f3d0", color: "#065f46", icon: CheckCircle2 },
  info: { bg: C.indigoSoft, border: "#c7d2fe", color: "#3730a3", icon: Info },
};

export function Alert({ type = "info", title, children, onRetry }) {
  const s = ALERT_STYLES[type];
  const Icon = s.icon;
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: 14,
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 14,
        color: s.color,
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      <Icon size={20} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <strong style={{ display: "block", marginBottom: 2 }}>{title}</strong>}
        <div>{children}</div>
        {onRetry && (
          <button
            type="button"
            className="ae-btn ae-btn-secondary ae-btn-sm"
            onClick={onRetry}
            style={{ marginTop: 10 }}
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 20px",
        background: "#fff",
        border: "1.5px dashed #cbd5e1",
        borderRadius: 20,
      }}
    >
      {Icon && (
        <span
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            display: "inline-grid",
            placeItems: "center",
            background: C.indigoSoft,
            color: C.indigo,
          }}
        >
          <Icon size={28} aria-hidden="true" />
        </span>
      )}
      <h2 style={{ margin: "14px 0 6px", fontSize: 20 }}>{title}</h2>
      {children && (
        <p style={{ margin: "0 auto", color: C.muted, maxWidth: 420 }}>{children}</p>
      )}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}

const STATUS = {
  Pending: { bg: C.amberSoft, color: "#92400e", icon: Clock },
  Approved: { bg: C.greenSoft, color: "#065f46", icon: CheckCircle2 },
  Rejected: { bg: C.redSoft, color: "#991b1b", icon: XCircle },
};

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.Pending;
  const Icon = s.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        background: s.bg,
        color: s.color,
        fontWeight: 700,
        fontSize: 13,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={14} aria-hidden="true" />
      {status || "Pending"}
    </span>
  );
}