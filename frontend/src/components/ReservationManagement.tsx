import React, { useState, useEffect } from 'react';
import { reservationApi } from '../services/api';
import type { ReservationDto } from '../types/reservation';
import './ReservationManagement.css';

const ReservationManagement: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTable, setFilterTable] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedReservation, setSelectedReservation] = useState<ReservationDto | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await reservationApi.getAllReservations();
      if (response.success && response.data) {
        setReservations(response.data);
      } else {
        setError(response.message || 'Failed to load reservations');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptReservation = async (reservationId: number) => {
    if (!window.confirm('Are you sure you want to accept this reservation?')) {
      return;
    }

    try {
      setError('');
      const response = await reservationApi.updateReservationStatus(reservationId, 'Confirmed');
      if (response.success) {
        await loadReservations();
      } else {
        setError(response.message || 'Failed to accept reservation');
      }
    } catch (err: any) {
      setError(err.message || 'Error accepting reservation');
    }
  };

  const handleRejectReservation = async (reservationId: number) => {
    if (!window.confirm('Are you sure you want to reject this reservation?')) {
      return;
    }

    try {
      setError('');
      const response = await reservationApi.updateReservationStatus(reservationId, 'Cancelled');
      if (response.success) {
        await loadReservations();
      } else {
        setError(response.message || 'Failed to reject reservation');
      }
    } catch (err: any) {
      setError(err.message || 'Error rejecting reservation');
    }
  };

  const handleDeleteReservation = async (reservationId: number) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) {
      return;
    }

    try {
      setError('');
      const response = await reservationApi.deleteReservation(reservationId);
      if (response.success) {
        await loadReservations();
      } else {
        setError(response.message || 'Failed to delete reservation');
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting reservation');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    // Time string might be in format "HH:mm:ss" or just "HH:mm"
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  };

  const getStatusBadgeClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'confirmed') return 'status-badge confirmed';
    if (statusLower === 'pending') return 'status-badge pending';
    if (statusLower === 'cancelled') return 'status-badge cancelled';
    if (statusLower === 'completed') return 'status-badge completed';
    if (statusLower === 'noshow') return 'status-badge noshow';
    return 'status-badge';
  };

  const handleViewDetails = (reservation: ReservationDto) => {
    setSelectedReservation(reservation);
    setShowDetailsModal(true);
  };

  const handleEditReservation = (reservation: ReservationDto) => {
    setSelectedReservation(reservation);
    setShowEditModal(true);
  };

  const handleReservationUpdated = () => {
    setShowEditModal(false);
    setSelectedReservation(null);
    loadReservations();
  };

  // Get unique table numbers for filter
  const uniqueTables = Array.from(new Set(reservations.map(r => r.tableNumber))).sort((a, b) => a - b);

  const filteredReservations = reservations.filter((reservation) => {
    const matchesStatus = filterStatus === 'all' || reservation.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesTable = filterTable === 'all' || reservation.tableNumber.toString() === filterTable;
    const matchesSearch = searchTerm === '' || 
      reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.tableNumber.toString().includes(searchTerm) ||
      reservation.id.toString().includes(searchTerm);
    return matchesStatus && matchesTable && matchesSearch;
  });

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReservations = filteredReservations.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterTable]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="reservation-management">
        <div className="loading">Loading reservations...</div>
      </div>
    );
  }

  return (
    <div className="reservation-management">
      <div className="reservation-management-header">
        <h2>Reservation Management</h2>
        <button onClick={loadReservations} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, phone, table, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Filter by status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
            <option value="noshow">No Show</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Filter by table:</label>
          <select
            value={filterTable}
            onChange={(e) => setFilterTable(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Tables</option>
            {uniqueTables.map((tableNum) => (
              <option key={tableNum} value={tableNum.toString()}>
                Table {tableNum}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="reservations-table-container">
        <table className="reservations-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Table</th>
              <th>Date</th>
              <th>Time</th>
              <th>Guests</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan={10} className="no-reservations">
                  No reservations found
                </td>
              </tr>
            ) : (
              currentReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{reservation.id}</td>
                  <td>{reservation.customerName}</td>
                  <td>{reservation.customerPhone || '-'}</td>
                  <td>Table {reservation.tableNumber}</td>
                  <td>{formatDate(reservation.reservationDate)}</td>
                  <td>{formatTime(reservation.reservationTime)}</td>
                  <td>{reservation.numberOfGuests}</td>
                  <td>
                    <span className={getStatusBadgeClass(reservation.status)}>
                      {reservation.status}
                    </span>
                  </td>
                  <td>{formatDate(reservation.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleViewDetails(reservation)}
                        className="btn-view"
                        title="View details"
                      >
                        👁 View
                      </button>
                      <button
                        onClick={() => handleEditReservation(reservation)}
                        className="btn-edit"
                        title="Edit reservation"
                      >
                        ✏ Edit
                      </button>
                      {reservation.status.toLowerCase() === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAcceptReservation(reservation.id)}
                            className="btn-accept"
                            title="Accept reservation"
                          >
                            ✓ Accept
                          </button>
                          <button
                            onClick={() => handleRejectReservation(reservation.id)}
                            className="btn-reject"
                            title="Reject reservation"
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteReservation(reservation.id)}
                        className="btn-delete"
                        title="Delete reservation"
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
            Page {currentPage} of {totalPages} ({filteredReservations.length} reservations)
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

      {/* Details Modal */}
      {showDetailsModal && selectedReservation && (
        <ReservationDetailsModal
          reservation={selectedReservation}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedReservation(null);
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedReservation && (
        <EditReservationModal
          reservation={selectedReservation}
          onClose={() => {
            setShowEditModal(false);
            setSelectedReservation(null);
          }}
          onReservationUpdated={handleReservationUpdated}
        />
      )}
    </div>
  );
};

// Details Modal Component
interface ReservationDetailsModalProps {
  reservation: ReservationDto;
  onClose: () => void;
}

const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({ reservation, onClose }) => {
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reservation Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="detail-row">
            <span className="detail-label">Reservation ID:</span>
            <span className="detail-value">{reservation.id}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Customer Name:</span>
            <span className="detail-value">{reservation.customerName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phone:</span>
            <span className="detail-value">{reservation.customerPhone || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{reservation.customerEmail || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Table Number:</span>
            <span className="detail-value">Table {reservation.tableNumber}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Reservation Date:</span>
            <span className="detail-value">{new Date(reservation.reservationDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Reservation Time:</span>
            <span className="detail-value">{formatTime(reservation.reservationTime)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Number of Guests:</span>
            <span className="detail-value">{reservation.numberOfGuests}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className={`detail-value status-badge ${reservation.status.toLowerCase()}`}>
              {reservation.status}
            </span>
          </div>
          {reservation.notes && (
            <div className="detail-row">
              <span className="detail-label">Notes:</span>
              <span className="detail-value">{reservation.notes}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">Created By:</span>
            <span className="detail-value">{reservation.createdBy || 'System'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Created At:</span>
            <span className="detail-value">{formatDateTime(reservation.createdAt)}</span>
          </div>
          {reservation.updatedAt && (
            <>
              <div className="detail-row">
                <span className="detail-label">Updated By:</span>
                <span className="detail-value">{reservation.updatedBy || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Updated At:</span>
                <span className="detail-value">{formatDateTime(reservation.updatedAt)}</span>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="cancel-btn">Close</button>
        </div>
      </div>
    </div>
  );
};

// Edit Modal Component
interface EditReservationModalProps {
  reservation: ReservationDto;
  onClose: () => void;
  onReservationUpdated: () => void;
}

const EditReservationModal: React.FC<EditReservationModalProps> = ({
  reservation,
  onClose,
  onReservationUpdated,
}) => {
  const [formData, setFormData] = useState({
    tableNumber: reservation.tableNumber,
    customerName: reservation.customerName,
    customerPhone: reservation.customerPhone || '',
    customerEmail: reservation.customerEmail || '',
    reservationDate: reservation.reservationDate.split('T')[0],
    reservationTime: reservation.reservationTime ? reservation.reservationTime.substring(0, 5) : '',
    numberOfGuests: reservation.numberOfGuests,
    notes: reservation.notes || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert date and time to proper format
      const reservationDate = new Date(formData.reservationDate);
      const [hours, minutes] = formData.reservationTime.split(':');
      const reservationTime = `${hours}:${minutes}:00`;

      const response = await reservationApi.updateReservation(reservation.id, {
        tableNumber: parseInt(formData.tableNumber.toString()),
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        reservationDate: reservationDate.toISOString(),
        reservationTime: reservationTime,
        numberOfGuests: parseInt(formData.numberOfGuests.toString()),
        notes: formData.notes || undefined,
      });

      if (response.success) {
        onReservationUpdated();
      } else {
        setError(response.message || 'Failed to update reservation');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating reservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Reservation</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-reservation-form">
          <div className="form-group">
            <label htmlFor="tableNumber">Table Number *</label>
            <input
              type="number"
              id="tableNumber"
              name="tableNumber"
              value={formData.tableNumber}
              onChange={handleChange}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerName">Customer Name *</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerPhone">Phone *</label>
            <input
              type="text"
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerEmail">Email</label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reservationDate">Reservation Date *</label>
            <input
              type="date"
              id="reservationDate"
              name="reservationDate"
              value={formData.reservationDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reservationTime">Reservation Time *</label>
            <input
              type="time"
              id="reservationTime"
              name="reservationTime"
              value={formData.reservationTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="numberOfGuests">Number of Guests *</label>
            <input
              type="number"
              id="numberOfGuests"
              name="numberOfGuests"
              value={formData.numberOfGuests}
              onChange={handleChange}
              required
              min="1"
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
              {loading ? 'Updating...' : 'Update Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationManagement;
