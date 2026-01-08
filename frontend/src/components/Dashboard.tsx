import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecto bazuar në role
    if (!user) return;
    
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

    const hasAdminRole = user.roles && Array.isArray(user.roles) && (
      user.roles.includes('Admin') || 
      user.roles.includes('ADMIN') || 
      user.roles.some((role: string) => role && role.toLowerCase() === 'admin')
    );
    
    if (hasSuperAdminRole) {
      navigate('/superadmin', { replace: true });
      return;
    }
    
    if (hasEmployeeRole) {
      navigate('/waiter', { replace: true });
      return;
    }

    if (hasAdminRole) {
      navigate('/admin', { replace: true });
      return;
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Nëse user-i ka rol SuperAdmin ose Employee, mos shfaq këtë dashboard
  if (!user) {
    return <div>Duke u ngarkuar...</div>;
  }

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

  const hasAdminRole = user.roles && Array.isArray(user.roles) && (
    user.roles.includes('Admin') || 
    user.roles.includes('ADMIN') || 
    user.roles.some((role: string) => role && role.toLowerCase() === 'admin')
  );

  if (hasSuperAdminRole || hasEmployeeRole || hasAdminRole) {
    return <div>Duke u ridrejtuar...</div>; // Loading state derisa të bëhet redirect
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>LoungeBar Dashboard</h1>
        <div className="user-info">
          <span>Mirë se vini, {user?.displayName}!</span>
          <button onClick={handleLogout} className="logout-button">
            Dil
          </button>
        </div>
      </div>
      <div className="dashboard-content">
        <p>Kjo është faqja kryesore. Këtu do të shfaqen porositë e tavolinës pasi të skanoni QR kodin.</p>
        <p>Email: {user?.email}</p>
        <p>Roli: {user?.roles ? user.roles.join(', ') : 'N/A'}</p>
      </div>
    </div>
  );
};

export default Dashboard;

