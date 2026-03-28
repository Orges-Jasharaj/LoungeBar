import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ReservationManagement from './ReservationManagement';
import Chat from './Chat';
import TableManagement from './TableManagement';
import DrinksManagement from './DrinksManagement';
import './AdminDashboard.css';
import { statisticsApi } from '../services/api';
import type { StatisticsOverviewDto, TopMenuItemDto } from '../types/statistics';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'reservations' | 'statistics' | 'chat' | 'tables' | 'drinks'>('reservations');

  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string>('');
  const [statsLoaded, setStatsLoaded] = useState<boolean>(false);
  const [overview, setOverview] = useState<StatisticsOverviewDto | null>(null);
  const [topMenuItems, setTopMenuItems] = useState<TopMenuItemDto[]>([]);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (statsLoaded) return;
      setLoadingStats(true);
      setStatsError('');
      try {
        const [overviewRes, topItemsRes] = await Promise.all([
          statisticsApi.getOverview(),
          statisticsApi.getTopMenuItems(5),
        ]);

        if (!overviewRes.success || !overviewRes.data) {
          throw new Error(overviewRes.message || 'Failed to load statistics overview');
        }
        if (!topItemsRes.success || !topItemsRes.data) {
          throw new Error(topItemsRes.message || 'Failed to load top menu items');
        }

        setOverview(overviewRes.data);
        setTopMenuItems(topItemsRes.data);
        setStatsLoaded(true);
      } catch (err: any) {
        setStatsError(err?.message || 'Error loading statistics');
      } finally {
        setLoadingStats(false);
      }
    };

    if (activeTab === 'statistics') {
      void fetchStatistics();
    }
  }, [activeTab, statsLoaded]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.displayName}!</span>
            <Link to="/profile" className="profile-link">My Account</Link>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservations')}
          >
            Reservations
          </button>
          <button
            className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            Statistics
          </button>
          <button
            className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
          <button
            className={`tab ${activeTab === 'tables' ? 'active' : ''}`}
            onClick={() => setActiveTab('tables')}
          >
            Tables
          </button>
          <button
            className={`tab ${activeTab === 'drinks' ? 'active' : ''}`}
            onClick={() => setActiveTab('drinks')}
          >
            Drinks
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'reservations' && <ReservationManagement />}
          {activeTab === 'chat' && <Chat />}
          {activeTab === 'tables' && <TableManagement />}
          {activeTab === 'drinks' && <DrinksManagement />}
          {activeTab === 'statistics' && (
            <div className="statistics-section">
              <div className="statistics-header">
                <div>
                  <h2>Statistics</h2>
                  <p className="statistics-subtitle">
                    Quick overview of system activity (orders, revenue, payments, reservations, shifts).
                  </p>
                </div>
              </div>

              {loadingStats && (
                <div className="stats-loading">
                  <div className="skeleton-line" />
                  <div className="skeleton-grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="skeleton-card" />
                    ))}
                  </div>
                </div>
              )}
              {statsError && <div className="error-banner">{statsError}</div>}

              {!loadingStats && !statsError && overview && (
                <>
                  <div className="statistics-layout">
                    <div className="stats-cards">
                      <div className="stat-card">
                        <div className="stat-title">Total Users</div>
                        <div className="stat-value">{overview.totalUsers}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Total Tables</div>
                        <div className="stat-value">{overview.totalTables}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Total Orders</div>
                        <div className="stat-value">{overview.totalOrders}</div>
                      </div>
                      <div className="stat-card stat-card-accent">
                        <div className="stat-title">Revenue (Paid)</div>
                        <div className="stat-value">
                          € {overview.revenuePaid.toFixed(2)}
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Avg Order Value (Paid)</div>
                        <div className="stat-value">
                          € {overview.averageOrderValuePaid.toFixed(2)}
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Payments</div>
                        <div className="stat-value">{overview.paymentsCount}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Reservations</div>
                        <div className="stat-value">{overview.reservationsCount}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Active Shifts</div>
                        <div className="stat-value">{overview.activeShifts}</div>
                      </div>
                    </div>

                    <div className="panel top-drinks">
                      <div className="panel-header">
                        <h3>Top 5 menu items</h3>
                        <span className="panel-subtitle">By quantity ordered</span>
                      </div>
                      {topMenuItems.length === 0 ? (
                        <p className="muted">No data available.</p>
                      ) : (
                        <ol className="top-drinks-list">
                          {topMenuItems.map((d) => (
                            <li key={d.menuItemId} className="top-drink-item">
                              <span className="drink-rank" aria-hidden="true" />
                              <span className="drink-name">{d.menuItemName || `Item #${d.menuItemId}`}</span>
                              <span className="drink-qty">x{d.quantity}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;