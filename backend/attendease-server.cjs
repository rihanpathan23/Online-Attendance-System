require("dotenv").config();
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const db = require("./attendease-db.cjs");

const { ADMIN_PASSWORD, JWT_SECRET } = process.env;
if (!ADMIN_PASSWORD || !JWT_SECRET) {
  console.error("Set ADMIN_PASSWORD and JWT_SECRET in backend/.env before starting.");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

const clean = (v) => String(v ?? "").trim().replace(/\s+/g, " ");
const sha = (v) => crypto.createHash("sha256").update(String(v)).digest();
const shaHex = (v) => crypto.createHash("sha256").update(String(v)).digest("hex"); 

const MOBILE = /^[6-9]\d{9}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isConstraint = (err) => String(err && err.code).startsWith("SQLITE_CONSTRAINT");

function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function makeAuth(role) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (payload.role !== role) throw new Error("wrong role");
      req.auth = payload;
      next();
    } catch {
      res.status(401).json({ message: "Your session has expired. Please log in again." });
    }
  };
}
const requireAdmin = makeAuth("admin");
const requireStudent = makeAuth("student");

const attempts = new Map();
function limitLogins(req, res, next) {
  const now = Date.now();
  const WINDOW = 15 * 60 * 1000;
  const MAX = 10;
  const entry = attempts.get(req.ip);
  if (!entry || now - entry.start > WINDOW) {
    attempts.set(req.ip, { start: now, count: 1 });
    return next();
  }
  entry.count += 1;
  if (entry.count > MAX)
    return res.status(429).json({ message: "Too many attempts. Please try again in a few minutes." });
  next();
}

function validatePerson({ fullName, rollNumber, mobile, skipMobile = false }) {
  if (!fullName) return "Full name is required.";
  if (!rollNumber) return "Roll number is required.";
  if (!skipMobile && !MOBILE.test(mobile)) return "Enter a valid 10-digit Indian mobile number.";
  return null;
}

/* ================= Public ================= */

app.get("/api/departments", (req, res) => {
  res.json(db.prepare("SELECT id, name, code, description FROM departments ORDER BY name").all());
});

app.get("/api/classes", (req, res) => {
  const departmentId = Number(req.query.departmentId);
  if (!departmentId) return res.status(400).json({ message: "departmentId is required." });
  res.json(
    db.prepare("SELECT id, name, full_name AS fullName, description FROM classes WHERE department_id = ? ORDER BY id").all(departmentId)
  );
});

// Student Registration
app.post("/api/requests", (req, res) => {
  const fullName = clean(req.body.fullName);
  const rollNumber = clean(req.body.rollNumber);
  const mobile = String(req.body.mobile ?? "").replace(/[\s-]/g, "");
  const departmentId = Number(req.body.departmentId);
  const classId = Number(req.body.classId);

  const problem = validatePerson({ fullName, rollNumber, mobile });
  if (problem) return res.status(400).json({ message: problem });

  const cls = db.prepare("SELECT id FROM classes WHERE id = ? AND department_id = ?").get(classId, departmentId);
  if (!cls) return res.status(400).json({ message: "Please select a valid department and class." });

  const existingStudent = db.prepare("SELECT id, mobile FROM students WHERE class_id = ? AND lower(roll_number) = lower(?)").get(classId, rollNumber);
  if (existingStudent) {
    if (!existingStudent.mobile || existingStudent.mobile.trim() === '') {
       db.prepare("UPDATE students SET mobile = ?, full_name = ?, password_hash = ? WHERE id = ?").run(mobile, fullName, shaHex(mobile), existingStudent.id);
       return res.status(200).json({ message: "Account Auto-Linked!", autoLinked: true });
    } else if (existingStudent.mobile === mobile) {
       return res.status(409).json({ message: "You are already registered in this class. Please go to Login." });
    } else {
       return res.status(409).json({ message: "This roll number is already registered with a different mobile number." });
    }
  }

  const pendingReq = db.prepare("SELECT 1 FROM requests WHERE class_id = ? AND lower(roll_number) = lower(?) AND status = 'Pending' AND type = 'Registration'").get(classId, rollNumber);
  if (pendingReq) return res.status(409).json({ message: "A registration request for this roll number is already pending." });

  const info = db.prepare("INSERT INTO requests (type, full_name, roll_number, mobile, department_id, class_id) VALUES ('Registration', ?, ?, ?, ?, ?)").run(fullName, rollNumber, mobile, departmentId, classId);
  res.status(201).json({ id: info.lastInsertRowid, autoLinked: false });
});

// Forgot Password Request
app.post("/api/forgot-password", (req, res) => {
  const rollNumber = clean(req.body.rollNumber);
  const mobile = String(req.body.mobile ?? "").replace(/[\s-]/g, "");
  if (!rollNumber || !MOBILE.test(mobile)) return res.status(400).json({ message: "Enter valid Roll Number and Mobile." });

  const student = db.prepare(`SELECT s.id, s.full_name, c.department_id, s.class_id 
                              FROM students s JOIN classes c ON c.id = s.class_id 
                              WHERE lower(s.roll_number) = lower(?) AND s.mobile = ?`).get(rollNumber, mobile);
  if (!student) return res.status(404).json({ message: "Student record not found. Please check your roll and mobile number." });

  const pending = db.prepare("SELECT 1 FROM requests WHERE lower(roll_number) = lower(?) AND mobile = ? AND status = 'Pending' AND type = 'PasswordReset'").get(rollNumber, mobile);
  if (pending) return res.status(409).json({ message: "You have already requested a password reset. Please wait for admin approval." });

  db.prepare("INSERT INTO requests (type, full_name, roll_number, mobile, department_id, class_id) VALUES ('PasswordReset', ?, ?, ?, ?, ?)").run(student.full_name, rollNumber, mobile, student.department_id, student.class_id);
  res.status(201).json({ message: "Password reset request sent to Admin." });
});

/* ================= Student ================= */

app.post("/api/student/login", limitLogins, (req, res) => {
  const rollNumber = clean(req.body.rollNumber);
  const mobile = String(req.body.mobile ?? "").replace(/[\s-]/g, "");
  const password = String(req.body.password ?? "");
  
  // Checking Roll, Mobile AND Password
  if (!rollNumber || !MOBILE.test(mobile) || !password)
    return res.status(400).json({ message: "Enter your roll number, mobile number, and password." });

  const student = db.prepare("SELECT id, roll_number, mobile, password_hash FROM students WHERE mobile = ? AND lower(roll_number) = lower(?)").get(mobile, rollNumber);
  if (!student) return res.status(401).json({ message: "Invalid roll number or mobile number." });
  
  let isValid = false;
  if (student.password_hash === '') {
     isValid = (password.toLowerCase() === student.roll_number.toLowerCase() || password === student.mobile);
     if (isValid) db.prepare("UPDATE students SET password_hash = ? WHERE id = ?").run(shaHex(password), student.id);
  } else {
     const suppliedBuffer = Buffer.from(shaHex(password), "hex");
     const expectedBuffer = Buffer.from(student.password_hash, "hex");
     if (suppliedBuffer.length === expectedBuffer.length) {
       isValid = crypto.timingSafeEqual(suppliedBuffer, expectedBuffer);
     }
  }

  if (!isValid) return res.status(401).json({ message: "Incorrect password." });
  return res.json({ token: jwt.sign({ role: "student", sid: student.id }, JWT_SECRET, { expiresIn: "30d" }) });
});

app.get("/api/student/me", requireStudent, (req, res) => {
  const student = db.prepare(`SELECT s.id, s.full_name AS fullName, s.roll_number AS rollNumber, s.mobile, d.name AS departmentName, c.id AS classId, c.name AS className, c.name || d.code AS classCode FROM students s JOIN classes c ON c.id = s.class_id JOIN departments d ON d.id = c.department_id WHERE s.id = ?`).get(req.auth.sid);
  if (!student) return res.status(401).json({ message: "Your account no longer exists." });

  const round1 = (present, total) => (total ? Math.round((1000 * present) / total) / 10 : null);
  const subjects = db.prepare(`SELECT sub.id, sub.name, COUNT(a.id) AS total, COALESCE(SUM(a.present), 0) AS present FROM subjects sub LEFT JOIN attendance a ON a.subject_id = sub.id AND a.student_id = ? WHERE sub.class_id = ? GROUP BY sub.id ORDER BY sub.name`).all(student.id, student.classId).map((s) => ({ ...s, percentage: round1(s.present, s.total) }));
  const totals = db.prepare("SELECT COUNT(*) AS total, COALESCE(SUM(present), 0) AS present FROM attendance WHERE student_id = ?").get(student.id);
  const recent = db.prepare(`SELECT a.date, sub.name AS subjectName, a.present FROM attendance a JOIN subjects sub ON sub.id = a.subject_id WHERE a.student_id = ? ORDER BY a.date DESC, a.id DESC LIMIT 20`).all(student.id).map((r) => ({ ...r, present: r.present === 1 }));

  res.json({ student, overall: { total: totals.total, present: totals.present, percentage: round1(totals.present, totals.total) }, subjects, recent });
});

/* ================= Admin ================= */

app.post("/api/admin/login", limitLogins, (req, res) => {
  const supplied = sha(req.body.password ?? "");
  const expected = sha(ADMIN_PASSWORD);
  if (!crypto.timingSafeEqual(supplied, expected)) return res.status(401).json({ message: "Incorrect password." });
  res.json({ token: jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "8h" }) });
});

app.get("/api/admin/stats", requireAdmin, (req, res) => {
  const count = (sql) => db.prepare(sql).get().n;
  const today = db.prepare("SELECT ROUND(100.0 * SUM(present) / COUNT(*), 1) AS pct FROM attendance WHERE date = date('now','localtime')").get();
  res.json({
    totalStudents: count("SELECT COUNT(*) AS n FROM students"),
    pendingRequests: count("SELECT COUNT(*) AS n FROM requests WHERE status = 'Pending'"),
    totalClasses: count("SELECT COUNT(*) AS n FROM classes"),
    todayAttendance: today.pct || 0,
  });
});

app.get("/api/admin/requests", requireAdmin, (req, res) => {
  res.json(db.prepare(`SELECT r.id, r.type, r.full_name AS fullName, r.roll_number AS rollNumber, r.mobile, d.name AS departmentName, c.name AS className, r.created_at AS createdAt, r.status FROM requests r JOIN departments d ON d.id = r.department_id JOIN classes c ON c.id = r.class_id ORDER BY r.created_at DESC, r.id DESC`).all());
});

app.patch("/api/admin/requests/:id", requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!["Approved", "Rejected"].includes(status)) return res.status(400).json({ message: "Invalid status." });

  const request = db.prepare("SELECT * FROM requests WHERE id = ?").get(req.params.id);
  if (!request) return res.status(404).json({ message: "Request not found." });
  if (request.status === status) return res.json({ id: request.id, status });

  try {
    db.transaction(() => {
      if (status === "Approved") {
         if(request.type === 'Registration') {
             const defaultPass = shaHex(request.mobile);
             db.prepare("INSERT INTO students (class_id, full_name, roll_number, mobile, password_hash) VALUES (?, ?, ?, ?, ?)").run(request.class_id, request.full_name, request.roll_number, request.mobile, defaultPass);
         } else if (request.type === 'PasswordReset') {
             const resetPass = shaHex(request.roll_number); 
             db.prepare("UPDATE students SET password_hash = ? WHERE lower(roll_number) = lower(?) AND class_id = ?").run(resetPass, request.roll_number, request.class_id);
         }
      }
      db.prepare("UPDATE requests SET status = ? WHERE id = ?").run(status, request.id);
    })();
  } catch (err) {
    if (isConstraint(err)) return res.status(409).json({ message: "Conflict: Roll number or mobile already exists in this class." });
    throw err;
  }
  res.json({ id: request.id, status });
});

// Admin adds Department directly
app.post("/api/admin/departments", requireAdmin, (req, res) => {
  const name = clean(req.body.name);
  const code = clean(req.body.code).toUpperCase();
  if (!name || !code) return res.status(400).json({ message: "Department name and code are required." });
  try {
    const info = db.prepare("INSERT INTO departments (name, code) VALUES (?, ?)").run(name, code);
    res.status(201).json({ id: info.lastInsertRowid, name, code });
  } catch (err) {
    if (isConstraint(err)) return res.status(409).json({ message: "A department with this name already exists." });
    throw err;
  }
});

app.get("/api/admin/classes", requireAdmin, (req, res) => {
  res.json(db.prepare(`SELECT c.id, c.name, c.name || d.code AS code, d.name AS departmentName, (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id) AS studentCount, (SELECT COUNT(*) FROM subjects sub WHERE sub.class_id = c.id) AS subjectCount FROM classes c JOIN departments d ON d.id = c.department_id ORDER BY d.name, c.id`).all());
});

app.post("/api/admin/classes", requireAdmin, (req, res) => {
  const departmentId = Number(req.body.departmentId);
  const name = clean(req.body.name).toUpperCase();
  const fullName = clean(req.body.fullName) || null;
  const subjects = req.body.subjects || [];

  if (!db.prepare("SELECT 1 FROM departments WHERE id = ?").get(departmentId)) return res.status(400).json({ message: "Invalid department." });
  if (!name) return res.status(400).json({ message: "Enter a valid class name." });

  try {
    const id = db.transaction(() => {
      const info = db.prepare("INSERT INTO classes (department_id, name, full_name) VALUES (?, ?, ?)").run(departmentId, name, fullName);
      const add = db.prepare("INSERT INTO subjects (class_id, name) VALUES (?, ?)");
      subjects.forEach((s) => { if(clean(s)) add.run(info.lastInsertRowid, clean(s)); });
      return info.lastInsertRowid;
    })();
    res.status(201).json({ id });
  } catch (err) {
    if (isConstraint(err)) return res.status(409).json({ message: "This class already exists." });
    throw err;
  }
});

app.get("/api/admin/classes/:id", requireAdmin, (req, res) => {
  const cls = db.prepare(`SELECT c.id, c.name, c.full_name AS fullName, c.name || d.code AS code, d.name AS departmentName FROM classes c JOIN departments d ON d.id = c.department_id WHERE c.id = ?`).get(req.params.id);
  if (!cls) return res.status(404).json({ message: "Class not found." });
  cls.subjects = db.prepare("SELECT id, name FROM subjects WHERE class_id = ? ORDER BY name").all(cls.id);
  res.json(cls);
});

app.delete("/api/admin/classes/:id", requireAdmin, (req, res) => {
  const info = db.prepare("DELETE FROM classes WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ message: "Class not found." });
  res.status(204).end();
});

app.post("/api/admin/classes/:id/subjects", requireAdmin, (req, res) => {
  const name = clean(req.body.name);
  if (!name) return res.status(400).json({ message: "Enter a subject name." });
  if (!db.prepare("SELECT 1 FROM classes WHERE id = ?").get(req.params.id)) return res.status(404).json({ message: "Class not found." });
  try {
    const info = db.prepare("INSERT INTO subjects (class_id, name) VALUES (?, ?)").run(req.params.id, name);
    res.status(201).json({ id: info.lastInsertRowid, name });
  } catch (err) {
    if (isConstraint(err)) return res.status(409).json({ message: "This subject already exists in the class." });
    throw err;
  }
});

app.delete("/api/admin/subjects/:id", requireAdmin, (req, res) => {
  const info = db.prepare("DELETE FROM subjects WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

app.get("/api/admin/students", requireAdmin, (req, res) => {
  const classId = Number(req.query.classId);
  res.json(db.prepare(`SELECT s.id, s.full_name AS fullName, s.roll_number AS rollNumber, s.mobile, d.name AS departmentName, c.name AS className, (SELECT ROUND(100.0 * SUM(a.present) / COUNT(*), 1) FROM attendance a WHERE a.student_id = s.id) AS attendancePercentage FROM students s JOIN classes c ON c.id = s.class_id JOIN departments d ON d.id = c.department_id WHERE s.class_id = ?`).all(classId));
});

app.post("/api/admin/students", requireAdmin, (req, res) => {
  const fullName = clean(req.body.fullName);
  const rollNumber = clean(req.body.rollNumber);
  const mobile = String(req.body.mobile ?? "").replace(/[\s-]/g, "") || null;
  const classId = Number(req.body.classId);

  const problem = validatePerson({ fullName, rollNumber, mobile, skipMobile: true });
  if (problem) return res.status(400).json({ message: problem });
  if (mobile && db.prepare("SELECT 1 FROM students WHERE mobile = ?").get(mobile)) return res.status(409).json({ message: "A student with this mobile number already exists." });
  if (db.prepare("SELECT 1 FROM students WHERE class_id = ? AND lower(roll_number) = lower(?)").get(classId, rollNumber)) return res.status(409).json({ message: "This roll number already exists in the class." });

  try {
    const defaultPass = shaHex(rollNumber);
    const info = db.prepare("INSERT INTO students (class_id, full_name, roll_number, mobile, password_hash) VALUES (?, ?, ?, ?, ?)").run(classId, fullName, rollNumber, mobile, defaultPass);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (err) {
    throw err;
  }
});

app.delete("/api/admin/students/:id", requireAdmin, (req, res) => {
  const info = db.prepare("DELETE FROM students WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

app.get("/api/admin/attendance", requireAdmin, (req, res) => {
  const subjectId = Number(req.query.subjectId);
  const date = String(req.query.date || "");
  const subject = db.prepare("SELECT class_id FROM subjects WHERE id = ?").get(subjectId);
  if (!subject) return res.status(404).json({ message: "Subject not found." });
  res.json(db.prepare(`SELECT a.student_id AS studentId, a.present FROM attendance a JOIN students s ON s.id = a.student_id WHERE a.subject_id = ? AND a.date = ? AND s.class_id = ?`).all(subjectId, date, subject.class_id).map((r) => ({ studentId: r.studentId, present: r.present === 1 })));
});

app.put("/api/admin/attendance", requireAdmin, (req, res) => {
  const subjectId = Number(req.body.subjectId);
  const date = String(req.body.date || "");
  const records = Array.isArray(req.body.records) ? req.body.records : [];
  if (date > todayISO()) return res.status(400).json({ message: "You cannot mark attendance for a future date." });
  const subject = db.prepare("SELECT id, class_id FROM subjects WHERE id = ?").get(subjectId);
  if (!subject) return res.status(404).json({ message: "Subject not found." });

  const upsert = db.prepare(`INSERT INTO attendance (student_id, subject_id, date, present) VALUES (?, ?, ?, ?) ON CONFLICT(student_id, subject_id, date) DO UPDATE SET present = excluded.present`);
  db.transaction(() => {
    for (const r of records) upsert.run(Number(r.studentId), subject.id, date, r.present ? 1 : 0);
  })();
  res.json({ saved: records.length });
});

app.use("/api", (req, res) => res.status(404).json({ message: "Endpoint not found." }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ message: "Server error." }); });

app.listen(PORT, () => console.log(`AttendEase API running on http://localhost:${PORT}/api`));