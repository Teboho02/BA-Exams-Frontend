import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

interface LoginForm {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'teacher' | 'student';
    isActive: boolean;
  };
  accessToken?: string;
  refreshToken?: string;
  errors?: any[];
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.user && data.accessToken) {
        // Store auth data in localStorage
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken || '');
        localStorage.setItem('user', JSON.stringify(data.user));

        // Navigate based on user role
        switch (data.user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'teacher':
            navigate('/teacher');
            break;
          case 'student':
            navigate('/student');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your Educational Platform account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="register-prompt">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={handleRegisterRedirect}
              className="register-link"
            >
              Register here
            </button>
          </p>
          
          <div className="demo-accounts">
            <p className="demo-title">Demo Accounts:</p>
            <div className="demo-buttons">
              <button
                type="button"
                onClick={() => setFormData({ email: 'admin@demo.com', password: 'demo123' })}
                className="demo-button admin"
              >
                👨‍💼 Admin Demo
              </button>
              <button
                type="button"
                onClick={() => setFormData({ email: 'teacher@demo.com', password: 'demo123' })}
                className="demo-button teacher"
              >
                👨‍🏫 Teacher Demo
              </button>
              <button
                type="button"
                onClick={() => setFormData({ email: 'student@demo.com', password: 'demo123' })}
                className="demo-button student"
              >
                👨‍🎓 Student Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;