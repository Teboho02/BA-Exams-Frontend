import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'teacher' | 'student';
}

const Layout: React.FC<LayoutProps> = ({ children, role }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Clear all stored auth info
  const clearAuthStorage = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.clear();
  };

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');

      if (!accessToken || !user) {
        setIsAuthenticated(false);
        clearAuthStorage();
        navigate('/login', { replace: true });
        return;
      }

      try {
        const userData = JSON.parse(user);
        if (!userData.id || !userData.role) {
          throw new Error('Invalid user data');
        }
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error parsing user data:', err);
        clearAuthStorage();
        navigate('/login', { replace: true });
      }
    };

    checkAuth();
    setIsLoading(false);

    // Re-check every 5 minutes
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  const getRoleColor = (): string => {
    switch (role) {
      case 'admin':
        return '#e74c3c';
      case 'teacher':
        return '#3498db';
      case 'student':
        return '#2ecc71';
      default:
        return '#95a5a6';
    }
  };

  const handleSignOut = () => {
    clearAuthStorage();
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const goBack = () => navigate(-1);

  if (isLoading) {
    return (
      <div className="layout">
        <div className="loading-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px'
        }}>
          <div>Checking authentication...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Prevent flicker before redirect
  }

  return (
    <div className="layout">
      <nav className="navbar" style={{ backgroundColor: getRoleColor() }}>
        <div className="nav-left">
          <button className="back-arrow" onClick={goBack} aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg"
              width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <Link to="/" className="nav-brand">
            <span className="brand-full">Bethunana Academy Online Examinations</span>
            <span className="brand-abbreviated">BA Online Examinations</span>
          </Link>
        </div>
        <div className="nav-right">
          <span className="role-indicator">{role.toUpperCase()}</span>
          <div className="menu-container">
            <button className="hamburger-menu" onClick={toggleMenu} aria-label="Toggle menu">
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
            {isMenuOpen && (
              <div className="dropdown-menu">
                <button className="menu-item sign-out" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <div className="content">{children}</div>
    </div>
  );
};

export default Layout;
