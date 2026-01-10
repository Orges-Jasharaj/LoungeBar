import React, { useEffect, useState } from 'react';
import { orderApi } from '../services/api';
import type { WaiterDailySalesDto, OrderResponseDto } from '../types/order';
import './DailyBargains.css';

const DailyBargains: React.FC = () => {
  const [waiters, setWaiters] = useState<WaiterDailySalesDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedWaiterId, setExpandedWaiterId] = useState<string | null>(null);
  const [waiterOrders, setWaiterOrders] = useState<Record<string, OrderResponseDto[]>>({});
  const [loadingOrders, setLoadingOrders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchWaiters();
  }, []);

  const fetchWaiters = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderApi.getAllWaitersDailySales();
      if (response.success && response.data) {
        setWaiters(response.data);
      } else {
        setError(response.message || 'Failed to load data');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleWaiterClick = async (waiterId: string, activeShiftId: number) => {
    if (expandedWaiterId === waiterId) {
      setExpandedWaiterId(null);
      return;
    }

    setExpandedWaiterId(waiterId);
    
    // If orders are already loaded, don't fetch again
    if (waiterOrders[waiterId]) {
      return;
    }

    // If no active shift, don't fetch orders
    if (!activeShiftId || activeShiftId === 0) {
      setWaiterOrders({ ...waiterOrders, [waiterId]: [] });
      return;
    }

    try {
      setLoadingOrders({ ...loadingOrders, [waiterId]: true });
      // Get orders only from the active shift
      const response = await orderApi.getOrdersByWaiterId(waiterId, activeShiftId);
      if (response.success && response.data) {
        setWaiterOrders({ ...waiterOrders, [waiterId]: response.data });
      }
    } catch (err: any) {
      console.error('Error loading orders:', err);
    } finally {
      setLoadingOrders({ ...loadingOrders, [waiterId]: false });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('sq-AL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'status-paid';
      case 'canceled':
        return 'status-canceled';
      case 'served':
        return 'status-served';
      case 'preparing':
        return 'status-preparing';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="daily-bargains-section">
        <div className="daily-bargains-header">
          <div>
            <h2>Daily Bargains</h2>
            <p className="daily-bargains-subtitle">
              View how much each waiter has made during their shift
            </p>
          </div>
        </div>
        <div className="stats-loading">
          <div className="skeleton-line" />
          <div className="skeleton-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="daily-bargains-section">
        <div className="daily-bargains-header">
          <div>
            <h2>Daily Bargains</h2>
            <p className="daily-bargains-subtitle">
              View how much each waiter has made during their shift
            </p>
          </div>
        </div>
        <div className="error-banner">{error}</div>
      </div>
    );
  }

  return (
    <div className="daily-bargains-section">
      <div className="daily-bargains-header">
        <div>
          <h2>Daily Bargains</h2>
          <p className="daily-bargains-subtitle">
            View how much each waiter has made during their shift
          </p>
        </div>
      </div>

      {waiters.length === 0 ? (
        <div className="no-data">
          <p>No data available for today</p>
        </div>
      ) : (
        <div className="waiters-list">
          {waiters.map((waiter) => (
            <div key={waiter.waiterId} className="waiter-card">
              <div
                className="waiter-card-header"
                onClick={() => handleWaiterClick(waiter.waiterId, waiter.activeShiftId)}
              >
                <div className="waiter-info">
                  <div className="waiter-name">{waiter.waiterName}</div>
                  <div className="waiter-email">{waiter.waiterEmail}</div>
                  {waiter.shiftStartTime && (
                    <div className="waiter-shift">
                      Start: {formatDate(waiter.shiftStartTime)}
                      {waiter.shiftEndTime && (
                        <> - End: {formatDate(waiter.shiftEndTime)}</>
                      )}
                      {!waiter.shiftEndTime && <span className="shift-active"> (Active)</span>}
                    </div>
                  )}
                </div>
                <div className="waiter-stats">
                  <div className="waiter-stat">
                    <span className="stat-label">Orders:</span>
                    <span className="stat-value">{waiter.totalOrders}</span>
                  </div>
                  <div className="waiter-stat waiter-stat-total">
                    <span className="stat-label">Total:</span>
                    <span className="stat-value">€ {waiter.totalSales.toFixed(2)}</span>
                  </div>
                </div>
                <div className="waiter-expand-icon">
                  {expandedWaiterId === waiter.waiterId ? '▼' : '▶'}
                </div>
              </div>

              {expandedWaiterId === waiter.waiterId && (
                <div className="waiter-orders">
                  {loadingOrders[waiter.waiterId] ? (
                    <div className="orders-loading">Loading orders...</div>
                  ) : waiterOrders[waiter.waiterId]?.length === 0 ? (
                    <div className="no-orders">No orders</div>
                  ) : (
                    <div className="orders-table-container">
                      <table className="orders-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Table</th>
                            <th>Status</th>
                            <th>Amount</th>
                            <th>Created At</th>
                            <th>Updated At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {waiterOrders[waiter.waiterId]?.map((order) => (
                            <tr key={order.orderId}>
                              <td>#{order.orderId}</td>
                              <td>Table {order.tableNumber}</td>
                              <td>
                                <span className={`status-badge ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="order-amount">€ {order.totalAmount.toFixed(2)}</td>
                              <td className="order-date">{formatDate(order.orderDate)}</td>
                              <td className="order-date">
                                {order.updatedAt ? formatDate(order.updatedAt) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyBargains;
