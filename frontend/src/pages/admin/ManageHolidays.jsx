import { useState } from "react";
import { CalendarX, Plus, Trash2 } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { Alert, PageLoader, Spinner, EmptyState } from "../../components/UI";
import useAsync from "../../hooks/useAsync";
import { api } from "../../services/api";
import { C } from "../../theme";

export default function ManageHolidays() {
  const { data, loading, error, reload } = useAsync(() => api.getOffDays(), []);
  const offDays = Array.isArray(data) ? data : [];

  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const add = async (e) => {
    e.preventDefault();
    if (adding) return;
    if (!date) {
      setAddError("Please select a date.");
      return;
    }
    const d = new Date(date);
    if (d.getDay() === 0) {
      setAddError("Sundays are already off days by default.");
      return;
    }
    setAdding(true);
    setAddError("");
    try {
      await api.addOffDay(date, reason.trim() || "Holiday");
      setDate("");
      setReason("");
      reload();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const remove = async (targetDate) => {
    if (!window.confirm("Remove this off day? Attendance can be marked on this date again.")) return;
    try {
      await api.deleteOffDay(targetDate);
      reload();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout
      title="Manage Off Days"
      subtitle="Mark holidays or non-working days. Attendance cannot be recorded on these dates."
    >
      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", alignItems: "start" }}>
        <section className="ae-card" style={{ padding: 24 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 20 }}>Add a Holiday</h2>
          <form onSubmit={add} noValidate style={{ display: "grid", gap: 14 }}>
            {addError && <Alert type="error">{addError}</Alert>}
            <div>
              <label className="ae-label">Date</label>
              <input type="date" className="ae-input" value={date} onChange={(e) => { setDate(e.target.value); setAddError(""); }} />
            </div>
            <div>
              <label className="ae-label">Reason / Festival Name</label>
              <input type="text" className="ae-input" placeholder="e.g. Diwali, Eid, College Fest" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <button type="submit" className="ae-btn ae-btn-primary" disabled={adding}>
              {adding ? <Spinner size={16} /> : <Plus size={16} />} Add Off Day
            </button>
          </form>
        </section>

        <section className="ae-card" style={{ padding: 24 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 20 }}>Upcoming & Past Holidays</h2>
          {loading && !data && <PageLoader label="Loading off days..." />}
          {error && <Alert type="error" onRetry={reload}>{error}</Alert>}
          {!loading && offDays.length === 0 && (
            <EmptyState icon={CalendarX} title="No off days marked">
              All non-Sunday dates are open for attendance.
            </EmptyState>
          )}
          {offDays.length > 0 && (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {offDays.map((o, i) => (
                <li key={o.date} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i === offDays.length - 1 ? "none" : `1px solid ${C.border}` }}>
                  <div>
                    <strong style={{ display: "block", fontSize: 16 }}>{o.reason}</strong>
                    <span style={{ color: C.muted, fontSize: 14 }}>{o.date}</span>
                  </div>
                  <button type="button" className="ae-btn ae-btn-danger ae-btn-sm" onClick={() => remove(o.date)}>
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}