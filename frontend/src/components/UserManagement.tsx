import React, { useState, useEffect } from 'react';
import { userApi } from '../services/api';
import type { UserDto } from '../types/user';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import './UserManagement.css';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userApi.getAllUsers();
      if (response.success && response.data) {
        const sortedUsers = [...response.data].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        setUsers(sortedUsers);
      } else {
        setError(response.message || 'Failed to load users');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setShowCreateModal(true);
  };

  const handleUserCreated = () => {
    setShowCreateModal(false);
    loadUsers();
  };

  const handleEditUser = (user: UserDto) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUserUpdated = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    loadUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await userApi.deleteUser(userId);
      if (response.success) {
        await loadUsers();
      } else {
        setError(response.message || 'Failed to delete user');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting user');
    }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      const response = await userApi.reactivateUser(userId);
      if (response.success) {
        await loadUsers();
      } else {
        setError(response.message || 'Failed to reactivate user');
      }
    } catch (err: any) {
      setError(err.message || 'Error reactivating user');
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const response = await userApi.updateUserRole(userId, newRole);
      if (response.success) {
        await loadUsers();
      } else {
        setError(response.message || 'Failed to change role');
      }
    } catch (err: any) {
      setError(err.message || 'Error changing role');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SuperAdmin':
        return '#d32f2f';
      case 'Admin':
        return '#1976d2';
      case 'Employee':
        return '#388e3c';
      case 'User':
        return '#f57c00';
      default:
        return '#666';
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === 'all' || user.roles.includes(filterRole);
    const matchesSearch =
      searchTerm === '' ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  }).sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>User Management</h2>
        <button onClick={handleCreateUser} className="create-user-btn">
          + Add User
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="role-filter">
          <label>Filter by role:</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="role-select"
          >
            <option value="all">All</option>
            <option value="SuperAdmin">SuperAdmin</option>
            <option value="Admin">Admin</option>
            <option value="Employee">Employee</option>
            <option value="User">User</option>
          </select>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Date of Birth</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-users">
                  No users found
                </td>
              </tr>
            ) : (
              currentUsers.map((user) => (
                <tr key={user.id} className={!user.isActive ? 'inactive' : ''}>
                  <td>
                    {user.firstName} {user.lastName}
                  </td>
                  <td>{user.email}</td>
                  <td>{new Date(user.dateOfBirth).toLocaleDateString('en-US')}</td>
                  <td>
                    <div className="roles">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="role-badge"
                          style={{ backgroundColor: getRoleColor(role) }}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="edit-btn"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <select
                        value={user.roles[0] || ''}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className="role-change-select"
                        title="Change Role"
                      >
                        <option value="SuperAdmin">SuperAdmin</option>
                        <option value="Admin">Admin</option>
                        <option value="Employee">Employee</option>
                        <option value="User">User</option>
                      </select>
                      {user.isActive ? (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="delete-btn"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivateUser(user.id)}
                          className="reactivate-btn"
                          title="Reactivate"
                        >
                          ♻️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <div className="pagination-info">
            Page {currentPage} of {totalPages} ({filteredUsers.length} users)
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onUserCreated={handleUserCreated}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
};

export default UserManagement;

