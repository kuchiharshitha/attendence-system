import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ChangePassword } from './pages/ChangePassword';
import { EmployeeDashboard, EmployeeMarkAttendance } from './pages/employee/Dashboard';
import { History } from './pages/employee/History';
import { ManagerDashboard } from './pages/manager/Dashboard';
import { Employees } from './pages/manager/Employees';
import { Reports } from './pages/manager/Reports';
import { Analytics } from './pages/manager/Analytics';
import { Role } from './types';
import { useAuthStore } from './store';

// --- Protected Routes ---

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: Role[] }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to Welcome/Landing page instead of Login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

// --- Main App Component ---

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/change-password" element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        } />
        
        {/* Employee Routes */}
        <Route path="/employee/dashboard" element={
          <ProtectedRoute allowedRoles={[Role.EMPLOYEE]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        } />
        <Route path="/employee/mark-attendance" element={
          <ProtectedRoute allowedRoles={[Role.EMPLOYEE]}>
            <EmployeeMarkAttendance />
          </ProtectedRoute>
        } />
        <Route path="/employee/history" element={
          <ProtectedRoute allowedRoles={[Role.EMPLOYEE]}>
            <History />
          </ProtectedRoute>
        } />

        {/* Manager Routes */}
        <Route path="/manager/dashboard" element={
          <ProtectedRoute allowedRoles={[Role.MANAGER]}>
            <ManagerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/manager/employees" element={
          <ProtectedRoute allowedRoles={[Role.MANAGER]}>
            <Employees />
          </ProtectedRoute>
        } />
        <Route path="/manager/reports" element={
          <ProtectedRoute allowedRoles={[Role.MANAGER]}>
            <Reports />
          </ProtectedRoute>
        } />
          <Route path="/manager/analytics" element={
          <ProtectedRoute allowedRoles={[Role.MANAGER]}>
            <Analytics />
          </ProtectedRoute>
        } />

        {/* Default Redirects */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;