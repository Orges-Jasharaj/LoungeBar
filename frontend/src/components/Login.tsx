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
      // Kontrollo rolin dhe redirecto në dashboard-in e duhur
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        // Nëse ka rol Employee, shko te waiter dashboard
        // Kontrollo edhe për variacione të mundshme të emrit të rolit
        const hasEmployeeRole = user.roles && Array.isArray(user.roles) && (
          user.roles.includes('Employee') || 
          user.roles.includes('EMPLOYEE') || 
          user.roles.some((role: string) => role && role.toLowerCase() === 'employee')
        );
        if (hasEmployeeRole) {
          navigate('/waiter', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Email ose fjalëkalimi i gabuar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Kyçu në LoungeBar</h2>
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
              placeholder="shkruaj email-in tënd"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Fjalëkalimi</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="shkruaj fjalëkalimin"
            />
          </div>
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Duke u kyçur...' : 'Kyçu'}
          </button>
        </form>
        <p className="auth-link">
          Nuk ke llogari? <Link to="/register">Regjistrohu këtu</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

