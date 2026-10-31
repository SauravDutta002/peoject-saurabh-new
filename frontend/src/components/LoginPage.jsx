import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertCircle, LogIn, School } from 'lucide-react';

export default function LoginPage() {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-icon">
            <School size={22} />
          </div>
          <div>
            <h1 className="auth-title">CU Faculty Portal</h1>
            <p className="auth-subtitle">Sign in to manage timetables and adjustments</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-field">
            <label className="field-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-text"
              placeholder="name@college.edu"
              required
              autoFocus
            />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-text"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
            <LogIn size={15} />
            <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
