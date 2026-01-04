import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        <p>Roli: {user?.roles.join(', ')}</p>
      </div>
    </div>
  );
};

export default Dashboard;

