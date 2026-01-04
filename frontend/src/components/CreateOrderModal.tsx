import React, { useState, useEffect } from 'react';
import { orderApi, drinkApi } from '../services/api';
import type { DrinkDto } from '../types/drink';
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
  const [drinks, setDrinks] = useState<DrinkDto[]>([]);
  const [orderItems, setOrderItems] = useState<CreateOrderItemRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDrinks();
  }, []);

  const loadDrinks = async () => {
    try {
      setLoading(true);
      const response = await drinkApi.getAllDrinks();
      if (response.isSuccess && response.data) {
        setDrinks(response.data.filter((drink) => drink.isAvailable));
      }
    } catch (err: any) {
      setError(err.message || 'Gabim në ngarkimin e pijeve');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (drinkId: number) => {
    const existingItem = orderItems.find((item) => item.drinkId === drinkId);
    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.drinkId === drinkId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems([...orderItems, { drinkId, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (drinkId: number) => {
    const existingItem = orderItems.find((item) => item.drinkId === drinkId);
    if (existingItem && existingItem.quantity > 1) {
      setOrderItems(
        orderItems.map((item) =>
          item.drinkId === drinkId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    } else {
      setOrderItems(orderItems.filter((item) => item.drinkId !== drinkId));
    }
  };

  const getItemQuantity = (drinkId: number) => {
    const item = orderItems.find((item) => item.drinkId === drinkId);
    return item ? item.quantity : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      setError('Ju lutem shtoni të paktën një artikull');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const response = await orderApi.createOrder({
        tableNumber,
        items: orderItems,
      });

      if (response.isSuccess) {
        onOrderCreated();
      } else {
        setError(response.message || 'Dështoi krijimi i porosisë');
      }
    } catch (err: any) {
      setError(err.message || 'Gabim në krijimin e porosisë');
    } finally {
      setSubmitting(false);
    }
  };

  const getTotalPrice = () => {
    return orderItems.reduce((total, item) => {
      const drink = drinks.find((d) => d.id === item.drinkId);
      return total + (drink ? drink.price * item.quantity : 0);
    }, 0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Krijo Porosi për Tavolinë {tableNumber}</h2>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {loading ? (
              <div className="loading">Duke ngarkuar pijet...</div>
            ) : (
              <>
                <div className="drinks-section">
                  <h3>Pijet e Disponueshme</h3>
                  <div className="drinks-grid">
                    {drinks.map((drink) => {
                      const quantity = getItemQuantity(drink.id);
                      return (
                        <div key={drink.id} className="drink-card">
                          <div className="drink-info">
                            <div className="drink-name">{drink.name}</div>
                            <div className="drink-category">{drink.categoryName}</div>
                            <div className="drink-price">{drink.price.toFixed(2)} €</div>
                          </div>
                          <div className="drink-actions">
                            {quantity > 0 && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(drink.id)}
                                  className="quantity-btn"
                                >
                                  −
                                </button>
                                <span className="quantity">{quantity}</span>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => handleAddItem(drink.id)}
                              className="add-btn"
                            >
                              {quantity > 0 ? '+' : 'Shto'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {orderItems.length > 0 && (
                  <div className="order-summary">
                    <h3>Përmbledhje e Porosisë</h3>
                    <div className="summary-items">
                      {orderItems.map((item) => {
                        const drink = drinks.find((d) => d.id === item.drinkId);
                        if (!drink) return null;
                        return (
                          <div key={item.drinkId} className="summary-item">
                            <span>{drink.name} x{item.quantity}</span>
                            <span>{(drink.price * item.quantity).toFixed(2)} €</span>
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
              Anulo
            </button>
            <button
              type="submit"
              disabled={submitting || orderItems.length === 0}
              className="submit-btn"
            >
              {submitting ? 'Duke krijuar...' : 'Krijo Porosi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderModal;

