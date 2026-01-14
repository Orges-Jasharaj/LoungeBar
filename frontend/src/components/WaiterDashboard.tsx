import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tableApi } from '../services/api';
import type { TableDto } from '../types/table';
import TableOrders from './TableOrders';
import Chat from './Chat';
import './WaiterDashboard.css';

const WaiterDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'tables' | 'chat'>('tables');
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
      if (response.success && response.data) {
        setTables(response.data);
      } else {
        setError(response.message || 'Failed to load tables');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading tables');
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

  // Nëse ka table të zgjedhur, shfaq TableOrders (vetëm për tab-in tables)
  if (selectedTable && activeTab === 'tables') {
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
          <h1>Waiter Dashboard</h1>
          <p>Welcome, {user?.displayName}!</p>
        </div>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="waiter-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'tables' ? 'active' : ''}`}
            onClick={() => setActiveTab('tables')}
          >
            Tables
          </button>
          <button
            className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'tables' && (
            <>
              {error && <div className="error-banner">{error}</div>}
              
              {loading ? (
                <div className="loading">Loading tables...</div>
              ) : (
                <>
                  <div className="tables-header">
                    <h2>Tables</h2>
                    <button onClick={loadTables} className="refresh-btn">
                      Refresh
                    </button>
                  </div>
                  <div className="tables-grid">
                    {tables.length === 0 ? (
                      <div className="no-tables">No tables available</div>
                    ) : (
                      tables.map((table) => (
                        <div
                          key={table.id}
                          className="table-card"
                          onClick={() => handleTableClick(table)}
                        >
                          <div className="table-number">Table {table.number}</div>
                          <div className="table-info">
                            <div className="table-capacity">
                              Capacity: {table.capacity} people
                            </div>
                            <div className="table-orders">
                              Total orders: {table.totalOrders}
                            </div>
                          </div>
                          <div className="table-click-hint">Click to view orders</div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </>
          )}
          {activeTab === 'chat' && <Chat />}
        </div>
      </div>
    </div>
  );
};

export default WaiterDashboard;

