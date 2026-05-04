import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import DynamicBackground from '../components/WiproCircle';

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/account/login', { username, password });
      localStorage.setItem('user', JSON.stringify(response.data));
      onLoginSuccess();
      navigate('/');
    } catch (err) {
      setError('Invalid credentials. Hint: admin / admin123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="lux-bg login-lux-bg" aria-hidden="true">
        <div className="lux-spotlight lux-spotlight-a" />
        <div className="lux-spotlight lux-spotlight-b" />
        <div className="lux-grain" />
      </div>
      <DynamicBackground />

      <div className="login-card-modern">
        <div className="login-header">
          <div className="login-logo-animated">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </div>
          <h2>Welcome to Aurum Gold</h2>
          <p>Login to access your showroom dashboard</p>
        </div>

        {error && <div className="login-error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form-dynamic">
          <div className="form-group-modern">
            <label>Username</label>
            <div className="input-with-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input 
                type="text" 
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group-modern">
            <label>Password</label>
            <div className="input-with-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-signin-modern" disabled={loading}>
            <span className="btn-text">{loading ? 'Verifying...' : 'Sign In'}</span>
            {!loading && <div className="btn-glow"></div>}
          </button>
        </form>

        <div className="login-footer">
          <span>Forgot password? Contact Support</span>
        </div>
      </div>
    </div>
  );
}
