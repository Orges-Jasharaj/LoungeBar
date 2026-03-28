import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as any)?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      // Check role and redirect to appropriate dashboard
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        
        const hasSuperAdminRole = user.roles && Array.isArray(user.roles) && (
          user.roles.includes('SuperAdmin') || 
          user.roles.includes('SUPERADMIN') || 
          user.roles.some((role: string) => role && role.toLowerCase() === 'superadmin')
        );

        const hasCookerRole = user.roles && Array.isArray(user.roles) && (
          user.roles.includes('Cooker') ||
          user.roles.some((role: string) => role && role.toLowerCase() === 'cooker')
        );

        const hasBartenderRole = user.roles && Array.isArray(user.roles) && (
          user.roles.includes('Bartender') ||
          user.roles.some((role: string) => role && role.toLowerCase() === 'bartender')
        );

        const hasEmployeeRole = user.roles && Array.isArray(user.roles) && (
          user.roles.includes('Employee') || 
          user.roles.includes('EMPLOYEE') || 
          user.roles.some((role: string) => role && role.toLowerCase() === 'employee')
        );

        const hasManagerRole = user.roles && Array.isArray(user.roles) && (
          user.roles.includes('Admin') || 
          user.roles.includes('ADMIN') || 
          user.roles.some((role: string) => role && role.toLowerCase() === 'admin')
        );

        if (hasSuperAdminRole) {
          navigate('/superadmin', { replace: true });
        } else if (hasCookerRole) {
          navigate('/kitchen', { replace: true });
        } else if (hasBartenderRole) {
          navigate('/bar', { replace: true });
        } else if (hasEmployeeRole) {
          navigate('/waiter', { replace: true });
        } else if (hasManagerRole) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to LoungeBar</h2>
        {successMessage && <div className="success-message">{successMessage}</div>}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

