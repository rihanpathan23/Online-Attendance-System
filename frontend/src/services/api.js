/*
 Backend contract (JSON, base URL = VITE_API_URL or "/api"):

 Public
  GET    /departments                         -> [{ id, name, description? }]
  GET    /classes?departmentId=ID             -> [{ id, name, fullName?, description? }]
  POST   /requests                            { fullName, rollNumber, mobile, departmentId, classId }
  POST   /forgot-password                     { rollNumber, mobile }

 Student (Authorization: Bearer <student token>)
  POST   /student/login                       { rollNumber, password } -> { token }
  GET    /student/me                          -> { student, overall, subjects, recent }

 Admin (Authorization: Bearer <admin token>)
  POST   /admin/login                         { password } -> { token }
  GET    /admin/stats
  GET    /admin/requests
  PATCH  /admin/requests/:id                  { status: "Approved" | "Rejected" }
  GET    /admin/classes                       -> [{ id, name, code, departmentName, studentCount, subjectCount }]
  POST   /admin/classes                       { departmentId, name, fullName?, subjects: [string] } -> { id }
  GET    /admin/classes/:id                   -> { id, name, fullName, code, departmentName, subjects: [{ id, name }] }
  DELETE /admin/classes/:id
  POST   /admin/classes/:id/subjects          { name } -> { id, name }
  DELETE /admin/subjects/:id
  GET    /admin/students?classId=ID
  POST   /admin/students                      { fullName, rollNumber, mobile, classId }
  DELETE /admin/students/:id
  GET    /admin/attendance?subjectId=ID&date=YYYY-MM-DD -> [{ studentId, present }]
  PUT    /admin/attendance                    { subjectId, date, records: [{ studentId, present }] }

 Errors: non-2xx status with { message: "readable text" }.
*/

const BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  "/api";

const KEYS = { admin: "attendease_admin_token", student: "attendease_student_token" };

function createAuth(role) {
  const key = KEYS[role];
  const store = () => (role === "student" ? window.localStorage : window.sessionStorage);
  const getToken = () => {
    try {
      return store().getItem(key);
    } catch {
      return null;
    }
  };
  return {
    getToken,
    setToken: (token) => {
      try {
        store().setItem(key, token);
      } catch { }
    },
    clear: () => {
      try {
        store().removeItem(key);
      } catch { }
    },
    isLoggedIn: () => Boolean(getToken()),
  };
}

export const auth = createAuth("admin");
export const studentAuth = createAuth("student");
const stores = { admin: auth, student: studentAuth };

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, role } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (role) {
    const token = stores[role].getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Could not reach the server. Please check your connection and try again.", 0);
  }

  let data = null;
  if (res.status !== 204) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    if (role && res.status === 401) {
      stores[role].clear();
      window.location.assign(role === "student" ? "/student/login" : "/admin/login");
    }
    throw new ApiError((data && data.message) || "Something went wrong. Please try again.", res.status);
  }
  return data;
}

const enc = encodeURIComponent;

export const api = {
  // Public
  getDepartments: () => request("/departments"),
  getClasses: (departmentId) => request(`/classes?departmentId=${enc(departmentId)}`),
  submitRequest: (payload) => request("/requests", { method: "POST", body: payload }),
  submitForgotPassword: (rollNumber, mobile) => request("/forgot-password", { method: "POST", body: { rollNumber, mobile } }),

  // Student
  // Student
  studentLogin: (rollNumber, mobile, password) =>
    request("/student/login", { method: "POST", body: { rollNumber, mobile, password } }),
  getMyAttendance: () => request("/student/me", { role: "student" }),

  // Admin
  adminLogin: (password) => request("/admin/login", { method: "POST", body: { password } }),
  getStats: () => request("/admin/stats", { role: "admin" }),
  getRequests: () => request("/admin/requests", { role: "admin" }),
  updateRequestStatus: (id, status) =>
    request(`/admin/requests/${enc(id)}`, { method: "PATCH", body: { status }, role: "admin" }),

  createDepartment: (payload) => request("/admin/departments", { method: "POST", body: payload, role: "admin" }),

  getAdminClasses: () => request("/admin/classes", { role: "admin" }),
  createClass: (payload) => request("/admin/classes", { method: "POST", body: payload, role: "admin" }),
  getClassDetails: (id) => request(`/admin/classes/${enc(id)}`, { role: "admin" }),
  deleteClass: (id) => request(`/admin/classes/${enc(id)}`, { method: "DELETE", role: "admin" }),
  addSubject: (classId, name) =>
    request(`/admin/classes/${enc(classId)}/subjects`, { method: "POST", body: { name }, role: "admin" }),
  deleteSubject: (id) => request(`/admin/subjects/${enc(id)}`, { method: "DELETE", role: "admin" }),

  getStudents: (classId) => request(`/admin/students?classId=${enc(classId)}`, { role: "admin" }),
  addStudent: (payload) => request("/admin/students", { method: "POST", body: payload, role: "admin" }),
  deleteStudent: (id) => request(`/admin/students/${enc(id)}`, { method: "DELETE", role: "admin" }),

  // Off Days APIs
  getOffDays: () => request("/admin/off-days", { role: "admin" }),
  addOffDay: (date, reason) => request("/admin/off-days", { method: "POST", body: { date, reason }, role: "admin" }),
  deleteOffDay: (date) => request(`/admin/off-days/${enc(date)}`, { method: "DELETE", role: "admin" }),

  getAttendance: (subjectId, date) =>
    request(`/admin/attendance?subjectId=${enc(subjectId)}&date=${enc(date)}`, { role: "admin" }),
  saveAttendance: (payload) => request("/admin/attendance", { method: "PUT", body: payload, role: "admin" }),
};