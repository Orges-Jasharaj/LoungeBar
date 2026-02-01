import React, { useState, useEffect } from 'react';
import { reservationApi, tableApi } from '../services/api';
import type { TableDto } from '../types/table';
import { useAuth } from '../context/AuthContext';
import './ReservationForm.css';

const ReservationForm: React.FC = () => {
  const { user } = useAuth();
  const [tables, setTables] = useState<TableDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userReservations, setUserReservations] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    tableNumber: '',
    customerName: user?.displayName || '',
    customerPhone: '',
    customerEmail: user?.email || '',
    reservationDate: '',
    reservationTime: '',
    numberOfGuests: '',
    notes: '',
  });

  useEffect(() => {
    loadTables();
    loadUserReservations();
  }, [user]);

  const loadTables = async () => {
    try {
      const response = await tableApi.getAllTables();
      if (response.success && response.data) {
        setTables(response.data);
      }
    } catch (err: any) {
      console.error('Error loading tables:', err);
    }
  };

  const loadUserReservations = async () => {
    if (!user?.email) return;

    try {
      let allReservations: any[] = [];
      
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
        }
      }
      
      const userRes = allReservations.filter(
        (reservation) => reservation.customerEmail?.toLowerCase() === user.email?.toLowerCase()
      );
      
      const uniqueReservations = userRes.filter((reservation, index, self) =>
        index === self.findIndex(r => r.id === reservation.id)
      );
      
      setUserReservations(uniqueReservations);
    } catch (err: any) {
      console.error('Error loading user reservations:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.tableNumber || !formData.customerName || !formData.customerPhone || 
        !formData.reservationDate || !formData.reservationTime || !formData.numberOfGuests) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const selectedTable = tables.find(t => t.number === parseInt(formData.tableNumber));
    if (selectedTable && parseInt(formData.numberOfGuests) > selectedTable.capacity) {
      setError(`Table ${formData.tableNumber} can accommodate a maximum of ${selectedTable.capacity} people.`);
      setLoading(false);
      return;
    }

    const reservationDate = new Date(formData.reservationDate);
    const [hours, minutes] = formData.reservationTime.split(':');
    const reservationTime = `${hours}:${minutes}:00`;

    const hasConflictingReservation = userReservations.some(reservation => {
      if (reservation.status.toLowerCase() === 'cancelled' || 
          reservation.status.toLowerCase() === 'completed' ||
          reservation.status.toLowerCase() === 'rejected') {
        return false;
      }

      const existingDate = new Date(reservation.reservationDate);
      const existingTime = reservation.reservationTime.split(':');
      const existingDateTime = new Date(existingDate);
      existingDateTime.setHours(parseInt(existingTime[0]), parseInt(existingTime[1]), 0, 0);

      const newDateTime = new Date(reservationDate);
      newDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const timeDiff = Math.abs(existingDateTime.getTime() - newDateTime.getTime());
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      return existingDate.toDateString() === reservationDate.toDateString() && hoursDiff < 2;
    });

    if (hasConflictingReservation) {
      setError('You already have an active reservation at this date and time. Please choose a different time or cancel your existing reservation.');
      setLoading(false);
      return;
    }

    try {
      const response = await reservationApi.createReservation({
        tableNumber: parseInt(formData.tableNumber),
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        reservationDate: reservationDate.toISOString(),
        reservationTime: reservationTime,
        numberOfGuests: parseInt(formData.numberOfGuests),
        notes: formData.notes || undefined,
      });

      if (response.success) {
        setSuccess('Reservation created successfully!');
        setFormData({
          tableNumber: '',
          customerName: user?.displayName || '',
          customerPhone: '',
          customerEmail: user?.email || '',
          reservationDate: '',
          reservationTime: '',
          numberOfGuests: '',
          notes: '',
        });
        await loadUserReservations();
      } else {
        setError(response.message || 'Failed to create reservation.');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating reservation.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="reservation-form-container">
      <h2>Make Online Reservation</h2>
      
      {error && <div className="reservation-error">{error}</div>}
      {success && <div className="reservation-success">{success}</div>}

      <form onSubmit={handleSubmit} className="reservation-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tableNumber">Table *</label>
            <select
              id="tableNumber"
              name="tableNumber"
              value={formData.tableNumber}
              onChange={handleChange}
              required
            >
              <option value="">Choose table</option>
              {tables.map((table) => (
                <option key={table.id} value={table.number}>
                  Table {table.number} (Capacity: {table.capacity} people)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="numberOfGuests">Number of guests *</label>
            <input
              type="number"
              id="numberOfGuests"
              name="numberOfGuests"
              value={formData.numberOfGuests}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="customerName">Name *</label>
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
              type="tel"
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              required
            />
          </div>
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

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="reservationDate">Date *</label>
            <input
              type="date"
              id="reservationDate"
              name="reservationDate"
              value={formData.reservationDate}
              onChange={handleChange}
              min={getMinDate()}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reservationTime">Time *</label>
            <input
              type="time"
              id="reservationTime"
              name="reservationTime"
              value={formData.reservationTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Additional notes for the reservation..."
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Make Reservation'}
        </button>
      </form>
    </div>
  );
};

export default ReservationForm;
