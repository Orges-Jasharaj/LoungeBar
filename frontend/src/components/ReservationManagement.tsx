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

  // Get unique table numbers for filter
  const uniqueTables = Array.from(new Set(reservations.map(r => r.tableNumber))).sort((a, b) => a - b);

  const filteredReservations = reservations.filter((reservation) => {
    const matchesStatus = filterStatus === 'all' || reservation.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesTable = filterTable === 'all' || reservation.tableNumber.toString() === filterTable;
    return matchesStatus && matchesTable;
  });

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
              filteredReservations.map((reservation) => (
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
    </div>
  );
};

export default ReservationManagement;
