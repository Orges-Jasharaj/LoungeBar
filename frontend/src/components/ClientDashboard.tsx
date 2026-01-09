import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { tableApi } from '../services/api';
import type { TableOrderSummaryDto } from '../types/table';
import './ClientDashboard.css';

const ClientDashboard: React.FC = () => {
  const location = useLocation();
  const [orders, setOrders] = useState<TableOrderSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [tableNum, setTableNum] = useState<number | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      const path = location.pathname;
      
      // Extract session GUID nga URL
      // Format: /{guid}
      const match = path.match(/^\/([a-f0-9-]{36})$/i);
      
      if (!match || !match[1]) {
        setError('Invalid URL parameters');
        setLoading(false);
        return;
      }

      const guid = match[1];

      try {
        setLoading(true);
        setError('');
        // Përdor endpoint-in e ri që merr vetëm GUID
        const response = await tableApi.getTableActiveOrdersBySessionGuid(guid);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to load orders');
        }

        setOrders(response.data || []);
        
        // Merr tableNumber nga porosia e parë (nëse ka)
        if (response.data && response.data.length > 0 && response.data[0].tableNumber) {
          setTableNum(response.data[0].tableNumber);
        }
      } catch (err: any) {
        setError(err?.message || 'Error loading orders');
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();

    // Refresh orders every 10 seconds
    const interval = setInterval(() => {
      void loadOrders();
    }, 10000);

    return () => clearInterval(interval);
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
          <p>Tavolina {tableNum || '...'}</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Duke u ngarkuar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-dashboard">
        <div className="client-header">
          <h1>LoungeBar</h1>
          <p>Tavolina {tableNum || '...'}</p>
        </div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Gabim</h2>
          <p>{error}</p>
          <p className="error-subtitle">Ju lutem skanoni QR Code përsëri.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-dashboard">
      <div className="client-header">
        <h1>LoungeBar</h1>
        <p className="table-info">Tavolina {tableNum}</p>
      </div>

      <div className="orders-section">
        <h2>Porositë Aktive</h2>
        
        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">🍽️</div>
            <p>Nuk ka porosi aktive për këtë tavolinë.</p>
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
                  <h3>Artikuj:</h3>
                  <ul>
                    {order.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="order-item">
                        <span className="item-name">{item.drinkName}</span>
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
        <p>Porositë përditësohen automatikisht</p>
      </div>
    </div>
  );
};

export default ClientDashboard;
