import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tableApi } from '../services/api';
import type { TableDto } from '../types/table';
import TableOrders from './TableOrders';
import './WaiterDashboard.css';

const WaiterDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [tables, setTables] = useState<TableDto[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await tableApi.getAllTables();
      if (response.isSuccess && response.data) {
        setTables(response.data);
      } else {
        setError(response.message || 'Dështoi ngarkimi i tavolinave');
      }
    } catch (err: any) {
      setError(err.message || 'Gabim në ngarkimin e tavolinave');
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = (table: TableDto) => {
    setSelectedTable(table);
  };

  const handleBackToTables = () => {
    setSelectedTable(null);
  };

  if (selectedTable) {
    return (
      <TableOrders
        table={selectedTable}
        onBack={handleBackToTables}
        onOrderUpdated={loadTables}
      />
    );
  }

  return (
    <div className="waiter-dashboard">
      <div className="waiter-header">
        <div>
          <h1>Dashboard i Kamerierit</h1>
          <p>Mirë se vini, {user?.displayName}!</p>
        </div>
        <button onClick={logout} className="logout-btn">
          Dil
        </button>
      </div>

      <div className="waiter-content">
        {error && <div className="error-banner">{error}</div>}
        
        {loading ? (
          <div className="loading">Duke ngarkuar tavolinat...</div>
        ) : (
          <>
            <div className="tables-header">
              <h2>Tavolinat</h2>
              <button onClick={loadTables} className="refresh-btn">
                Rifresko
              </button>
            </div>
            <div className="tables-grid">
              {tables.length === 0 ? (
                <div className="no-tables">Nuk ka tavolina të disponueshme</div>
              ) : (
                tables.map((table) => (
                  <div
                    key={table.id}
                    className="table-card"
                    onClick={() => handleTableClick(table)}
                  >
                    <div className="table-number">Tavolina {table.number}</div>
                    <div className="table-info">
                      <div className="table-capacity">
                        Kapacitet: {table.capacity} persona
                      </div>
                      <div className="table-orders">
                        Porosi totale: {table.totalOrders}
                      </div>
                    </div>
                    <div className="table-click-hint">Kliko për të parë porositë</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WaiterDashboard;

