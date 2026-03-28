import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChangePassword from './ChangePassword';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    if (!user?.roles?.length) {
      navigate('/dashboard');
      return;
    }
    const roles = user.roles.map((r: string) => r?.toLowerCase());
    if (roles.includes('superadmin')) navigate('/superadmin');
    else if (roles.includes('admin')) navigate('/admin');
    else if (roles.includes('cooker')) navigate('/kitchen');
    else if (roles.includes('bartender')) navigate('/bar');
    else if (roles.includes('employee')) navigate('/waiter');
    else navigate('/dashboard');
  };

  if (!user) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-header-content">
          <h1>My Account</h1>
          <div className="profile-header-actions">
            <span className="profile-user">Welcome, {user.displayName}!</span>
            <button onClick={handleBack} className="profile-back-btn">
              Back
            </button>
            <button onClick={handleLogout} className="profile-logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <ChangePassword />
      </div>
    </div>
  );
};

export default Profile;
