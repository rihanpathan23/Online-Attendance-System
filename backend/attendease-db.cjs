const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "attendease.sqlite"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    full_name TEXT,
    description TEXT,
    UNIQUE (department_id, name)
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL COLLATE NOCASE,
    UNIQUE (class_id, name)
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    mobile TEXT, 
    password_hash TEXT NOT NULL DEFAULT '', 
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    UNIQUE (class_id, roll_number)
  );

  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL DEFAULT 'Registration',
    full_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    mobile TEXT NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    present INTEGER NOT NULL CHECK (present IN (0,1)),
    UNIQUE (student_id, subject_id, date)
  );

  -- Naya table Off Days ke liye
  CREATE TABLE IF NOT EXISTS off_days (
    date TEXT PRIMARY KEY,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  );
`);

try {
  db.transaction(() => {
    let dept = db.prepare("SELECT id FROM departments WHERE code = 'BScCS'").get();
    if (!dept) {
      const info = db.prepare("INSERT INTO departments (name, code, description) VALUES (?, ?, ?)").run('B.Sc. Computer Science', 'BScCS', 'Bachelor of Science in Computer Science');
      dept = { id: info.lastInsertRowid };
    }
    const insertClass = db.prepare("INSERT OR IGNORE INTO classes (department_id, name, full_name) VALUES (?, ?, ?)");
    insertClass.run(dept.id, 'FY', 'First Year BSc(CS)');
    insertClass.run(dept.id, 'SY', 'Second Year BSc(CS)');
    insertClass.run(dept.id, 'TY', 'Third Year BSc(CS)');
  })();
} catch (error) {
  console.error("Error seeding default classes:", error);
}

try {
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_students_mobile ON students(mobile)");
} catch {}

module.exports = db;