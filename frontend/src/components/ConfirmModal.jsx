import Modal from "./Modal";
import { Alert, Spinner } from "./UI";
import { C } from "../theme";

export default function ConfirmModal({
  title,
  children,
  confirmLabel = "Confirm",
  busyLabel = "Working...",
  busy = false,
  error = "",
  onConfirm,
  onCancel,
}) {
  return (
    <Modal titleId="confirm-title" onClose={busy ? () => {} : onCancel} role="alertdialog" maxWidth={440}>
      <h2 id="confirm-title" style={{ margin: "0 0 10px", fontSize: 20 }}>
        {title}
      </h2>
      <div style={{ margin: "0 0 18px", color: C.muted, lineHeight: 1.6 }}>{children}</div>
      {error && (
        <div style={{ marginBottom: 16 }}>
          <Alert type="error">{error}</Alert>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
        <button type="button" className="ae-btn ae-btn-secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button
          type="button"
          className="ae-btn ae-btn-danger-solid"
          onClick={onConfirm}
          disabled={busy}
          aria-busy={busy}
        >
          {busy && <Spinner size={16} />}
          {busy ? busyLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}