import React, { useState } from 'react';
import { userApi } from '../services/api';
import './ChangePassword.css';

const ChangePassword: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword.trim()) {
      setError('Current password is required.');
      return;
    }

    if (!newPassword.trim()) {
      setError('New password is required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = await userApi.changePassword({
        oldPassword,
        newPassword,
      });

      if (result.success) {
        setSuccess('Password changed successfully.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(result.message || 'Password change failed.');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.title ||
        err.message ||
        'Password change failed. Please check your current password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-section">
      <h2>Change Password</h2>
      <p className="change-password-description">
        Manage your account by changing your password.
      </p>

      {error && <div className="change-password-error">{error}</div>}
      {success && <div className="change-password-success">{success}</div>}

      <form onSubmit={handleSubmit} className="change-password-form">
        <div className="form-group">
          <label htmlFor="oldPassword">Current password</label>
          <input
            type="password"
            id="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            placeholder="Enter your current password"
            autoComplete="current-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Enter your new password"
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">
            Confirm new password <span className="optional">(optional)</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            autoComplete="new-password"
          />
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
