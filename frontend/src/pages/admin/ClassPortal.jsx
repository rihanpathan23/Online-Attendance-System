import { useState, useMemo, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ArrowLeft,
  Search,
  UserPlus,
  Trash2,
  FileDown,
  Users,
  BookOpen,
  ClipboardCheck,
  Plus,
  Save,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import Modal from "../../components/Modal";
import ConfirmModal from "../../components/ConfirmModal";
import { Alert, EmptyState, PageLoader, Spinner } from "../../components/UI";
import useAsync from "../../hooks/useAsync";
import { api } from "../../services/api";
import { C } from "../../theme";

const pad = (n) => String(n).padStart(2, "0");
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const byRoll = (a, b) =>
  String(a.rollNumber).localeCompare(String(b.rollNumber), undefined, { numeric: true });

const percentValue = (v) => {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? Math.round(n * 10) / 10 : null;
};

const formatDate = (iso) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

/* ---------------- Attendance tab ---------------- */

/* ---------------- Attendance tab ---------------- */

function AttendanceTab({ students, subjects, onOpenSubjects, onSaved }) {
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.getDay() === 0 ? "" : todayISO();
  });
  
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (subjects.length > 0 && !subjectId) {
      setSubjectId(String(subjects[0].id));
    }
  }, [subjects, subjectId]);

  // Safe Attendance Fetching (No Infinite Loop)
  useEffect(() => {
    if (!subjectId || !date) {
      setMarks({});
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError("");
    setResult(null);

    api.getAttendance(subjectId, date)
      .then((rows) => {
        if (cancelled) return;
        const m = {};
        if (Array.isArray(rows)) {
          rows.forEach((r) => {
            m[r.studentId] = Boolean(r.present);
          });
        }
        setMarks(m);
      })
      .catch((err) => {
        if (!cancelled) {
          setMarks({});
          setLoadError(err.message || "Failed to load attendance records.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [subjectId, date]);

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setDate("");
      setResult(null);
      return;
    }
    const d = new Date(val);
    if (d.getDay() === 0) {
      setResult({ type: "error", text: "Sundays are off days. Attendance cannot be marked." });
      setDate("");
      return;
    }
    setDate(val);
    setResult(null);
  };

  if (subjects.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Add a subject first"
        action={
          <button type="button" className="ae-btn ae-btn-primary" onClick={onOpenSubjects}>
            <Plus size={18} aria-hidden="true" /> Add subjects
          </button>
        }
      >
        Attendance is marked subject by subject, so this class needs at least one subject.
      </EmptyState>
    );
  }

  if (students.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No students in this class yet"
        action={
          <Link to="/admin/requests" className="ae-btn ae-btn-primary">
            Review student requests
          </Link>
        }
      >
        Approve student requests (or add students manually) to start marking attendance.
      </EmptyState>
    );
  }

  const setMark = (id, value) => {
    setMarks((m) => ({ ...m, [id]: value }));
    setResult(null);
  };

  const marked = students.filter((s) => marks[s.id] !== undefined).length;
  const presentCount = students.filter((s) => marks[s.id] === true).length;
  const absentCount = students.filter((s) => marks[s.id] === false).length;
  const allMarked = marked === students.length;
  const subjectName = subjects.find((s) => String(s.id) === subjectId)?.name ?? "";

  const save = async () => {
    setSaving(true);
    setResult(null);
    try {
      await api.saveAttendance({
        subjectId: Number(subjectId),
        date,
        records: students.map((s) => ({ studentId: s.id, present: marks[s.id] === true })),
      });
      setResult({ type: "success", text: `Attendance saved for ${subjectName} on ${formatDate(date)}.` });
      onSaved();
    } catch (err) {
      setResult({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleStyle = (selected, color, soft) => ({
    width: 46,
    height: 46,
    padding: 0,
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 16,
    background: selected ? color : "#fff",
    color: selected ? "#fff" : color,
    borderColor: selected ? color : soft,
  });

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section className="ae-card" style={{ padding: 20, display: "grid", gap: 16 }}>
        <div className="ae-two">
          <div>
            <label htmlFor="att-subject" className="ae-label">Subject</label>
            <select id="att-subject" className="ae-input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              {subjects.map((s) => (
                <option key={s.id} value={String(s.id)}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="att-date" className="ae-label">Date</label>
            <input id="att-date" type="date" className="ae-input" value={date} max={todayISO()} onChange={handleDateChange} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span aria-live="polite" style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>
            Present {presentCount} · Absent {absentCount} · Marked {marked}/{students.length}
          </span>
        </div>
      </section>

      {loadError && <Alert type="error" title="Could not load saved attendance">{loadError}</Alert>}

      {!date ? (
        <Alert type="info">Choose a valid working day to mark attendance.</Alert>
      ) : loading ? (
        <PageLoader label="Loading attendance..." />
      ) : (
        <section className="ae-card" aria-label={`Mark attendance for ${subjectName}`}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {students.map((s, i) => {
              const v = marks[s.id];
              return (
                <li
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 18px",
                    flexWrap: "wrap",
                    borderBottom: i === students.length - 1 ? "none" : `1px solid ${C.border}`,
                    background: v === false ? "#fffafa" : "transparent",
                  }}
                >
                  <span style={{ minWidth: 52, fontWeight: 800, color: C.muted }}>{s.rollNumber}</span>
                  <span style={{ flex: 1, minWidth: 140, fontWeight: 600, overflowWrap: "anywhere" }}>{s.fullName}</span>
                  <div role="group" aria-label={`Attendance for ${s.fullName}`} style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      className="ae-btn"
                      aria-pressed={v === true}
                      aria-label={`Mark ${s.fullName} present`}
                      onClick={() => setMark(s.id, true)}
                      style={toggleStyle(v === true, C.green, "#a7f3d0")}
                    >
                      P
                    </button>
                    <button
                      type="button"
                      className="ae-btn"
                      aria-pressed={v === false}
                      aria-label={`Mark ${s.fullName} absent`}
                      onClick={() => setMark(s.id, false)}
                      style={toggleStyle(v === false, C.red, "#fecaca")}
                    >
                      A
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {result && <Alert type={result.type}>{result.text}</Alert>}

      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" className="ae-btn ae-btn-primary ae-btn-lg" onClick={save} disabled={!allMarked || loading || saving || !date} aria-busy={saving}>
          {saving ? <Spinner size={18} /> : <Save size={18} aria-hidden="true" />}
          {saving ? "Saving..." : "Save Attendance"}
        </button>
        {!allMarked && <span style={{ fontSize: 13, color: C.muted }}>Mark every student as P or A to save.</span>}
      </div>
    </div>
  );
}
/* ---------------- Students tab ---------------- */

function AddStudentModal({ classId, existing, onClose, onAdded }) {
  const [form, setForm] = useState({ fullName: "", rollNumber: "", mobile: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
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
      fullName: form.fullName.trim().replace(/\s+/g, " "),
      rollNumber: form.rollNumber.trim(),
      mobile: form.mobile.replace(/[\s-]/g, ""),
    };

    const found = {};
    if (!cleaned.fullName) found.fullName = "Please enter the student's name.";
    if (!cleaned.rollNumber) found.rollNumber = "Please enter a roll number.";
    else if (existing.some((s) => String(s.rollNumber).toLowerCase() === cleaned.rollNumber.toLowerCase()))
      found.rollNumber = "This roll number already exists in this class.";
    
    if (cleaned.mobile && !/^[6-9]\d{9}$/.test(cleaned.mobile)) {
      found.mobile = "Enter a valid 10-digit Indian mobile number.";
    }

    setForm(cleaned);
    setErrors(found);

    if (Object.keys(found).length) {
      const first = ["fullName", "rollNumber", "mobile"].find((k) => found[k]);
      document.getElementById(`add-${first}`)?.focus();
      return;
    }

    setSubmitting(true);
    setApiError("");
    try {
      await api.addStudent({ ...cleaned, classId: Number(classId) });
      onAdded(cleaned.fullName);
    } catch (err) {
      setApiError(err.message);
      setSubmitting(false);
    }
  };

  const err = (key) =>
    errors[key] && (
      <p id={`add-${key}-error`} role="alert" className="ae-error">
        <AlertCircle size={14} aria-hidden="true" /> {errors[key]}
      </p>
    );

  return (
    <Modal titleId="add-student-title" onClose={submitting ? () => {} : onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 id="add-student-title" style={{ margin: 0, fontSize: 22 }}>Add Student</h2>
        <button type="button" className="ae-btn ae-btn-ghost" onClick={onClose} disabled={submitting} aria-label="Close" style={{ width: 38, height: 38, padding: 0, color: C.muted }}>
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <p style={{ margin: "0 0 16px", color: C.muted, fontSize: 14 }}>
        Mobile number is optional. Default password for manual add is the Roll Number.
      </p>
      <form onSubmit={submit} noValidate style={{ display: "grid", gap: 16 }}>
        {apiError && <Alert type="error">{apiError}</Alert>}
        <div>
          <label htmlFor="add-fullName" className="ae-label">Student name</label>
          <input id="add-fullName" name="fullName" className="ae-input" autoComplete="off" value={form.fullName} onChange={change} aria-required="true" />
          {err("fullName")}
        </div>
        <div className="ae-two">
          <div>
            <label htmlFor="add-rollNumber" className="ae-label">Roll number</label>
            <input id="add-rollNumber" name="rollNumber" className="ae-input" autoComplete="off" value={form.rollNumber} onChange={change} aria-required="true" />
            {err("rollNumber")}
          </div>
          <div>
            <label htmlFor="add-mobile" className="ae-label">Mobile number (Optional)</label>
            <input id="add-mobile" name="mobile" type="tel" inputMode="numeric" maxLength={14} className="ae-input" autoComplete="off" value={form.mobile} onChange={change} />
            {err("mobile")}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="ae-btn ae-btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="ae-btn ae-btn-primary" disabled={submitting} aria-busy={submitting}>
            {submitting ? <Spinner size={16} /> : <UserPlus size={16} aria-hidden="true" />}
            {submitting ? "Adding..." : "Add student"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Attendance({ value }) {
  const n = percentValue(value);
  if (n === null) return <span style={{ color: C.muted }}>—</span>;
  const color = n >= 75 ? C.green : C.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 110 }}>
      <div aria-hidden="true" style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, Math.max(0, n))}%`, height: "100%", background: color }} />
      </div>
      <strong style={{ color, minWidth: 44, textAlign: "right" }}>{n}%</strong>
    </div>
  );
}

function StudentsTab({ details, students, onChanged, onNotice, onRemoved }) {
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        String(s.fullName || "").toLowerCase().includes(q) ||
        String(s.rollNumber || "").toLowerCase().includes(q)
    );
  }, [students, query]);

  const confirmDelete = async () => {
    const s = toDelete;
    setDeleting(true);
    setDeleteError("");
    try {
      await api.deleteStudent(s.id);
      onRemoved(s.id);
      onNotice({ type: "success", text: `${s.fullName} was removed.` });
      setToDelete(null);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const downloadPdf = () => {
    if (students.length === 0) {
      onNotice({ type: "error", text: `There are no students in ${details.code}, so no PDF was created.` });
      return;
    }
    try {
      const dateISO = todayISO();
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text("AttendEase - Class Attendance Report", 40, 56);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      doc.text(`Department: ${details.departmentName}`, 40, 84);
      doc.text(`Class: ${details.name} (${details.code})`, 40, 102);
      doc.text(`Report generated: ${dateISO}`, 40, 120);
      doc.text(`Total students: ${students.length}`, 40, 138);

      autoTable(doc, {
        startY: 160,
        head: [["Student Name", "Roll Number", "Attendance Percentage"]],
        body: students.map((s) => {
          const n = percentValue(s.attendancePercentage);
          return [s.fullName, String(s.rollNumber), n === null ? "N/A" : `${n}%`];
        }),
        theme: "grid",
        styles: { font: "helvetica", fontSize: 11, cellPadding: 8, textColor: [15, 23, 42], lineColor: [226, 232, 240] },
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [238, 242, 255] },
        didDrawPage: () => {
          const pageHeight = doc.internal.pageSize.getHeight();
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 40, pageHeight - 24, { align: "right" });
        },
      });

      doc.save(`attendance_${details.code.replace(/[^A-Za-z0-9_-]/g, "")}_${dateISO}.pdf`);
      onNotice({ type: "success", text: `Report for ${details.code} downloaded (${students.length} students).` });
    } catch {
      onNotice({ type: "error", text: "Sorry, the PDF could not be created. Please try again." });
    }
  };

  const DeleteButton = ({ s }) => (
    <button type="button" className="ae-btn ae-btn-danger ae-btn-sm" onClick={() => { setDeleteError(""); setToDelete(s); }} aria-label={`Delete ${s.fullName}`}>
      <Trash2 size={14} aria-hidden="true" /> Delete
    </button>
  );

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section className="ae-card" style={{ padding: 20, display: "grid", gap: 16 }}>
        <div>
          <label htmlFor="student-search" className="ae-label">Search by name or roll number</label>
          <div style={{ position: "relative" }}>
            <Search size={18} color={C.muted} aria-hidden="true" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input id="student-search" type="search" className="ae-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type a name or roll number" style={{ paddingLeft: 42 }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <button type="button" className="ae-btn ae-btn-primary" onClick={downloadPdf} aria-describedby="pdf-hint">
            <FileDown size={18} aria-hidden="true" /> Generate Student Report (PDF)
          </button>
          <button type="button" className="ae-btn ae-btn-outline" onClick={() => setShowAdd(true)}>
            <UserPlus size={18} aria-hidden="true" /> Add Student
          </button>
          <span id="pdf-hint" style={{ fontSize: 13, color: C.muted }}>
            Report includes all {students.length} students.
          </span>
        </div>
      </section>

      {students.length === 0 ? (
        <EmptyState icon={Users} title={`No students in ${details.code}`}>
          Approved registration requests appear here automatically. You can also add a student manually.
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState icon={Search} title="No matching students">
          Try a different name or roll number.
        </EmptyState>
      ) : (
        <>
          <p style={{ margin: 0, color: C.muted, fontSize: 14 }} aria-live="polite">
            Showing {visible.length} of {students.length} students
          </p>
          <div className="ae-card ae-table-wrap">
            <table className="ae-table">
              <caption className="ae-visually-hidden">Students in {details.code}</caption>
              <thead>
                <tr>
                  {["STUDENT NAME", "ROLL NUMBER", "MOBILE NUMBER", "ATTENDANCE", "ACTIONS"].map((h) => (
                    <th key={h} scope="col">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700 }}>{s.fullName}</td>
                    <td>{s.rollNumber}</td>
                    <td>{s.mobile || 'N/A'}</td>
                    <td><Attendance value={s.attendancePercentage} /></td>
                    <td><DeleteButton s={s} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showAdd && (
        <AddStudentModal
          classId={details.id}
          existing={students}
          onClose={() => setShowAdd(false)}
          onAdded={(name) => {
            setShowAdd(false);
            onNotice({ type: "success", text: `${name} was added to ${details.code}.` });
            onChanged();
          }}
        />
      )}
      
      {toDelete && (
        <ConfirmModal
          title="Delete this student?"
          confirmLabel="Yes, delete"
          busyLabel="Deleting..."
          busy={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        >
          You are about to permanently remove <strong style={{ color: C.navy }}>{toDelete.fullName}</strong> (roll{" "}
          {toDelete.rollNumber}) and all of their attendance records. This cannot be undone.
        </ConfirmModal>
      )}
    </div>
  );
}

/* ---------------- Subjects tab ---------------- */

function SubjectsTab({ classId, subjects, onAdded, onRemoved, onNotice }) {
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const add = async (e) => {
    e.preventDefault();
    if (adding) return;
    const value = name.trim().replace(/\s+/g, " ");
    if (!value) {
      setError("Enter a subject name.");
      return;
    }
    if (subjects.some((s) => s.name.toLowerCase() === value.toLowerCase())) {
      setError("This subject already exists in the class.");
      return;
    }
    setAdding(true);
    setError("");
    try {
      const created = await api.addSubject(classId, value);
      onAdded(created);
      setName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const confirmDelete = async () => {
    const s = toDelete;
    setDeleting(true);
    setDeleteError("");
    try {
      await api.deleteSubject(s.id);
      onRemoved(s.id);
      onNotice({ type: "success", text: `Subject "${s.name}" was deleted.` });
      setToDelete(null);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <form onSubmit={add} noValidate className="ae-card" style={{ padding: 20, display: "grid", gap: 10 }}>
        <label htmlFor="new-subject" className="ae-label" style={{ marginBottom: 0 }}>Add a subject</label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            id="new-subject"
            className="ae-input"
            style={{ flex: 1, minWidth: 200 }}
            value={name}
            onChange={(e) => { setName(e.target.value); if (error) setError(""); }}
            placeholder="Enter a subject name"
            autoComplete="off"
          />
          <button type="submit" className="ae-btn ae-btn-primary" disabled={adding}>
            {adding ? <Spinner size={16} /> : <Plus size={16} />} Add subject
          </button>
        </div>
        {error && <p className="ae-error"><AlertCircle size={14} /> {error}</p>}
      </form>

      {subjects.length === 0 ? (
        <EmptyState icon={BookOpen} title="No subjects yet">Add the subjects taught in this class.</EmptyState>
      ) : (
        <ul className="ae-card" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {subjects.map((s, i) => (
            <li key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: i === subjects.length - 1 ? "none" : `1px solid ${C.border}` }}>
              <span style={{ fontWeight: 600 }}>{s.name}</span>
              <button type="button" className="ae-btn ae-btn-danger ae-btn-sm" onClick={() => { setDeleteError(""); setToDelete(s); }}>
                <Trash2 size={14} /> Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {toDelete && (
        <ConfirmModal
          title={`Delete "${toDelete.name}"?`}
          confirmLabel="Yes, delete subject"
          busyLabel="Deleting..."
          busy={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        >
          All attendance saved for this subject will be permanently deleted.
        </ConfirmModal>
      )}
    </div>
  );
}

/* ---------------- Page ---------------- */

const TABS = [
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
  { id: "students", label: "Students", icon: Users },
  { id: "subjects", label: "Subjects", icon: BookOpen },
];

function ClassPortal() {
  const { classId } = useParams();
  const detailsQ = useAsync(() => api.getClassDetails(classId), [classId]);
  const studentsQ = useAsync(() => api.getStudents(classId), [classId]);
  const [tab, setTab] = useState("attendance");
  const [notice, setNotice] = useState(null);

  const details = detailsQ.data;
  const subjects = details?.subjects || [];
  const students = useMemo(
    () => (Array.isArray(studentsQ.data) ? [...studentsQ.data].sort(byRoll) : []),
    [studentsQ.data]
  );

  const initialLoading = (detailsQ.loading && !details) || (studentsQ.loading && !studentsQ.data);
  const error = detailsQ.error || studentsQ.error;

  const changeTab = (id) => {
    setTab(id);
    setNotice(null);
  };

  return (
    <AdminLayout
      title={details ? details.code : "Class"}
      subtitle={details ? `${details.departmentName}${details.fullName ? ` · ${details.fullName}` : ""}` : undefined}
      actions={
        <Link to="/admin/classes" className="ae-btn ae-btn-secondary">
          <ArrowLeft size={18} aria-hidden="true" /> All classes
        </Link>
      }
    >
      {initialLoading && !error && <PageLoader label="Loading class..." />}

      {error && (
        <Alert type="error" title="Could not load this class" onRetry={() => { detailsQ.reload(); studentsQ.reload(); }}>
          {error}
        </Alert>
      )}

      {details && !error && (
        <>
          <div role="tablist" aria-label="Class sections" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`tab-${id}`}
                  aria-selected={active}
                  aria-controls="class-panel"
                  className={`ae-btn ae-btn-sm ${active ? "ae-btn-primary" : "ae-btn-secondary"}`}
                  onClick={() => changeTab(id)}
                >
                  <Icon size={16} aria-hidden="true" /> {label}
                </button>
              );
            })}
          </div>

          <div aria-live="polite">{notice && <Alert type={notice.type}>{notice.text}</Alert>}</div>

          <div id="class-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
            {tab === "attendance" && (
              <AttendanceTab
                students={students}
                subjects={subjects}
                onOpenSubjects={() => changeTab("subjects")}
                onSaved={studentsQ.reload}
              />
            )}
            {tab === "students" && (
              <StudentsTab
                details={details}
                students={students}
                onChanged={studentsQ.reload}
                onNotice={setNotice}
                onRemoved={(id) => studentsQ.setData((list) => (list || []).filter((x) => x.id !== id))}
              />
            )}
            {tab === "subjects" && (
              <SubjectsTab
                classId={classId}
                subjects={subjects}
                onNotice={setNotice}
                onAdded={(s) =>
                  detailsQ.setData((d) => ({
                    ...d,
                    subjects: [...d.subjects, s].sort((a, b) => a.name.localeCompare(b.name)),
                  }))
                }
                onRemoved={(id) =>
                  detailsQ.setData((d) => ({ ...d, subjects: d.subjects.filter((x) => x.id !== id) }))
                }
              />
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default ClassPortal;