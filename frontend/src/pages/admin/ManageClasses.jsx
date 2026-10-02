import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, School, Trash2, ArrowRight, X, AlertCircle, Users, BookOpen } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import Modal from "../../components/Modal";
import ConfirmModal from "../../components/ConfirmModal";
import { Alert, EmptyState, PageLoader, Spinner } from "../../components/UI";
import useAsync from "../../hooks/useAsync";
import { api } from "../../services/api";
import { C } from "../../theme";

function AddClassModal({ departments, onClose, onCreated }) {
  const [isNewDept, setIsNewDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");
  const [departmentId, setDepartmentId] = useState(departments[0] ? String(departments[0].id) : "");
  
  const [name, setName] = useState("");
  const [fullName, setFullName] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const normalize = (v) => v.trim().replace(/\s+/g, " ");
  const hasSubject = (list, value) => list.some((s) => s.toLowerCase() === value.toLowerCase());

  const addSubject = () => {
    const value = normalize(subjectInput);
    if (!value) return;
    if (hasSubject(subjects, value)) {
      setErrors((e) => ({ ...e, subjects: "This subject is already added." }));
      return;
    }
    setSubjects((list) => [...list, value]);
    setSubjectInput("");
    setErrors((e) => ({ ...e, subjects: undefined }));
    document.getElementById("subject-input")?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const pending = normalize(subjectInput);
    const finalSubjects = pending && !hasSubject(subjects, pending) ? [...subjects, pending] : subjects;
    const className = normalize(name);

    const found = {};
    if (isNewDept) {
       if (!normalize(newDeptName)) found.newDeptName = "Enter new department name.";
       if (!normalize(newDeptCode)) found.newDeptCode = "Enter new department code.";
    } else {
       if (!departmentId) found.departmentId = "Please select a department.";
    }
    
    if (!className) found.name = "Enter a class name, for example TY.";
    else if (className.length > 20) found.name = "Class name is too long.";
    if (finalSubjects.length === 0) found.subjects = "Add at least one subject.";

    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setApiError("");
    try {
      let finalDeptId = departmentId;
      if (isNewDept) {
         const d = await api.createDepartment({ name: normalize(newDeptName), code: normalize(newDeptCode).toUpperCase() });
         finalDeptId = d.id;
      }

      const created = await api.createClass({
        departmentId: Number(finalDeptId),
        name: className,
        fullName: normalize(fullName),
        subjects: finalSubjects,
      });
      onCreated(created.id);
    } catch (err) {
      setApiError(err.message);
      setSubmitting(false);
    }
  };

  const fieldError = (id, message) => message && <p id={id} className="ae-error"><AlertCircle size={14}/> {message}</p>;

  return (
    <Modal titleId="add-class-title" onClose={submitting ? () => {} : onClose} maxWidth={560}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 id="add-class-title" style={{ margin: 0, fontSize: 22 }}>Add Class</h2>
        <button type="button" className="ae-btn ae-btn-ghost" onClick={onClose} disabled={submitting} aria-label="Close" style={{ width: 38, height: 38, padding: 0, color: C.muted }}>
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={submit} noValidate style={{ display: "grid", gap: 18 }}>
        {apiError && <Alert type="error">{apiError}</Alert>}

        {isNewDept ? (
           <div style={{ padding: 16, background: C.indigoSoft, borderRadius: 12, border: `1px solid #c7d2fe` }}>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <strong style={{ color: C.indigo }}>Create New Department</strong>
                <button type="button" onClick={() => setIsNewDept(false)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>Use Existing</button>
             </div>
             <div className="ae-two">
                <div>
                  <label className="ae-label">Department Name</label>
                  <input className="ae-input" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} placeholder="e.g. Bachelor of Arts" />
                  {fieldError("newDeptName-error", errors.newDeptName)}
                </div>
                <div>
                  <label className="ae-label">Code</label>
                  <input className="ae-input" value={newDeptCode} onChange={e => setNewDeptCode(e.target.value)} placeholder="e.g. BA" />
                  {fieldError("newDeptCode-error", errors.newDeptCode)}
                </div>
             </div>
           </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
               <label htmlFor="class-departmentId" className="ae-label">Department</label>
               <button type="button" onClick={() => setIsNewDept(true)} style={{ background: 'none', border: 'none', color: C.indigo, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>+ Add new department</button>
            </div>
            {departments.length === 0 ? (
               <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>No departments found. Click '+ Add new department' above.</p>
            ) : (
               <select id="class-departmentId" className="ae-input" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                 {departments.map((d) => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
               </select>
            )}
            {fieldError("class-departmentId-error", errors.departmentId)}
          </div>
        )}

        <div className="ae-two">
          <div>
            <label htmlFor="class-name" className="ae-label">Class name</label>
            <input id="class-name" list="class-name-options" className="ae-input" value={name} onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((er) => ({ ...er, name: undefined })); }} placeholder="e.g. TY" autoComplete="off" />
            <datalist id="class-name-options"><option value="FY" /><option value="SY" /><option value="TY" /></datalist>
            {fieldError("class-name-error", errors.name)}
          </div>
          <div>
            <label htmlFor="class-fullName" className="ae-label">Full name (optional)</label>
            <input id="class-fullName" className="ae-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Third Year" autoComplete="off" />
          </div>
        </div>

        <div>
          <label htmlFor="subject-input" className="ae-label">Subjects</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input id="subject-input" className="ae-input" value={subjectInput} onChange={(e) => { setSubjectInput(e.target.value); if (errors.subjects) setErrors((er) => ({ ...er, subjects: undefined })); }} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubject(); } }} placeholder="Enter a subject name" autoComplete="off" />
            <button type="button" className="ae-btn ae-btn-outline" onClick={addSubject}><Plus size={16} /> Add</button>
          </div>
          {fieldError("subjects-error", errors.subjects)}
          {subjects.length > 0 && (
            <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {subjects.map((s) => (
                <li key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 6px 6px 12px", background: C.indigoSoft, color: "#3730a3", borderRadius: 999, fontWeight: 600, fontSize: 14 }}>
                  {s} <button type="button" onClick={() => setSubjects((list) => list.filter((x) => x !== s))} className="ae-btn" style={{ width: 24, height: 24, padding: 0, borderRadius: "50%", background: "#fff", color: "#3730a3" }}><X size={14} /></button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="ae-btn ae-btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="ae-btn ae-btn-primary" disabled={submitting} aria-busy={submitting}>
            {submitting ? <Spinner size={16} /> : <Plus size={16} />}
            {submitting ? "Creating..." : "Create class"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ManageClasses() {
  const navigate = useNavigate();
  const classesQ = useAsync(() => api.getAdminClasses(), []);
  const deptQ = useAsync(() => api.getDepartments(), []);
  const [showAdd, setShowAdd] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");

  const classes = Array.isArray(classesQ.data) ? classesQ.data : [];
  const departments = Array.isArray(deptQ.data) ? deptQ.data : [];

  const confirmDelete = async () => {
    const target = toDelete;
    setDeleting(true);
    setDeleteError("");
    try {
      await api.deleteClass(target.id);
      setToDelete(null);
      setNotice(`${target.code} was deleted.`);
      classesQ.reload();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

  return (
    <AdminLayout
      title="Classes"
      subtitle="Create a class with its subjects, then open it to mark attendance and manage students."
      actions={
        <button type="button" className="ae-btn ae-btn-primary" onClick={() => setShowAdd(true)} disabled={deptQ.loading}>
          <Plus size={18} aria-hidden="true" /> Add Class
        </button>
      }
    >
      <div aria-live="polite">{notice && <Alert type="success">{notice}</Alert>}</div>

      {(classesQ.loading && !classesQ.data) && <PageLoader label="Loading classes..." />}

      {classesQ.error && (
        <Alert type="error" title="Could not load classes" onRetry={classesQ.reload}>
          {classesQ.error}
        </Alert>
      )}

      {!classesQ.loading && !classesQ.error && classes.length === 0 && (
        <EmptyState
          icon={School}
          title="No classes yet"
          action={
            <button type="button" className="ae-btn ae-btn-primary" onClick={() => setShowAdd(true)}>
              <Plus size={18} aria-hidden="true" /> Add your first class
            </button>
          }
        >
          Add a class such as TYBCS and enter its subjects. Students can then register for it.
        </EmptyState>
      )}

      {classes.length > 0 && (
        <ul className="ae-grid-auto" style={{ listStyle: "none", margin: 0, padding: 0, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {classes.map((c) => (
            <li key={c.id} className="ae-card" style={{ padding: 22, display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>{c.code}</p>
                  <p style={{ margin: "2px 0 0", color: C.muted, fontSize: 14, overflowWrap: "anywhere" }}>{c.departmentName}</p>
                </div>
                <span style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: C.indigoSoft, color: C.indigo, flexShrink: 0 }}>
                  <School size={22} aria-hidden="true" />
                </span>
              </div>

              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", color: C.muted, fontSize: 14, fontWeight: 600 }}>
                <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                  <Users size={16} aria-hidden="true" /> {plural(c.studentCount, "student")}
                </span>
                <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                  <BookOpen size={16} aria-hidden="true" /> {plural(c.subjectCount, "subject")}
                </span>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <Link to={`/admin/classes/${c.id}`} className="ae-btn ae-btn-primary" style={{ flex: 1 }}>
                  Open class <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  className="ae-btn ae-btn-danger"
                  onClick={() => { setDeleteError(""); setToDelete(c); }}
                  aria-label={`Delete class ${c.code}`}
                  style={{ width: 46, padding: 0 }}
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showAdd && (
        <AddClassModal
          departments={departments}
          onClose={() => setShowAdd(false)}
          onCreated={(id) => navigate(`/admin/classes/${id}`)}
        />
      )}

      {toDelete && (
        <ConfirmModal
          title={`Delete ${toDelete.code}?`}
          confirmLabel="Yes, delete class"
          busyLabel="Deleting..."
          busy={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        >
          This permanently deletes the class together with its{" "}
          <strong style={{ color: C.navy }}>{toDelete.studentCount} students</strong>, subjects, attendance records and
          registration requests. This cannot be undone.
        </ConfirmModal>
      )}
    </AdminLayout>
  );
}

export default ManageClasses;