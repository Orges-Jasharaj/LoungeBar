import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import './SuperAdminDashboard.css';
import { orderApi, tableApi, userApi, paymentApi, reservationApi, shiftApi } from '../services/api';
import type { OrderResponseDto } from '../types/order';
import type { PaymentDto } from '../types/payment';
import type { ReservationDto } from '../types/reservation';
import type { ShiftDto } from '../types/shift';

const SuperAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'statistics'>('users');

  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string>('');
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalTables, setTotalTables] = useState<number>(0);
  const [statsLoaded, setStatsLoaded] = useState<boolean>(false);
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [shifts, setShifts] = useState<ShiftDto[]>([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchStatistics = async () => {
      if (statsLoaded) return;
      setLoadingStats(true);
      setStatsError('');
      try {
        const [ordersRes, tablesRes, usersRes, paymentsRes, reservationsRes, shiftsRes] = await Promise.all([
          orderApi.getAllOrders(),
          tableApi.getAllTables(),
          userApi.getAllUsers(),
          paymentApi.getAllPayments(),
          reservationApi.getAllReservations(),
          shiftApi.getAllShifts(),
        ]);

        if (!ordersRes.success || !ordersRes.data) {
          throw new Error(ordersRes.message || 'Failed to load orders');
        }
        if (!tablesRes.success || !tablesRes.data) {
          throw new Error(tablesRes.message || 'Failed to load tables');
        }
        if (!usersRes.success || !usersRes.data) {
          throw new Error(usersRes.message || 'Failed to load users');
        }
        if (!paymentsRes.success || !paymentsRes.data) {
          throw new Error(paymentsRes.message || 'Failed to load payments');
        }
        if (!reservationsRes.success || !reservationsRes.data) {
          throw new Error(reservationsRes.message || 'Failed to load reservations');
        }
        if (!shiftsRes.success || !shiftsRes.data) {
          throw new Error(shiftsRes.message || 'Failed to load shifts');
        }

        setOrders(ordersRes.data);
        setTotalTables(tablesRes.data.length);
        setTotalUsers(usersRes.data.length);
        setPayments(paymentsRes.data);
        setReservations(reservationsRes.data);
        setShifts(shiftsRes.data);
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

  const metrics = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalOrders: 0,
        totalRevenuePaid: 0,
        averageOrderValuePaid: 0,
        topDrinks: [] as Array<{ drinkId: number; drinkName: string; quantity: number }>,
        totalPayments: payments.length || 0,
        totalReservations: reservations.length || 0,
        activeShifts: (shifts || []).filter(s => !s.endTime).length,
      };
    }

    const paidOrders = orders.filter(
      (o) => (o.status || '').toLowerCase() === 'paid'
    );
    // Nëse porositë s'kanë status Paid ose totalAmount, përdor shumën e pagesave si fallback
    const revenueFromOrders = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const revenueFromPayments = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalRevenuePaid = revenueFromOrders > 0 ? revenueFromOrders : revenueFromPayments;
    const averageOrderValuePaid =
      paidOrders.length > 0 ? totalRevenuePaid / paidOrders.length : 0;

    const drinkCountMap = new Map<number, { drinkId: number; drinkName: string; quantity: number }>();
    for (const order of orders) {
      for (const item of order.items || []) {
        const existing = drinkCountMap.get(item.drinkId);
        if (existing) {
          existing.quantity += item.quantity || 0;
        } else {
          drinkCountMap.set(item.drinkId, {
            drinkId: item.drinkId,
            drinkName: item.drinkName,
            quantity: item.quantity || 0,
          });
        }
      }
    }
    const topDrinks = Array.from(drinkCountMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalOrders: orders.length,
      totalRevenuePaid,
      averageOrderValuePaid,
      topDrinks,
      totalPayments: payments.length || 0,
      totalReservations: reservations.length || 0,
      activeShifts: (shifts || []).filter(s => !s.endTime).length,
    };
  }, [orders, payments, reservations, shifts]);

  return (
    <div className="superadmin-dashboard">
      <div className="superadmin-header">
        <div className="header-content">
          <h1>SuperAdmin Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.displayName}!</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="superadmin-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
          <button
            className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            Statistics
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'users' && <UserManagement />}
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

              {!loadingStats && !statsError && (
                <>
                  <div className="statistics-layout">
                    <div className="stats-cards">
                      <div className="stat-card">
                        <div className="stat-title">Total Users</div>
                        <div className="stat-value">{totalUsers}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Total Tables</div>
                        <div className="stat-value">{totalTables}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Total Orders</div>
                        <div className="stat-value">{metrics.totalOrders}</div>
                        <div className="stat-hint">Note: currently based on the latest orders returned by API</div>
                      </div>
                      <div className="stat-card stat-card-accent">
                        <div className="stat-title">Revenue (Paid)</div>
                        <div className="stat-value">
                          € {metrics.totalRevenuePaid.toFixed(2)}
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Avg Order Value (Paid)</div>
                        <div className="stat-value">
                          € {metrics.averageOrderValuePaid.toFixed(2)}
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Payments</div>
                        <div className="stat-value">{metrics.totalPayments}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Reservations</div>
                        <div className="stat-value">{metrics.totalReservations}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Active Shifts</div>
                        <div className="stat-value">{metrics.activeShifts}</div>
                      </div>
                    </div>

                    <div className="panel top-drinks">
                      <div className="panel-header">
                        <h3>Top 5 Drinks</h3>
                        <span className="panel-subtitle">By quantity ordered</span>
                      </div>
                      {metrics.topDrinks.length === 0 ? (
                        <p className="muted">No data available.</p>
                      ) : (
                        <ol className="top-drinks-list">
                          {metrics.topDrinks.map((d) => (
                            <li key={d.drinkId} className="top-drink-item">
                              <span className="drink-rank" aria-hidden="true" />
                              <span className="drink-name">{d.drinkName || `Drink #${d.drinkId}`}</span>
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

export default SuperAdminDashboard;

