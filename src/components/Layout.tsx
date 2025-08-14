import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'teacher' | 'student';
}

const Layout: React.FC<LayoutProps> = ({ children, role }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

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
    // Clear all cookies
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to login page
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="layout">
      <nav className="navbar" style={{ backgroundColor: getRoleColor() }}>
        <div className="nav-left">
          <button 
            className="back-arrow" 
            onClick={goBack}
            aria-label="Go back"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <Link to="/" className="nav-brand">
            Bethunana Academy Online Examinations
          </Link>
        </div>
        <div className="nav-right">
          <span className="role-indicator">{role.toUpperCase()}</span>
          <div className="menu-container">
            <button 
              className="hamburger-menu" 
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
            {isMenuOpen && (
              <div className="dropdown-menu">
                <button 
                  className="menu-item sign-out"
                  onClick={handleSignOut}
                >
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