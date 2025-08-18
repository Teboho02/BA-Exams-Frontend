import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Layout.css';
import { API_BASE_URL } from '../config/api'; 
interface LayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'teacher' | 'student';
}

interface RegistrationRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  courseId: string;
  requestedAt: string;
}

const Layout: React.FC<LayoutProps> = ({ children, role }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Clear all stored auth info
  const clearAuthStorage = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.clear();
  };

  // Fetch registration requests for teachers
  const fetchRegistrationRequests = async () => {
    if (role !== 'teacher') return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(API_BASE_URL+'/api/courses/registration-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const requests = await response.json();
        setRegistrationRequests(requests);
        
        // Count unread requests (assuming you have a mechanism to track read status)
        const unread = requests.filter((req: RegistrationRequest) => 
          !localStorage.getItem(`request_read_${req.id}`)
        );
        setUnreadCount(unread.length);
      }
    } catch (error) {
      console.error('Error fetching registration requests:', error);
    }
  };

  // Handle approval/rejection of registration requests
  const handleRegistrationAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/teacher/registration-requests/${requestId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Remove the request from the list
        setRegistrationRequests(prev => prev.filter(req => req.id !== requestId));
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Show success message
        const message = action === 'approve' ? 'Student approved successfully!' : 'Student request rejected.';
        // You can implement a toast notification system here
        console.log(message);
      }
    } catch (error) {
      console.error(`Error ${action}ing registration request:`, error);
    }
  };

  // Mark notification as read
  const markAsRead = (requestId: string) => {
    localStorage.setItem(`request_read_${requestId}`, 'true');
    setUnreadCount(prev => Math.max(0, prev - 1));
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

  // Polling for registration requests every 5 minutes for teachers
  useEffect(() => {
    if (role === 'teacher' && isAuthenticated) {
      fetchRegistrationRequests();
      
      const registrationPolling = setInterval(() => {
        fetchRegistrationRequests();
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearInterval(registrationPolling);
    }
  }, [role, isAuthenticated]);

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
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Mark all as read when opening notifications
      registrationRequests.forEach(req => markAsRead(req.id));
    }
  };
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
            <span className="brand-full">BA Online Examinations</span>
            <span className="brand-abbreviated">Bethunana Academy Online Examinations</span>
          </Link>
        </div>
        <div className="nav-right">
          <span className="role-indicator">{role.toUpperCase()}</span>
          
          {/* Notification Bell for Teachers */}
          {role === 'teacher' && (
            <div className="notification-container">
              <button 
                className="notification-bell" 
                onClick={toggleNotifications}
                aria-label="Registration requests"
              >
                <svg xmlns="http://www.w3.org/2000/svg"
                  width="20" height="20" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="notifications-header">
                    <h4>Registration Requests</h4>
                  </div>
                  <div className="notifications-content">
                    {registrationRequests.length === 0 ? (
                      <div className="no-notifications">
                        No pending registration requests
                      </div>
                    ) : (
                      registrationRequests.map((request) => (
                        <div key={request.id} className="notification-item">
                          <div className="notification-info">
                            <strong>{request.studentName}</strong>
                            <div className="notification-details">
                              <span>{request.studentEmail}</span>
                              <br />
                              <span>Course: {request.courseName}</span>
                              <br />
                              <small>{new Date(request.requestedAt).toLocaleString()}</small>
                            </div>
                          </div>
                          <div className="notification-actions">
                            <button 
                              className="approve-btn"
                              onClick={() => handleRegistrationAction(request.id, 'approve')}
                            >
                              ✓ Approve
                            </button>
                            <button 
                              className="reject-btn"
                              onClick={() => handleRegistrationAction(request.id, 'reject')}
                            >
                              ✗ Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
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