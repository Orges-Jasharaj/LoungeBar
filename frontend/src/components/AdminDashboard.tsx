import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReservationManagement from './ReservationManagement';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'reservations' | 'statistics'>('reservations');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-dashboard">
          <div className="admin-header">
            <div className="header-content">
              <h1>Admin Dashboard</h1>
              <div className="user-info">
                <span>Welcome, {user?.displayName}!</span>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            </div>
          </div>
          
          <div className="admin-content">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'reservations' ? 'active' : ''}`}
                onClick={() => setActiveTab('reservations')}
              >
                Reservations
              </button>
              <button
                className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
                onClick={() => setActiveTab('statistics')}
              >
                Statistics
              </button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'reservations' && <ReservationManagement />}
              {activeTab === 'statistics' && <div>Statistics coming soon...</div>}
            </div>
          </div>
        </div>
    );
};

export default AdminDashboard;