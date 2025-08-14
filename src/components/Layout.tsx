import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'teacher' | 'student';
}

// Cookie utility functions
const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict;Secure`;
};

const clearAuthCookies = () => {
  deleteCookie('accessToken');
  deleteCookie('refreshToken');
  deleteCookie('user');
};

const Layout: React.FC<LayoutProps> = ({ children, role }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication on component mount and set up periodic checks
  useEffect(() => {
    const checkAuthAndRedirect = () => {
      const accessToken = getCookie('accessToken');
      const user = getCookie('user');
      
      if (!accessToken || !user) {
        // No valid session found
        setIsAuthenticated(false);
        clearAuthCookies();
        navigate('/login', { replace: true });
        return false;
      }

      try {
        // Validate user data
        const userData = JSON.parse(user);
        if (!userData.id || !userData.role) {
          throw new Error('Invalid user data');
        }
        
        // If user is authenticated, redirect to their role-specific dashboard
        setIsAuthenticated(true);
        
        // Always redirect authenticated users to their dashboard
        switch (userData.role) {
          case 'admin':
            navigate('/admin', { replace: true });
            break;
          case 'teacher':
            navigate('/teacher/courses', { replace: true });
            break;
          case 'student':
            navigate('/student/courses', { replace: true });
            break;
          default:
            navigate('/dashboard', { replace: true });
        }
        
        return true;
      } catch (error) {
        console.error('Error parsing user cookie:', error);
        setIsAuthenticated(false);
        clearAuthCookies();
        navigate('/login', { replace: true });
        return false;
      }
    };

    // Initial auth check and redirect
    const isValid = checkAuthAndRedirect();
    setIsLoading(false);

    // Set up periodic auth checks (every 5 minutes)
    const authCheckInterval = setInterval(() => {
      const accessToken = getCookie('accessToken');
      const user = getCookie('user');
      
      if (!accessToken || !user) {
        clearAuthCookies();
        navigate('/login', { replace: true });
      }
    }, 5 * 60 * 1000);

    // Cleanup interval on unmount
    return () => clearInterval(authCheckInterval);
  }, [navigate, role]);

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
    // Clear authentication cookies
    clearAuthCookies();
    
    // Also clear localStorage and sessionStorage as backup
    localStorage.clear();
    sessionStorage.clear();
    
    // Update state
    setIsAuthenticated(false);
    
    // Redirect to login page
    navigate('/login', { replace: true });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const goBack = () => {
    navigate(-1);
  };

  // Show loading spinner while checking authentication
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

  // Don't render content if not authenticated (will be redirected)
  if (!isAuthenticated) {
    return null;
  }

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
            <span className="brand-full">Bethunana Academy Online Examinations</span>
            <span className="brand-abbreviated">BA Online Examinations</span>
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