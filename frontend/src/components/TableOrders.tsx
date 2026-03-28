import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api';
import { signalRService } from '../services/signalR';
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
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderApi.getOrdersByTable(table.id, page, pageSize);
      if (response.success && response.data) {
        setOrders(response.data.items);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.message || 'Failed to load orders');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();

    // Setup SignalR connection for real-time updates
    const setupSignalR = async () => {
      try {
        await signalRService.startOrderConnection();

        // Listen for new orders for this table
        const handleOrderCreated = (order: OrderResponseDto) => {
          if (order.tableId === table.id) {
            // If we're on page 1, reload to show the new order
            if (page === 1) {
              void loadOrders();
            }
            onOrderUpdated();
          }
        };

        // Listen for order updates for this table
        const handleOrderUpdated = (order: OrderResponseDto) => {
          if (order.tableId === table.id) {
            // Update the order in the list if it exists
            setOrders(prevOrders => {
              const index = prevOrders.findIndex(o => o.orderId === order.orderId);
              if (index !== -1) {
                const updated = [...prevOrders];
                updated[index] = order;
                return updated;
              }
              // If order not in current page, reload
              void loadOrders();
              return prevOrders;
            });
            onOrderUpdated();
          }
        };

        // Listen for order status changes for this table
        const handleOrderStatusChanged = (orderId: number, status: string, tableId: number) => {
          if (tableId === table.id) {
            // Update the order status in the list
            setOrders(prevOrders => {
              const index = prevOrders.findIndex(o => o.orderId === orderId);
              if (index !== -1) {
                const updated = [...prevOrders];
                updated[index] = { ...updated[index], status };
                return updated;
              }
              // If order not in current page, reload
              void loadOrders();
              return prevOrders;
            });
            onOrderUpdated();
          }
        };

        signalRService.onOrderCreated(handleOrderCreated);
        signalRService.onOrderUpdated(handleOrderUpdated);
        signalRService.onOrderStatusChanged(handleOrderStatusChanged);

        return () => {
          signalRService.offOrderCreated(handleOrderCreated);
          signalRService.offOrderUpdated(handleOrderUpdated);
          signalRService.offOrderStatusChanged(handleOrderStatusChanged);
        };
      } catch (err) {
        console.error('Failed to setup SignalR for orders:', err);
        // Continue without SignalR
      }
    };

    const cleanup = setupSignalR();

    return () => {
      void cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [table.id, page]);

  const handleCreateOrder = () => {
    setShowCreateModal(true);
  };

  const handleOrderCreated = () => {
    setShowCreateModal(false);
    setPage(1); // Reset to first page when new order is created
    loadOrders();
    onOrderUpdated();
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handleUpdateStatus = async (orderId: number, status: OrderStatus) => {
    try {
      const response = await orderApi.updateOrderStatus(orderId, status);
      if (response.success) {
        await loadOrders();
      } else {
        setError(response.message || 'Failed to update status');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating status');
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
          ← Back to Tables
        </button>
        <div>
          <h1>Table {table.number}</h1>
          <p>Capacity: {table.capacity} people</p>
        </div>
        <button onClick={handleCreateOrder} className="create-order-btn">
          + Create Order
        </button>
      </div>

      <div className="table-orders-content">
        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : (
          <>
            {orders.length === 0 ? (
              <div className="no-orders">
                <p>No orders for this table</p>
                <button onClick={handleCreateOrder} className="create-first-order-btn">
                  Create First Order
                </button>
              </div>
            ) : (
              <>
                <div className="orders-list">
                  {orders.map((order) => (
                  <div key={order.orderId} className="order-card">
                    <div className="order-header">
                      <div>
                        <h3>Order #{order.orderId}</h3>
                        <p className="order-date">
                          {new Date(order.orderDate).toLocaleString('en-US')}
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
                      <h4>Items:</h4>
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <span className="item-name">{item.menuItemName}</span>
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
                            {status === 'Preparing' && 'Start Preparing'}
                            {status === 'Served' && 'Mark as Served'}
                            {status === 'Canceled' && 'Cancel'}
                            {status === 'Paid' && 'Mark as Paid'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={handlePreviousPage}
                      disabled={page === 1}
                      className="pagination-btn"
                    >
                      ← Previous
                    </button>
                    <span className="pagination-info">
                      Page {page} of {totalPages} (Total: {totalCount} orders)
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={page === totalPages}
                      className="pagination-btn"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
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

