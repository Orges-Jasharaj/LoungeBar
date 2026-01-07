import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import WaiterDashboard from './components/WaiterDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const HomeRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Duke u ngarkuar...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Kontrollo role-t
  const hasSuperAdminRole = user.roles && Array.isArray(user.roles) && (
    user.roles.includes('SuperAdmin') || 
    user.roles.includes('SUPERADMIN') || 
    user.roles.some((role: string) => role && role.toLowerCase() === 'superadmin')
  );

  const hasEmployeeRole = user.roles && Array.isArray(user.roles) && (
    user.roles.includes('Employee') || 
    user.roles.includes('EMPLOYEE') || 
    user.roles.some((role: string) => role && role.toLowerCase() === 'employee')
  );

  if (hasSuperAdminRole) {
    return <Navigate to="/superadmin" replace />;
  }

  if (hasEmployeeRole) {
    return <Navigate to="/waiter" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/waiter"
            element={
              <ProtectedRoute>
                <WaiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<HomeRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

