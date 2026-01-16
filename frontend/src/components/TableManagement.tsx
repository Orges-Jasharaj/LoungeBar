import React, { useState, useEffect } from 'react';
import { tableApi } from '../services/api';
import type { TableDto } from '../types/table';
import './TableManagement.css';

const TableManagement: React.FC = () => {
  const [tables, setTables] = useState<TableDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await tableApi.getAllTables();
      if (response.success && response.data) {
        setTables(response.data);
      } else {
        setError(response.message || 'Failed to load tables');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading tables');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = () => {
    setShowCreateModal(true);
  };

  const handleTableCreated = () => {
    setShowCreateModal(false);
    loadTables();
  };

  const handleEditTable = (table: TableDto) => {
    setSelectedTable(table);
    setShowEditModal(true);
  };

  const handleTableUpdated = () => {
    setShowEditModal(false);
    setSelectedTable(null);
    loadTables();
  };

  const handleDeleteTable = async (tableId: number) => {
    if (!window.confirm('Are you sure you want to delete this table?')) {
      return;
    }

    try {
      const response = await tableApi.deleteTable(tableId);
      if (response.success) {
        await loadTables();
      } else {
        setError(response.message || 'Failed to delete table');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting table');
    }
  };

  const filteredTables = tables.filter((table) => {
    const matchesSearch = searchTerm === '' || 
      table.number.toString().includes(searchTerm) ||
      table.capacity.toString().includes(searchTerm) ||
      table.id.toString().includes(searchTerm);
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="table-management">
        <div className="loading">Loading tables...</div>
      </div>
    );
  }

  return (
    <div className="table-management">
      <div className="table-management-header">
        <h2>Table Management</h2>
        <button onClick={handleCreateTable} className="create-btn">
          + Create Table
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by number, capacity, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="tables-table-container">
        <table className="tables-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Number</th>
              <th>Capacity</th>
              <th>Total Orders</th>
              <th>Has QR Code</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTables.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-tables">
                  No tables found
                </td>
              </tr>
            ) : (
              filteredTables.map((table) => (
                <tr key={table.id}>
                  <td>{table.id}</td>
                  <td>Table {table.number}</td>
                  <td>{table.capacity}</td>
                  <td>{table.totalOrders}</td>
                  <td>{table.qrCodeImage ? 'Yes' : 'No'}</td>
                  <td>{new Date(table.createdAt).toLocaleDateString('en-US')}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEditTable(table)}
                        className="edit-btn"
                        title="Edit table"
                      >
                        ✏ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTable(table.id)}
                        className="delete-btn"
                        title="Delete table"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <CreateTableModal
          onClose={() => setShowCreateModal(false)}
          onTableCreated={handleTableCreated}
        />
      )}

      {showEditModal && selectedTable && (
        <EditTableModal
          table={selectedTable}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTable(null);
          }}
          onTableUpdated={handleTableUpdated}
        />
      )}
    </div>
  );
};

interface CreateTableModalProps {
  onClose: () => void;
  onTableCreated: () => void;
}

const CreateTableModal: React.FC<CreateTableModalProps> = ({ onClose, onTableCreated }) => {
  const [formData, setFormData] = useState({
    number: '',
    capacity: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await tableApi.createTable({
        number: parseInt(formData.number),
        capacity: parseInt(formData.capacity),
      });

      if (response.success) {
        onTableCreated();
      } else {
        setError(response.message || 'Failed to create table');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating table');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Table</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="create-table-form">
          <div className="form-group">
            <label htmlFor="number">Table Number *</label>
            <input
              type="number"
              id="number"
              name="number"
              value={formData.number}
              onChange={handleChange}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="capacity">Capacity *</label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
              min="1"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditTableModalProps {
  table: TableDto;
  onClose: () => void;
  onTableUpdated: () => void;
}

const EditTableModal: React.FC<EditTableModalProps> = ({ table, onClose, onTableUpdated }) => {
  const [formData, setFormData] = useState({
    number: table.number.toString(),
    capacity: table.capacity.toString(),
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await tableApi.updateTable(table.id, {
        number: parseInt(formData.number),
        capacity: parseInt(formData.capacity),
      });

      if (response.success) {
        onTableUpdated();
      } else {
        setError(response.message || 'Failed to update table');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating table');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Table</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-table-form">
          <div className="form-group">
            <label htmlFor="number">Table Number *</label>
            <input
              type="number"
              id="number"
              name="number"
              value={formData.number}
              onChange={handleChange}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="capacity">Capacity *</label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
              min="1"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableManagement;
