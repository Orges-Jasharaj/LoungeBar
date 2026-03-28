import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { tableApi } from '../services/api';
import { signalRService } from '../services/signalR';
import type { TableOrderSummaryDto } from '../types/table';
import './ClientDashboard.css';

const ClientDashboard: React.FC = () => {
  const location = useLocation();
  const [orders, setOrders] = useState<TableOrderSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [tableNum, setTableNum] = useState<number | null>(null);

  const loadOrders = async (guid: string) => {
    try {
      setLoading(true);
      setError('');
      // Use the new endpoint that only takes GUID
      const response = await tableApi.getTableActiveOrdersBySessionGuid(guid);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to load orders');
      }

      setOrders(response.data || []);
      
      // Get tableNumber from first order (if available)
      if (response.data && response.data.length > 0 && response.data[0].tableNumber) {
        setTableNum(response.data[0].tableNumber);
      }
    } catch (err: any) {
      setError(err?.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const path = location.pathname;
    
    // Extract session GUID from URL
    // Format: /{guid}
    const match = path.match(/^\/([a-f0-9-]{36})$/i);
    
    if (!match || !match[1]) {
      setError('Invalid URL parameters');
      setLoading(false);
      return;
    }

    const guid = match[1];
    void loadOrders(guid);

    // Setup SignalR connection for real-time updates
    const setupSignalR = async () => {
      try {
        await signalRService.startOrderConnection();

        // Listen for order status changes
        const handleOrderStatusChanged = (_orderId: number, _status: string, _tableId: number) => {
          // Reload orders when status changes
          void loadOrders(guid);
        };

        // Listen for new orders
        const handleOrderCreated = () => {
          // Reload orders when a new order is created
          void loadOrders(guid);
        };

        // Listen for order updates
        const handleOrderUpdated = () => {
          // Reload orders when an order is updated
          void loadOrders(guid);
        };

        signalRService.onOrderStatusChanged(handleOrderStatusChanged);
        signalRService.onOrderCreated(handleOrderCreated);
        signalRService.onOrderUpdated(handleOrderUpdated);

        return () => {
          signalRService.offOrderStatusChanged(handleOrderStatusChanged);
          signalRService.offOrderCreated(handleOrderCreated);
          signalRService.offOrderUpdated(handleOrderUpdated);
        };
      } catch (err) {
        console.error('Failed to setup SignalR for orders:', err);
        // Continue without SignalR - fallback to polling
      }
    };

    const cleanup = setupSignalR();

    // Fallback: Refresh orders every 30 seconds (less frequent since we have SignalR)
    const interval = setInterval(() => {
      void loadOrders(guid);
    }, 30000);

    return () => {
      clearInterval(interval);
      void cleanup.then(cleanupFn => cleanupFn?.());
      void signalRService.stopOrderConnection();
    };
  }, [location.pathname]);

  const formatCurrency = (amount: number) => {
    return `€ ${amount.toFixed(2)}`;
  };

  const getStatusBadgeClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'status-pending';
    if (statusLower === 'preparing') return 'status-preparing';
    if (statusLower === 'ready') return 'status-ready';
    if (statusLower === 'served') return 'status-served';
    return 'status-default';
  };

  if (loading) {
    return (
      <div className="client-dashboard">
        <div className="client-header">
          <h1>LoungeBar</h1>
          <p>Table {tableNum || '...'}</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-dashboard">
        <div className="client-header">
          <h1>LoungeBar</h1>
          <p>Table {tableNum || '...'}</p>
        </div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Error</h2>
          <p>{error}</p>
          <p className="error-subtitle">Please scan the QR Code again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-dashboard">
      <div className="client-header">
        <h1>LoungeBar</h1>
        <p className="table-info">Table {tableNum}</p>
      </div>

      <div className="orders-section">
        <h2>Active Orders</h2>
        
        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">🍽️</div>
            <p>No active orders for this table.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order, index) => (
              <div key={index} className="order-card">
                <div className="order-header">
                  <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="order-total">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
                
                <div className="order-items">
                  <h3>Items:</h3>
                  <ul>
                    {order.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="order-item">
                        <span className="item-name">{item.menuItemName}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="client-footer">
        <p>Orders update automatically</p>
      </div>
    </div>
  );
};

export default ClientDashboard;
