import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css'; // Assuming you'll reuse the same CSS

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface RegisterResponse {
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

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
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
      const response = await fetch(API_BASE_URL + '/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: RegisterResponse = await response.json();

      if (data.success && data.user) {
        // For registration, tokens are returned in response body
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken || '');
        }
        localStorage.setItem('user', JSON.stringify(data.user));

        // Navigate based on user role
        switch (data.user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'teacher':
            navigate('/teacher/courses');
            break;
          case 'student':
            navigate('/student/courses');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Create Account</h1>
          <p className="login-subtitle">Join our Educational Platform today</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your first name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName" className="form-label">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your last name"
              required
            />
          </div>

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
              placeholder="Create a password"
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
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="register-prompt">
            Already have an account?{' '}
            <button
              type="button"
              onClick={handleLoginRedirect}
              className="register-link"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;