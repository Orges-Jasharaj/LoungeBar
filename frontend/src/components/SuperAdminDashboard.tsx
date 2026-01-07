import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import './SuperAdminDashboard.css';

const SuperAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'statistics'>('users');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="superadmin-dashboard">
      <div className="superadmin-header">
        <div className="header-content">
          <h1>SuperAdmin Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.displayName}!</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="superadmin-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
          <button
            className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            Statistics
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'statistics' && (
            <div className="statistics-section">
              <h2>Statistics</h2>
              <p>This section will contain system statistics...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

