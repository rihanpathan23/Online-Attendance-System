import { useState, useMemo } from "react";
import { Search, Check, X, Inbox, AlertCircle } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import Modal from "../../components/Modal";
import { Alert, EmptyState, PageLoader, Spinner, StatusBadge } from "../../components/UI";
import useAsync from "../../hooks/useAsync";
import { api } from "../../services/api";
import { C } from "../../theme";

const FILTERS = ["All", "Pending", "Approved", "Rejected"];

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ActionButtons({ request, onAction }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button
        type="button"
        className="ae-btn ae-btn-success ae-btn-sm"
        disabled={request.status === "Approved"}
        onClick={() => onAction(request, "Approved")}
        aria-label={`Approve request from ${request.fullName}`}
      >
        <Check size={14} aria-hidden="true" /> Approve
      </button>
      <button
        type="button"
        className="ae-btn ae-btn-danger ae-btn-sm"
        disabled={request.status === "Rejected"}
        onClick={() => onAction(request, "Rejected")}
        aria-label={`Reject request from ${request.fullName}`}
      >
        <X size={14} aria-hidden="true" /> Reject
      </button>
    </div>
  );
}

function ConfirmModal({ request, action, busy, error, onConfirm, onCancel }) {
  const isApprove = action === "Approved";
  return (
    <Modal titleId="confirm-title" onClose={busy ? () => {} : onCancel} role="alertdialog" maxWidth={440}>
      <h2 id="confirm-title" style={{ margin: "0 0 10px", fontSize: 20 }}>
        {isApprove ? "Approve" : "Reject"} this request?
      </h2>
      <p style={{ margin: "0 0 18px", color: C.muted, lineHeight: 1.6 }}>
        You are about to mark <strong style={{ color: C.navy }}>{request.fullName}</strong> ({request.rollNumber}) as{" "}
        <strong style={{ color: C.navy }}>{action}</strong>.
      </p>
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
          className={`ae-btn ${isApprove ? "ae-btn-success-solid" : "ae-btn-danger-solid"}`}
          onClick={onConfirm}
          disabled={busy}
          aria-busy={busy}
        >
          {busy && <Spinner size={16} />}
          {busy ? "Saving..." : `Yes, ${isApprove ? "approve" : "reject"}`}
        </button>
      </div>
    </Modal>
  );
}

function ManageRequests() {
  const { data, loading, error, reload, setData } = useAsync(() => api.getRequests(), []);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const requests = useMemo(
    () =>
      [...(Array.isArray(data) ? data : [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    [data]
  );

  const counts = useMemo(() => {
    const c = { All: requests.length, Pending: 0, Approved: 0, Rejected: 0 };
    requests.forEach((r) => {
      if (c[r.status] !== undefined) c[r.status] += 1;
    });
    return c;
  }, [requests]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((r) => {
      const okStatus = statusFilter === "All" || r.status === statusFilter;
      const okQuery =
        !q ||
        String(r.fullName || "").toLowerCase().includes(q) ||
        String(r.rollNumber || "").toLowerCase().includes(q);
      return okStatus && okQuery;
    });
  }, [requests, query, statusFilter]);

  const openConfirm = (request, action) => {
    setActionError("");
    setPending({ request, action });
  };

  const confirm = async () => {
    const { request, action } = pending;
    setBusy(true);
    setActionError("");
    try {
      await api.updateRequestStatus(request.id, action);
      setData((list) => (list || []).map((r) => (r.id === request.id ? { ...r, status: action } : r)));
      setNotice(`${request.fullName}'s request was ${action.toLowerCase()}.`);
      setPending(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout
      title="Student Registration Requests"
      subtitle="Review student requests, then approve or reject them. Search or filter to find a request quickly."
    >
      {loading && <PageLoader label="Loading requests..." />}

      {error && (
        <Alert type="error" title="Could not load requests" onRetry={reload}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          <div aria-live="polite">{notice && <Alert type="success">{notice}</Alert>}</div>

          <section aria-label="Search and filter" className="ae-card" style={{ padding: 20, display: "grid", gap: 16 }}>
            <div>
              <label htmlFor="req-search" className="ae-label">Search by name or roll number</label>
              <div style={{ position: "relative" }}>
                <Search size={18} color={C.muted} aria-hidden="true" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  id="req-search"
                  type="search"
                  className="ae-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a name or roll number"
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>
            <div role="group" aria-label="Filter by status" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {FILTERS.map((f) => {
                const active = statusFilter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={active}
                    className={`ae-btn ae-btn-sm ${active ? "ae-btn-primary" : "ae-btn-secondary"}`}
                    onClick={() => setStatusFilter(f)}
                  >
                    {f}
                    <span style={{ opacity: 0.85, fontWeight: 700 }}>({counts[f]})</span>
                  </button>
                );
              })}
            </div>
          </section>

          {requests.length === 0 ? (
            <EmptyState icon={Inbox} title="No requests yet">
              When students submit registration requests, they will appear here for review.
            </EmptyState>
          ) : visible.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matching requests"
              action={
                <button type="button" className="ae-btn ae-btn-primary" onClick={() => { setQuery(""); setStatusFilter("All"); }}>
                  Clear search and filters
                </button>
              }
            >
              Try a different name, roll number or status.
            </EmptyState>
          ) : (
            <>
              <p style={{ margin: 0, color: C.muted, fontSize: 14 }} aria-live="polite">
                Showing {visible.length} of {requests.length} requests
              </p>

              <div className="ae-card ae-table-wrap">
                <table className="ae-table">
                  <caption className="ae-visually-hidden">Student registration requests</caption>
                  <thead>
                    <tr>
                      {["STUDENT NAME", "ROLL NUMBER", "MOBILE NUMBER", "DEPARTMENT", "CLASS", "REQUEST DATE", "STATUS", "ACTIONS"].map((h) => (
                        <th key={h} scope="col">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 700 }}>{r.fullName}</td>
                        <td>{r.rollNumber}</td>
                        <td>{r.mobile}</td>
                        <td>{r.departmentName}</td>
                        <td>{r.className}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{formatDate(r.createdAt)}</td>
                        <td><StatusBadge status={r.status} /></td>
                        <td><ActionButtons request={r} onAction={openConfirm} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="ae-cards" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {visible.map((r) => (
                  <li key={r.id} className="ae-card" style={{ padding: 18, display: "grid", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                      <strong style={{ fontSize: 17 }}>{r.fullName}</strong>
                      <StatusBadge status={r.status} />
                    </div>
                    <dl style={{ margin: 0, display: "grid", gap: 6, fontSize: 14 }}>
                      {[
                        ["Roll number", r.rollNumber],
                        ["Mobile", r.mobile],
                        ["Department", r.departmentName],
                        ["Class", r.className],
                        ["Requested", formatDate(r.createdAt)],
                      ].map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <dt style={{ color: C.muted }}>{k}</dt>
                          <dd style={{ margin: 0, fontWeight: 600, textAlign: "right", overflowWrap: "anywhere" }}>{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <ActionButtons request={r} onAction={openConfirm} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {pending && (
        <ConfirmModal
          request={pending.request}
          action={pending.action}
          busy={busy}
          error={actionError}
          onConfirm={confirm}
          onCancel={() => setPending(null)}
        />
      )}
    </AdminLayout>
  );
}

export default ManageRequests;