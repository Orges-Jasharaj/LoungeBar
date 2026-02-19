import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ReservationForm from './ReservationForm';
import MyReservations from './MyReservations';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'reservation' | 'myReservations'>('reservation');

  useEffect(() => {
    // Redirect based on role
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

  // If user has SuperAdmin or Employee role, don't show this dashboard
  if (!user) {
    return <div>Loading...</div>;
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
    return <div>Redirecting...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>LoungeBar Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.displayName}!</span>
          <Link to="/profile" className="profile-link">My Account</Link>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
      <div className="dashboard-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'reservation' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservation')}
          >
            Make Reservation
          </button>
          <button
            className={`tab ${activeTab === 'myReservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('myReservations')}
          >
            My Reservations
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'reservation' && <ReservationForm />}
          {activeTab === 'myReservations' && <MyReservations />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

