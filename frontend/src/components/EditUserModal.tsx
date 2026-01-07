import React, { useState, useEffect } from 'react';
import { userApi } from '../services/api';
import type { UserDto, UpdateUserDto } from '../types/user';
import './EditUserModal.css';

interface EditUserModalProps {
  user: UserDto;
  onClose: () => void;
  onUserUpdated: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  onClose,
  onUserUpdated,
}) => {
  const maxDate = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState<UpdateUserDto>({
    firstName: user.firstName,
    lastName: user.lastName,
    dateOfBirth: user.dateOfBirth.split('T')[0], // Format date for input
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth.split('T')[0],
    });
  }, [user]);

  const validateForm = (): string | null => {
    const firstNameTrimmed = (formData.firstName || '').trim();
    const lastNameTrimmed = (formData.lastName || '').trim();
    const dob = formData.dateOfBirth || '';

    if (firstNameTrimmed.length < 2) {
      return 'First name must be at least 2 characters.';
    }
    if (lastNameTrimmed.length < 2) {
      return 'Last name must be at least 2 characters.';
    }
    if (!dob) {
      return 'Date of birth is required.';
    }
    if (dob > maxDate) {
      return 'Date of birth cannot be in the future.';
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Convert date to ISO string
      const updateData: UpdateUserDto = {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
      };

      const response = await userApi.updateUser(user.id, updateData);

      if (response.success) {
        onUserUpdated();
      } else {
        setError(response.message || 'Failed to update user');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating user');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = () => {
    if (loading) return;
    onClose();
  };

  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (loading) return;
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit User</h2>
          <button className="close-btn" onClick={handleCloseClick} disabled={loading}>
            ×
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-user-form">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth *</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              max={maxDate}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user.email} disabled />
            <small>Email cannot be changed</small>
          </div>

          <div className="form-group">
            <label>Role</label>
            <div className="roles-display">
              {user.roles.map((role) => (
                <span key={role} className="role-badge">
                  {role}
                </span>
              ))}
            </div>
            <small>Role can be changed from the main table</small>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;

