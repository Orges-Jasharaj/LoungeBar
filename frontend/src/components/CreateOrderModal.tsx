import React, { useState, useEffect } from 'react';
import { orderApi, menuItemApi } from '../services/api';
import type { MenuItemDto } from '../types/menuItem';
import type { CreateOrderItemRequestDto } from '../types/order';
import './CreateOrderModal.css';

interface CreateOrderModalProps {
  tableNumber: number;
  onClose: () => void;
  onOrderCreated: () => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  tableNumber,
  onClose,
  onOrderCreated,
}) => {
  const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
  const [orderItems, setOrderItems] = useState<CreateOrderItemRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const response = await menuItemApi.getAll();
      if (response.success && response.data) {
        setMenuItems(response.data.filter((row) => row.isAvailable));
      }
    } catch (err: any) {
      setError(err.message || 'Error loading menu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (menuItemId: number) => {
    const existingItem = orderItems.find((item) => item.menuItemId === menuItemId);
    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems([...orderItems, { menuItemId, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (menuItemId: number) => {
    const existingItem = orderItems.find((item) => item.menuItemId === menuItemId);
    if (existingItem && existingItem.quantity > 1) {
      setOrderItems(
        orderItems.map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    } else {
      setOrderItems(orderItems.filter((item) => item.menuItemId !== menuItemId));
    }
  };

  const getItemQuantity = (menuItemId: number) => {
    const item = orderItems.find((item) => item.menuItemId === menuItemId);
    return item ? item.quantity : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      setError('Please add at least one item');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const response = await orderApi.createOrder({
        tableNumber,
        items: orderItems,
      });

      if (response.success) {
        onOrderCreated();
      } else {
        setError(response.message || 'Failed to create order');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating order');
    } finally {
      setSubmitting(false);
    }
  };

  const getTotalPrice = () => {
    return orderItems.reduce((total, item) => {
      const row = menuItems.find((d) => d.id === item.menuItemId);
      return total + (row ? row.price * item.quantity : 0);
    }, 0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Order for Table {tableNumber}</h2>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {loading ? (
              <div className="loading">Loading menu...</div>
            ) : (
              <>
                <div className="drinks-section">
                  <h3>Menu</h3>
                  <div className="drinks-grid">
                    {menuItems.map((row) => {
                      const quantity = getItemQuantity(row.id);
                      return (
                        <div key={row.id} className="drink-card">
                          <div className="drink-info">
                            <div className="drink-name">{row.name}</div>
                            <div className="drink-category">{row.categoryName}</div>
                            <div className="drink-price">{row.price.toFixed(2)} €</div>
                          </div>
                          <div className="drink-actions">
                            {quantity > 0 && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(row.id)}
                                  className="quantity-btn"
                                >
                                  −
                                </button>
                                <span className="quantity">{quantity}</span>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => handleAddItem(row.id)}
                              className="add-btn"
                            >
                              {quantity > 0 ? '+' : 'Add'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {orderItems.length > 0 && (
                  <div className="order-summary">
                    <h3>Order Summary</h3>
                    <div className="summary-items">
                      {orderItems.map((item) => {
                        const row = menuItems.find((d) => d.id === item.menuItemId);
                        if (!row) return null;
                        return (
                          <div key={item.menuItemId} className="summary-item">
                            <span>{row.name} x{item.quantity}</span>
                            <span>{(row.price * item.quantity).toFixed(2)} €</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="summary-total">
                      <strong>Total: {getTotalPrice().toFixed(2)} €</strong>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || orderItems.length === 0}
              className="submit-btn"
            >
              {submitting ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderModal;

