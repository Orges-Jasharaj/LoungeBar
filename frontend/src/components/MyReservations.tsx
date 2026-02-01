import React, { useState, useEffect } from 'react';
import { reservationApi } from '../services/api';
import type { ReservationDto } from '../types/reservation';
import { useAuth } from '../context/AuthContext';
import './MyReservations.css';

const MyReservations: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadReservations();
  }, [user]);

  const loadReservations = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      setError('');
      
      let allReservations: ReservationDto[] = [];
      
      try {
        const response = await reservationApi.getAllReservations();
        if (response.success && response.data) {
          allReservations = response.data;
        }
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          const today = new Date();
          const datesToCheck: Date[] = [];
          
          for (let i = -60; i <= 60; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            datesToCheck.push(date);
          }
          
          const promises = datesToCheck.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            return reservationApi.getReservationsByDate(dateStr).catch(() => null);
          });
          
          const results = await Promise.all(promises);
          results.forEach(result => {
            if (result?.success && result.data) {
              allReservations.push(...result.data);
            }
          });
        } else {
          throw err;
        }
      }
      
      const userReservations = allReservations.filter(
        (reservation) => reservation.customerEmail?.toLowerCase() === user.email?.toLowerCase()
      );
      
      const uniqueReservations = userReservations.filter((reservation, index, self) =>
        index === self.findIndex(r => r.id === reservation.id)
      );
      
      const sortedReservations = uniqueReservations.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      setReservations(sortedReservations);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || 'Error loading reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: number) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      const response = await reservationApi.cancelReservation(reservationId);
      
      if (response.success) {
        setSuccess('Reservation cancelled successfully');
        await loadReservations();
      } else {
        setError(response.message || 'Failed to cancel reservation');
      }
    } catch (err: any) {
      setError(err.message || 'Error cancelling reservation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'confirmed':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'cancelled':
        return '#f44336';
      case 'rejected':
      case 'denied':
        return '#f44336';
      case 'completed':
        return '#2196f3';
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'confirmed':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'rejected':
      case 'denied':
        return 'Rejected';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isPastReservation = (reservation: ReservationDto) => {
    const reservationDateTime = new Date(`${reservation.reservationDate}T${reservation.reservationTime}`);
    return reservationDateTime < new Date();
  };

  const totalPages = Math.ceil(reservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReservations = reservations.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && reservations.length === 0) {
    return (
      <div className="my-reservations-container">
        <h2>My Reservations</h2>
        <div className="loading">Loading reservations...</div>
      </div>
    );
  }

  return (
    <div className="my-reservations-container">
      <div className="my-reservations-header">
        <h2>My Reservations</h2>
        <button onClick={loadReservations} className="refresh-btn" disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="reservation-error">{error}</div>}
      {success && <div className="reservation-success">{success}</div>}

      {reservations.length === 0 ? (
        <div className="no-reservations">
          <p>You don't have any reservations yet.</p>
        </div>
      ) : (
        <>
          <div className="reservations-list">
            {currentReservations.map((reservation) => (
              <div key={reservation.id} className="reservation-card">
                <div className="reservation-header">
                  <div className="reservation-info">
                    <h3>Table {reservation.tableNumber}</h3>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(reservation.status) }}
                    >
                      {getStatusLabel(reservation.status)}
                    </span>
                  </div>
                  {!isPastReservation(reservation) && 
                   reservation.status.toLowerCase() !== 'cancelled' && 
                   reservation.status.toLowerCase() !== 'completed' && (
                    <button
                      onClick={() => handleCancelReservation(reservation.id)}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                
                <div className="reservation-details">
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{formatDate(reservation.reservationDate)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{formatTime(reservation.reservationTime)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Guests:</span>
                    <span className="detail-value">{reservation.numberOfGuests} people</span>
                  </div>
                  {reservation.notes && (
                    <div className="detail-row">
                      <span className="detail-label">Notes:</span>
                      <span className="detail-value">{reservation.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
                Page {currentPage} of {totalPages}
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
        </>
      )}
    </div>
  );
};

export default MyReservations;
