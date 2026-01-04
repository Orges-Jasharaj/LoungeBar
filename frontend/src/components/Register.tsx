import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validimi
    if (formData.password !== formData.confirmPassword) {
      setError('Fjalëkalimet nuk përputhen');
      return;
    }

    if (formData.password.length < 6) {
      setError('Fjalëkalimi duhet të jetë të paktën 6 karaktere');
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        email: formData.email,
        password: formData.password,
      });
      // Pas regjistrimit të suksesshëm, navigo në login
      navigate('/login', { state: { message: 'Regjistrimi u krye me sukses! Ju lutem kyçuni.' } });
    } catch (err: any) {
      setError(err.message || 'Regjistrimi dështoi. Ju lutem provoni përsëri.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Regjistrohu në LoungeBar</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">Emri</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="shkruaj emrin tënd"
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Mbiemri</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="shkruaj mbiemrin tënd"
            />
          </div>
          <div className="form-group">
            <label htmlFor="dateOfBirth">Data e lindjes</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="shkruaj email-in tënd"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Fjalëkalimi</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="minimum 6 karaktere"
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Konfirmo fjalëkalimin</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="përsërit fjalëkalimin"
            />
          </div>
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Duke u regjistruar...' : 'Regjistrohu'}
          </button>
        </form>
        <p className="auth-link">
          Tashmë ke llogari? <Link to="/login">Kyçu këtu</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

