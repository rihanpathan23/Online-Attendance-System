import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import SelectDepartment from "./pages/public/SelectDepartment";
import SelectClass from "./pages/public/SelectClass";
import StudentRequest from "./pages/public/StudentRequest";
import StudentLogin from "./pages/student/StudentLogin";
import StudentDashboard from "./pages/student/StudentDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageRequests from "./pages/admin/ManageRequests";
import ManageClasses from "./pages/admin/ManageClasses";
import ManageHolidays from "./pages/admin/ManageHolidays";
import ClassPortal from "./pages/admin/ClassPortal";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestOnly from "./components/GuestOnly";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route element={<GuestOnly />}>
          <Route path="/departments" element={<SelectDepartment />} />
          <Route path="/classes" element={<SelectClass />} />
          <Route path="/register" element={<StudentRequest />} />
        </Route>
        <Route path="/student/login" element={<StudentLogin />} />
        <Route element={<ProtectedRoute role="student" />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/requests" element={<ManageRequests />} />
          <Route path="/admin/classes" element={<ManageClasses />} />
          <Route path="/admin/classes/:classId" element={<ClassPortal />} />
          <Route path="/admin/holidays" element={<ManageHolidays />} />
        </Route>
        <Route path="/admin/students" element={<Navigate to="/admin/classes" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;