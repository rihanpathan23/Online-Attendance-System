const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to SQLite database (creates the file if it doesn't exist)
const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Enforce foreign key constraints
    db.run('PRAGMA foreign_keys = ON');
    initializeSchema();
  }
});

function initializeSchema() {
  db.serialize(() => {
    // 1. Admins Table
    db.run(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )`);

    // 2. Departments Table
    db.run(`CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL
    )`);

    // 3. Classes Table
    db.run(`CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      dept_id TEXT NOT NULL,
      year_code TEXT NOT NULL,
      year_name TEXT NOT NULL,
      FOREIGN KEY (dept_id) REFERENCES departments (id) ON DELETE CASCADE
    )`);

    // 4. Join Requests Table
    db.run(`CREATE TABLE IF NOT EXISTS join_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      roll_number TEXT NOT NULL,
      mobile TEXT NOT NULL,
      dept_id TEXT NOT NULL,
      class_id TEXT NOT NULL,
      status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
      request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dept_id) REFERENCES departments (id),
      FOREIGN KEY (class_id) REFERENCES classes (id)
    )`);

    // 5. Students Table
    db.run(`CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      roll_number TEXT NOT NULL,
      mobile TEXT NOT NULL,
      dept_id TEXT NOT NULL,
      class_id TEXT NOT NULL,
      FOREIGN KEY (dept_id) REFERENCES departments (id),
      FOREIGN KEY (class_id) REFERENCES classes (id),
      UNIQUE(dept_id, class_id, roll_number) -- Enforces roll number uniqueness per class
    )`);

    // 6. Attendance Table
    db.run(`CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      date TEXT NOT NULL, -- Format: YYYY-MM-DD
      status TEXT NOT NULL, -- 'Present' or 'Absent'
      FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
      UNIQUE(student_id, date) -- One record per student per date
    )`);

    seedInitialAdmin();
  });
}

function seedInitialAdmin() {
  const adminUser = process.env.INITIAL_ADMIN_USERNAME || 'admin';
  const adminPass = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';

  db.get('SELECT id FROM admins WHERE username = ?', [adminUser], async (err, row) => {
    if (err) {
      console.error('Error checking for initial admin:', err.message);
      return;
    }
    
    // If admin doesn't exist, create it
    if (!row) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(adminPass, salt);
        db.run('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [adminUser, hash], (insertErr) => {
          if (insertErr) {
            console.error('Failed to create initial admin:', insertErr.message);
          } else {
            console.log(`Initial admin account '${adminUser}' created successfully.`);
          }
        });
      } catch (hashErr) {
        console.error('Error hashing initial admin password:', hashErr);
      }
    }
  });
}

module.exports = db;