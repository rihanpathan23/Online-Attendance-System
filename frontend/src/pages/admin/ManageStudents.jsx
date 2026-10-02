import { useState, useMemo } from "react";
import { Search, Trash2, Users } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import ConfirmModal from "../../components/ConfirmModal";
import { Alert, EmptyState, PageLoader } from "../../components/UI";
import useAsync from "../../hooks/useAsync";
import { api } from "../../services/api";
import { C } from "../../theme";

export default function ManageStudents() {
  const classesQ = useAsync(() => api.getAdminClasses(), []);
  const [classId, setClassId] = useState("");
  const [query, setQuery] = useState("");
  
  const studentsQ = useAsync(async () => {
    if (!classId) return [];
    return await api.getStudents(classId);
  }, [classId]);

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");

  const classes = Array.isArray(classesQ.data) ? classesQ.data : [];
  const students = Array.isArray(studentsQ.data) ? studentsQ.data : [];

  const visibleStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(s => s.fullName.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q));
  }, [students, query]);

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await api.deleteStudent(toDelete.id);
      setNotice(`${toDelete.fullName} has been deleted permanently.`);
      setToDelete(null);
      studentsQ.reload();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="Manage Students"
      subtitle="Select a class to view its students and remove them if needed."
    >
      <div aria-live="polite">{notice && <Alert type="success">{notice}</Alert>}</div>

      {classesQ.loading && !classesQ.data && <PageLoader label="Loading classes..." />}
      
      {classesQ.error && <Alert type="error" onRetry={classesQ.reload}>{classesQ.error}</Alert>}

      {!classesQ.loading && classes.length > 0 && (
        <div className="ae-card" style={{ padding: 20, marginBottom: 24, boxShadow: "0 4px 14px rgba(15,23,42,.05)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <div>
              <label htmlFor="class-select" className="ae-label" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Select Class</label>
              <select
                id="class-select"
                className="ae-input"
                style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px solid ${C.border}` }}
                value={classId}
                onChange={(e) => { setClassId(e.target.value); setQuery(""); setNotice(""); }}
              >
                <option value="">-- Choose a class --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.code} ({c.departmentName})</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="student-search" className="ae-label" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Search Student</label>
              <div style={{ position: "relative" }}>
                <Search size={18} color={C.muted} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  id="student-search"
                  type="search"
                  className="ae-input"
                  style={{ width: "100%", padding: "12px 12px 12px 42px", borderRadius: 12, border: `1px solid ${C.border}` }}
                  placeholder="Search by name or roll no"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={!classId}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {classId && studentsQ.loading && !studentsQ.data && <PageLoader label="Loading students..." />}
      {classId && studentsQ.error && <Alert type="error" onRetry={studentsQ.reload}>{studentsQ.error}</Alert>}

      {classId && !studentsQ.loading && students.length === 0 && (
         <EmptyState icon={Users} title="No students found">
           There are no approved students in this class yet.
         </EmptyState>
      )}

      {classId && !studentsQ.loading && students.length > 0 && (
        <div className="ae-table-wrap ae-card" style={{ overflowX: "auto", boxShadow: "0 4px 14px rgba(15,23,42,.05)" }}>
          <table className="ae-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                <th style={{ padding: "14px 16px", color: C.muted, fontWeight: 600, fontSize: 13 }}>ROLL NO</th>
                <th style={{ padding: "14px 16px", color: C.muted, fontWeight: 600, fontSize: 13 }}>STUDENT NAME</th>
                <th style={{ padding: "14px 16px", color: C.muted, fontWeight: 600, fontSize: 13 }}>MOBILE NO</th>
                <th style={{ padding: "14px 16px", color: C.muted, fontWeight: 600, fontSize: 13 }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map(s => (
                <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "14px 16px", fontWeight: 700 }}>{s.rollNumber}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 700 }}>{s.fullName}</td>
                  <td style={{ padding: "14px 16px", color: C.muted }}>{s.mobile}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      type="button"
                      className="ae-btn ae-btn-danger"
                      onClick={() => { setDeleteError(""); setToDelete(s); }}
                      style={{ padding: "6px 12px", fontSize: 13, background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, cursor: "pointer" }}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {visibleStudents.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: 32, textAlign: "center", color: C.muted }}>No matching students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {toDelete && (
        <ConfirmModal
          title={`Delete ${toDelete.fullName}?`}
          confirmLabel="Yes, delete student"
          busyLabel="Deleting..."
          busy={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        >
          Are you sure you want to remove <strong style={{ color: C.navy }}>{toDelete.fullName}</strong> (Roll: {toDelete.rollNumber}) from this class? Their attendance records will also be permanently deleted. This cannot be undone.
        </ConfirmModal>
      )}
    </AdminLayout>
  );
}