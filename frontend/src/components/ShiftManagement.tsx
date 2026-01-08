import React, { useState, useEffect } from 'react';
import { shiftApi, userApi } from '../services/api';
import type { ShiftDto, CreateShiftDto, ShiftType } from '../types/shift';
import type { UserDto } from '../types/user';
import './ShiftManagement.css';

const ShiftManagement: React.FC = () => {
  const [shifts, setShifts] = useState<ShiftDto[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftDto | null>(null);
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterShiftType, setFilterShiftType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    try {
      loadShifts();
      loadUsers();
    } catch (err) {
      console.error('Error in ShiftManagement useEffect:', err);
      setError('Failed to initialize component');
      setLoading(false);
    }
  }, []);

  const loadShifts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await shiftApi.getAllShifts();
      if (response.success && response.data) {
        setShifts(response.data);
      } else {
        setError(response.message || 'Failed to load shifts');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading shifts');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userApi.getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (err: any) {
      console.error('Error loading users:', err);
    }
  };

  const handleCreateShift = () => {
    setShowCreateModal(true);
  };

  const handleShiftCreated = () => {
    setShowCreateModal(false);
    loadShifts();
  };

  const handleEditShift = (shift: ShiftDto) => {
    setSelectedShift(shift);
    setShowEditModal(true);
  };

  const handleShiftUpdated = () => {
    setShowEditModal(false);
    setSelectedShift(null);
    loadShifts();
  };

  const handleDeleteShift = async (shiftId: number) => {
    if (!window.confirm('Are you sure you want to archive/delete this shift? It will be marked as inactive.')) {
      return;
    }

    try {
      setError('');
      const response = await shiftApi.deleteShift(shiftId);
      if (response.success) {
        await loadShifts();
        // Show success message if available
        if (response.message) {
          // You could show a success toast/notification here if you have one
          console.log('Success:', response.message);
        }
      } else {
        setError(response.message || 'Failed to delete shift');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting shift');
    }
  };

  const getUserName = (shift: ShiftDto) => {
    if (shift.userName && shift.userName.trim() !== '') {
      return shift.userName;
    }
    if (!shift.userId) {
      return 'Unknown User';
    }
    const user = users.find((u) => u.id === shift.userId);
    if (user) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || shift.userId;
    }
    return shift.userId;
  };

  const getShiftTypeLabel = (shiftType: ShiftType | number | undefined): string => {
    if (shiftType === undefined || shiftType === null) {
      return 'Unknown';
    }
    if (typeof shiftType === 'number') {
      switch (shiftType) {
        case 1:
          return 'Morning';
        case 2:
          return 'Evening';
        case 3:
          return 'Night';
        default:
          return 'Unknown';
      }
    }
    if (typeof shiftType === 'string') {
      return shiftType;
    }
    return 'Unknown';
  };

  const getShiftTypeString = (shiftType: ShiftType | number | undefined): string => {
    if (shiftType === undefined || shiftType === null) {
      return 'Morning';
    }
    if (typeof shiftType === 'number') {
      switch (shiftType) {
        case 1:
          return 'Morning';
        case 2:
          return 'Evening';
        case 3:
          return 'Night';
        default:
          return 'Morning';
      }
    }
    if (typeof shiftType === 'string') {
      return shiftType;
    }
    return 'Morning';
  };

  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredShifts = shifts.filter((shift) => {
    const matchesUser = filterUser === 'all' || shift.userId === filterUser;
    const shiftTypeStr = getShiftTypeString(shift.shiftType);
    const matchesShiftType =
      filterShiftType === 'all' || shiftTypeStr === filterShiftType;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && shift.isActive && !shift.endTime) ||
      (filterStatus === 'completed' && shift.endTime !== null) ||
      (filterStatus === 'inactive' && !shift.isActive);
    return matchesUser && matchesShiftType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="shift-management">
        <div className="loading">Loading shifts...</div>
      </div>
    );
  }

  return (
    <div className="shift-management">
      <div className="shift-management-header">
        <h2>Shift Management</h2>
        <button onClick={handleCreateShift} className="create-shift-btn">
          + Add Shift
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="filters">
        <div className="filter-group">
          <label>Filter by user:</label>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Users</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Filter by shift type:</label>
          <select
            value={filterShiftType}
            onChange={(e) => setFilterShiftType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Filter by status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="shifts-table-container">
        <table className="shifts-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Shift Type</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredShifts.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-shifts">
                  No shifts found
                </td>
              </tr>
            ) : (
              filteredShifts.map((shift, index) => {
                const shiftTypeStr = getShiftTypeString(shift.shiftType) || 'Morning';
                const userName = getUserName(shift);
                const shiftTypeLabel = getShiftTypeLabel(shift.shiftType) || 'Unknown';
                return (
                  <tr key={shift.id || `shift-${index}`} className={!shift.isActive ? 'inactive' : ''}>
                    <td>{userName}</td>
                    <td>
                      <span className={`shift-type-badge ${shiftTypeStr.toLowerCase()}`}>
                        {shiftTypeLabel}
                      </span>
                    </td>
                    <td>{formatDateTime(shift.startTime)}</td>
                    <td>{formatDateTime(shift.endTime)}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          shift.endTime
                            ? 'completed'
                            : shift.isActive
                            ? 'active'
                            : 'inactive'
                        }`}
                      >
                        {shift.endTime
                          ? 'Completed'
                          : shift.isActive
                          ? 'Active'
                          : 'Inactive'}
                      </span>
                    </td>
                    <td>{shift.notes || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditShift(shift)}
                          className="edit-btn"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteShift(shift.id)}
                          className="delete-btn"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <CreateShiftModal
          users={users}
          onClose={() => setShowCreateModal(false)}
          onShiftCreated={handleShiftCreated}
        />
      )}

      {showEditModal && selectedShift && (
        <EditShiftModal
          shift={selectedShift}
          users={users}
          onClose={() => {
            setShowEditModal(false);
            setSelectedShift(null);
          }}
          onShiftUpdated={handleShiftUpdated}
        />
      )}
    </div>
  );
};

// Create Shift Modal
interface CreateShiftModalProps {
  users: UserDto[];
  onClose: () => void;
  onShiftCreated: () => void;
}

const CreateShiftModal: React.FC<CreateShiftModalProps> = ({
  users,
  onClose,
  onShiftCreated,
}) => {
  const [formData, setFormData] = useState<CreateShiftDto>({
    userId: '',
    shiftType: 'Morning',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert shiftType string to number for backend
      const shiftTypeMap: Record<string, number> = {
        'Morning': 1,
        'Evening': 2,
        'Night': 3,
      };
      const payload = {
        ...formData,
        shiftType: shiftTypeMap[formData.shiftType] || 1,
      };
      const response = await shiftApi.createShift(payload as any);
      if (response.success) {
        onShiftCreated();
      } else {
        setError(response.message || 'Failed to create shift');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating shift');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Shift</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="create-shift-form">
          <div className="form-group">
            <label htmlFor="userId">User *</label>
            <select
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="shiftType">Shift Type *</label>
            <select
              id="shiftType"
              name="shiftType"
              value={formData.shiftType}
              onChange={handleChange}
              required
            >
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Shift Modal
interface EditShiftModalProps {
  shift: ShiftDto;
  users: UserDto[];
  onClose: () => void;
  onShiftUpdated: () => void;
}

const EditShiftModal: React.FC<EditShiftModalProps> = ({
  shift,
  users,
  onClose,
  onShiftUpdated,
}) => {
  const [formData, setFormData] = useState<CreateShiftDto>({
    userId: shift.userId,
    shiftType: (typeof shift.shiftType === 'number' 
      ? (shift.shiftType === 1 ? 'Morning' : shift.shiftType === 2 ? 'Evening' : 'Night')
      : (shift.shiftType as string)) as ShiftType,
    notes: shift.notes || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert shiftType string to number for backend
      const shiftTypeMap: Record<string, number> = {
        'Morning': 1,
        'Evening': 2,
        'Night': 3,
      };
      const payload = {
        ...formData,
        shiftType: shiftTypeMap[formData.shiftType] || 1,
      };
      const response = await shiftApi.updateShift(shift.id, payload as any);
      if (response.success) {
        onShiftUpdated();
      } else {
        setError(response.message || 'Failed to update shift');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating shift');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Shift</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-shift-form">
          <div className="form-group">
            <label htmlFor="userId">User *</label>
            <select
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="shiftType">Shift Type *</label>
            <select
              id="shiftType"
              name="shiftType"
              value={formData.shiftType}
              onChange={handleChange}
              required
            >
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
            </select>
          </div>

          <div className="form-group">
            <label>Start Time</label>
            <input
              type="text"
              value={shift.startTime ? new Date(shift.startTime).toLocaleString() : 'N/A'}
              disabled
            />
          </div>

          <div className="form-group">
            <label>End Time</label>
            <input
              type="text"
              value={shift.endTime ? new Date(shift.endTime).toLocaleString() : 'N/A'}
              disabled
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
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

export default ShiftManagement;

