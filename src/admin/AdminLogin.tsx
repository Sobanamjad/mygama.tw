import { useState } from 'react';
import { adminAuth } from '../services/adminService';
import './admin.css';

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = adminAuth.login(username, password);
    if (result.success) {
      onLogin();
    } else {
      setError(result.error || '登入失敗，請檢查帳號密碼');
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <span className="admin-login-icon"></span>
          <h1>管理員登入</h1>
          <p>請輸入您的管理員帳號與密碼</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label>帳號</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="請輸入帳號"
              required
              disabled={loading}
            />
          </div>
          
          <div className="admin-form-group">
            <label>密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="admin-error">{error}</div>}
          
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? '登入中...' : '登入管理系統'}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>預設帳號: <strong>admin</strong></p>
          <p>預設密碼: <strong>admin123</strong></p>
        </div>
      </div>
    </div>
  );
}