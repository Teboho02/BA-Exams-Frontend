import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css'
import { API_BASE_URL } from '../config/api';

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
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
  errors?: any[];
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  errors?: any[];
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginData, setLoginData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [registerError, setRegisterError] = useState<string>('');

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    if (loginError) setLoginError('');
  };

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
    if (registerError) setRegisterError('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data: LoginResponse = await response.json();

      console.log("The response/data is: ", data);

      if (data.success && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log("User data saved to localStorage:", data.user); 

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
        setLoginError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Network error. Please check your connection and try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Passwords do not match');
      setRegisterLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const data: RegisterResponse = await response.json();

      console.log("The register response/data is: ", data);

      if (data.success) {
        // Registration successful, show login form
        setShowRegister(false);
        setShowLogin(true);
        setRegisterData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        // You might want to show a success message here
      } else {
        setRegisterError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setRegisterError('Network error. Please check your connection and try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowRegister(false);
    setLoginError('');
    setRegisterError('');
  };

  const switchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
    setLoginError('');
  };

  const switchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
    setRegisterError('');
  };

  return (
    <div className="landing-page">
      {/* SEO Content - Hidden but accessible to search engines */}
      <div className="seo-content">
        <h1>Bethunana Academy Online Examinations - BA Online Tests</h1>
        <p>Official online testing platform for Bethunana Academy students. Take exams, view results, and track your academic progress.</p>
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div className="logo-text">
                <h1 className="logo-title">Bethunana Academy</h1>
                <p className="logo-subtitle">Online Examinations</p>
              </div>
            </div>
            <div className="header-buttons">
              <button
                onClick={() => setShowRegister(true)}
                className="btn-secondary"
              >
                Create Account
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="btn-primary"
              >
                Student Login
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Bethunana Academy
              <span className="hero-title-gradient">Online Examinations</span>
            </h1>
            <p className="hero-description">
              The official online testing platform for Bethunana Academy students. Access your examinations, 
              track your progress, and achieve academic excellence through our comprehensive digital learning environment.
            </p>
            <div className="hero-buttons">
              <button
                onClick={() => setShowLogin(true)}
                className="btn-hero-primary"
              >
                Access Online Tests
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </button>
              <a
                href="https://www.bethunanaacademy.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hero-secondary"
              >
                Visit Main Website
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">BA Online Testing Platform Features</h2>
            <p className="section-description">
              Experience seamless online examinations with our advanced testing platform designed for Bethunana Academy students.
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <h3 className="feature-title">Online Examinations</h3>
              <p className="feature-description">Take your exams securely online with our comprehensive testing system.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="7"/>
                  <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/>
                </svg>
              </div>
              <h3 className="feature-title">Instant Results</h3>
              <p className="feature-description">Get immediate feedback and results upon completing your examinations.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className="feature-title">Progress Tracking</h3>
              <p className="feature-description">Monitor your academic progress and performance across all subjects.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon indigo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <h3 className="feature-title">Course Management</h3>
              <p className="feature-description">Access all your courses and examination materials in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <h2 className="about-title">About Bethunana Academy Online Tests</h2>
              <p className="about-description">
                Bethunana Academy's online examination platform provides students with a secure, 
                reliable, and user-friendly environment to take their academic assessments. Our 
                digital testing system ensures academic integrity while offering the convenience 
                of remote examination access.
              </p>
              <p className="about-description">
                Whether you're taking semester exams, practice tests, or assessments, our platform 
                delivers a seamless experience that mirrors traditional examination standards while 
                leveraging modern technology for enhanced learning outcomes.
              </p>
              <button
                onClick={() => setShowLogin(true)}
                className="btn-about"
              >
                Start Your Examination
              </button>
            </div>
            <div className="about-visual">
              <div className="about-card">
                <div className="about-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <h3 className="about-card-title">Join BA Students</h3>
                <p className="about-card-description">
                  Access your online examinations and be part of Bethunana Academy's digital learning community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <div>
                  <h3 className="footer-brand-title">Bethunana Academy</h3>
                  <p className="footer-brand-subtitle">Online Examinations</p>
                </div>
              </div>
             
            </div>
            <div className="footer-links">
              <h4 className="footer-links-title">Quick Links</h4>
              <ul className="footer-links-list">
                <li><a href="#" className="footer-link">Student Portal</a></li>
                <li><a href="#" className="footer-link">Online Tests</a></li>
                <li><a href="#" className="footer-link">Results</a></li>
                <li><a href="https://www.bethunanaacademy.com/" className="footer-link">Main Website</a></li>
              </ul> 
            </div>
           
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2025 Bethunana Academy. All rights reserved. | Online Examinations Platform
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModals}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            
            <div className="modal-header">
              <div className="modal-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <h2 className="modal-title">Student Login</h2>
              <p className="modal-subtitle">Access your online examinations</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="login-email" className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginInputChange}
                    className="form-input"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="login-password" className="form-label">Password</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type="password"
                    id="login-password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginInputChange}
                    className="form-input"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              {loginError && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <span className="error-text">{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className={`submit-button ${loginLoading ? 'loading' : ''}`}
              >
                {loginLoading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign In to BA Portal'
                )}
              </button>
            </form>

            <div className="modal-footer">
              <p className="modal-footer-text">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={switchToRegister}
                  className="modal-link"
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content register-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModals}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            
            <div className="modal-header">
              <div className="modal-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <h2 className="modal-title">Create Account</h2>
              <p className="modal-subtitle">Join Bethunana Academy online platform</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={registerData.firstName}
                    onChange={handleRegisterInputChange}
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
                    value={registerData.lastName}
                    onChange={handleRegisterInputChange}
                    className="form-input"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-email" className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    id="register-email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterInputChange}
                    className="form-input"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-password" className="form-label">Password</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type="password"
                    id="register-password"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterInputChange}
                    className="form-input"
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterInputChange}
                    className="form-input"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              {registerError && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <span className="error-text">{registerError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={registerLoading}
                className={`submit-button ${registerLoading ? 'loading' : ''}`}
              >
                {registerLoading ? (
                  <>
                    <span className="spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="modal-footer">
              <p className="modal-footer-text">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="modal-link"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;