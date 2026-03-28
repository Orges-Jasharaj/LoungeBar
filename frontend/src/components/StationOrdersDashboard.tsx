import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { orderApi } from '../services/api';
import type { OrderResponseDto, OrderStatus } from '../types/order';
import { signalRService } from '../services/signalR';
import './StationOrdersDashboard.css';

interface StationOrdersDashboardProps {
  title: string;
  subtitle: string;
  itemType: 'Food' | 'Drink';
}

const StationOrdersDashboard: React.FC<StationOrdersDashboardProps> = ({
  title,
  subtitle,
  itemType,
}) => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setError('');
      const response = await orderApi.getOrdersForStation(itemType);
      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        setError(response.message || 'Failed to load orders');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error loading orders';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [itemType]);

  useEffect(() => {
    setLoading(true);
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const id = window.setInterval(() => void loadOrders(), 30000);
    
    // Setup SignalR connection for real-time updates
    const setupSignalR = async () => {
        try {
            await signalRService.startOrderConnection();
            
            const handleUpdate = () => { void loadOrders(); };
            
            signalRService.onOrderCreated(handleUpdate);
            signalRService.onOrderUpdated(handleUpdate);
            signalRService.onOrderStatusChanged(handleUpdate);
            
            return () => {
                signalRService.offOrderCreated(handleUpdate);
                signalRService.offOrderUpdated(handleUpdate);
                signalRService.offOrderStatusChanged(handleUpdate);
            };
        } catch (err) {
            console.error('Failed to setup SignalR for station dashboard:', err);
            return () => {};
        }
    };

    const cleanup = setupSignalR();
    
    return () => {
        window.clearInterval(id);
        cleanup.then(clean => clean());
    };
  }, [loadOrders]);

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      setError('');
      const response = await orderApi.updateOrderStatus(orderId, status);
      if (response.success) {
        await loadOrders();
      } else {
        setError(response.message || 'Could not update status');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error updating order';
      setError(message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="station-dashboard">
      <header className="station-header">
        <div>
          <h1>{title}</h1>
          <p className="station-subtitle">{subtitle}</p>
          <p className="station-welcome">Welcome, {user?.displayName}</p>
        </div>
        <div className="station-header-actions">
          <button type="button" className="refresh-btn" onClick={() => void loadOrders()}>
            Refresh
          </button>
          <Link to="/profile" className="profile-link">
            My Account
          </Link>
          <button type="button" className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="station-content">
        {loading ? (
          <div className="loading">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">No active orders for this station.</div>
        ) : (
          <ul className="station-order-list">
            {orders.map((order) => (
              <li key={order.orderId} className="station-order-card">
                <div className="station-order-head">
                  <span className="order-id">Order #{order.orderId}</span>
                  <span className="table-badge">Table {order.tableNumber}</span>
                  <span className="order-status">{order.status}</span>
                  <span className="order-time">
                    {new Date(order.orderDate).toLocaleString()}
                  </span>
                </div>
                <ul className="station-line-items">
                  {order.items.map((line) => (
                    <li key={`${order.orderId}-${line.menuItemId}`}>
                      <span className="line-name">{line.menuItemName}</span>
                      <span className="line-qty">×{line.quantity}</span>
                    </li>
                  ))}
                </ul>
                <div className="station-order-meta">
                  <span>Waiter: {order.userName || '—'}</span>
                  <span>Subtotal: €{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="station-actions">
                  <button
                    type="button"
                    disabled={updatingId === order.orderId || order.status === 'Preparing'}
                    onClick={() => void handleStatusChange(order.orderId, 'Preparing')}
                  >
                    Preparing
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === order.orderId || order.status === 'Served'}
                    onClick={() => void handleStatusChange(order.orderId, 'Served')}
                  >
                    Ready / Served
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StationOrdersDashboard;
