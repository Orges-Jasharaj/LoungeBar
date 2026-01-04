import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api';
import type { TableDto } from '../types/table';
import type { OrderResponseDto, OrderStatus } from '../types/order';
import CreateOrderModal from './CreateOrderModal';
import './TableOrders.css';

interface TableOrdersProps {
  table: TableDto;
  onBack: () => void;
  onOrderUpdated: () => void;
}

const TableOrders: React.FC<TableOrdersProps> = ({ table, onBack, onOrderUpdated }) => {
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [table.id]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderApi.getAllOrders();
      if (response.success && response.data) {
        // Filtro porositë për këtë tavolinë
        const tableOrders = response.data.filter(
          (order) => order.tableNumber === table.number
        );
        setOrders(tableOrders);
      } else {
        setError(response.message || 'Dështoi ngarkimi i porosive');
      }
    } catch (err: any) {
      setError(err.message || 'Gabim në ngarkimin e porosive');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = () => {
    setShowCreateModal(true);
  };

  const handleOrderCreated = () => {
    setShowCreateModal(false);
    loadOrders();
    onOrderUpdated();
  };

  const handleUpdateStatus = async (orderId: number, status: OrderStatus) => {
    try {
      const response = await orderApi.updateOrderStatus(orderId, status);
      if (response.success) {
        await loadOrders();
      } else {
        setError(response.message || 'Dështoi përditësimi i statusit');
      }
    } catch (err: any) {
      setError(err.message || 'Gabim në përditësimin e statusit');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return '#ff9800';
      case 'Preparing':
        return '#2196f3';
      case 'Served':
        return '#4caf50';
      case 'Canceled':
        return '#f44336';
      case 'Paid':
        return '#9c27b0';
      default:
        return '#666';
    }
  };

  const getStatusOptions = (currentStatus: string): OrderStatus[] => {
    switch (currentStatus) {
      case 'Pending':
        return ['Preparing', 'Canceled'];
      case 'Preparing':
        return ['Served', 'Canceled'];
      case 'Served':
        return ['Paid'];
      default:
        return [];
    }
  };

  return (
    <div className="table-orders">
      <div className="table-orders-header">
        <button onClick={onBack} className="back-btn">
          ← Kthehu te Tavolinat
        </button>
        <div>
          <h1>Tavolina {table.number}</h1>
          <p>Kapacitet: {table.capacity} persona</p>
        </div>
        <button onClick={handleCreateOrder} className="create-order-btn">
          + Krijo Porosi
        </button>
      </div>

      <div className="table-orders-content">
        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="loading">Duke ngarkuar porositë...</div>
        ) : (
          <>
            {orders.length === 0 ? (
              <div className="no-orders">
                <p>Nuk ka porosi për këtë tavolinë</p>
                <button onClick={handleCreateOrder} className="create-first-order-btn">
                  Krijo Porosi të Parë
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.orderId} className="order-card">
                    <div className="order-header">
                      <div>
                        <h3>Porosia #{order.orderId}</h3>
                        <p className="order-date">
                          {new Date(order.orderDate).toLocaleString('sq-AL')}
                        </p>
                      </div>
                      <div
                        className="order-status"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </div>
                    </div>

                    <div className="order-items">
                      <h4>Artikuj:</h4>
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <span className="item-name">{item.drinkName}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                          <span className="item-price">{item.total.toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-footer">
                      <div className="order-total">
                        Total: <strong>{order.totalAmount.toFixed(2)} €</strong>
                      </div>
                      <div className="order-actions">
                        {getStatusOptions(order.status).map((status) => (
                          <button
                            key={status}
                            onClick={() => handleUpdateStatus(order.orderId, status)}
                            className="status-btn"
                            style={{ backgroundColor: getStatusColor(status) }}
                          >
                            {status === 'Preparing' && 'Fillo Gatimin'}
                            {status === 'Served' && 'Shëno si Servuar'}
                            {status === 'Canceled' && 'Anulo'}
                            {status === 'Paid' && 'Shëno si Paguar'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showCreateModal && (
        <CreateOrderModal
          tableNumber={table.number}
          onClose={() => setShowCreateModal(false)}
          onOrderCreated={handleOrderCreated}
        />
      )}
    </div>
  );
};

export default TableOrders;

