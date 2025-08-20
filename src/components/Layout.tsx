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
  courseTitle: string;  // API uses courseTitle, not courseName
  courseCode: string;   // API includes courseCode
  courseSubject: string; // API includes courseSubject
  status: string;       // API includes status
  requestedAt: string;
  processedAt?: string | null;
  notes?: string | null;
  rejectionReason?: string | null;
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
    localStorage.removeItem('user');
    sessionStorage.clear();
  };

// Fetch registration requests for teachers
const fetchRegistrationRequests = async () => {
  if (role !== 'teacher') return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/courses/registration-requests`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Handle the API response structure correctly
      // API returns: { success: true, count: 1, requests: [...] }
      const allRequests = Array.isArray(data.requests) ? data.requests : [];
      
      // IMPORTANT: Filter to only show pending requests
      const pendingRequests = allRequests.filter((req: RegistrationRequest) => {
        console.log(`Request ${req.id} status: ${req.status}`); // Debug log
        return req.status === 'pending';
      });
      
      console.log('All requests:', allRequests.length, 'Pending only:', pendingRequests.length); // Debug log
      
      setRegistrationRequests(pendingRequests);
      
      // Count unread pending requests
      const unread = pendingRequests.filter((req: RegistrationRequest) => 
        !localStorage.getItem(`request_read_${req.id}`)
      );
      setUnreadCount(unread.length);
    } else {
      console.error('Failed to fetch registration requests:', response.statusText);
      // Set to empty array on error to prevent crashes
      setRegistrationRequests([]);
      setUnreadCount(0);
    }
  } catch (error) {
    console.error('Error fetching registration requests:', error);
    // Set to empty array on error to prevent crashes
    setRegistrationRequests([]);
    setUnreadCount(0);
  }
};
// Fixed handleRegistrationAction function to match the backend API
const handleRegistrationAction = async (requestId: string, action: 'approve' | 'reject') => {
  try {
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    const response = await fetch(`${API_BASE_URL}/api/courses/registration-requests/${requestId}`, {
      credentials: 'include',
      method: 'PUT', // Changed from POST to PUT
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: status,
        notes: null, // You can add notes if needed
        rejectionReason: action === 'reject' ? 'Rejected by teacher' : null // Optional rejection reason
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      
      // Remove the request from the list
      setRegistrationRequests(prev => prev.filter(req => req.id !== requestId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Show success message (you can implement a toast notification system)
      const message = result.message || (action === 'approve' ? 'Student approved successfully!' : 'Student request rejected.');
      console.log(message);
      
      // Optional: You could show a toast notification here
      // toast.success(message);
      
    } else {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Failed to ${action} registration request`;
      console.error(errorMessage, response.statusText);
      
      // Optional: You could show an error toast here
      // toast.error(errorMessage);
    }
  } catch (error) {
    console.error(`Error ${action}ing registration request:`, error);
    
    // Optional: You could show an error toast here
    // toast.error(`Network error while ${action}ing request`);
  }
};


  // Mark notification as read
  const markAsRead = (requestId: string) => {
    localStorage.setItem(`request_read_${requestId}`, 'true');
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  useEffect(() => {

    const checkAuth = () => {
  const user = localStorage.getItem('user');

  // Only check for user data, not accessToken since we're using cookies
  if (!user) {
    setIsAuthenticated(false);
    clearAuthStorage();
    navigate('/', { replace: true }); // Navigate to root instead of /login
    return;
  }

  try {
    const userData = JSON.parse(user);
    if (!userData.id || !userData.role) {
      throw new Error('Invalid user data');
    }
    console.log("✅ User authenticated via Layout:", userData);
    setIsAuthenticated(true);
  } catch (err) {
    console.error('Error parsing user data:', err);
    clearAuthStorage();
    navigate('/', { replace: true }); // Navigate to root instead of /login
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

  const handleSignOut = async () => {

    const url = API_BASE_URL + '/api/auth/logout';
    await fetch(url, {
      method: 'POST',
      credentials: 'include', // important to send cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearAuthStorage();
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && Array.isArray(registrationRequests)) {
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
              
              {/* Modal for Registration Requests */}
              {showNotifications && (
                <>
                  <div className="modal-overlay" onClick={toggleNotifications}></div>
                  <div className="notifications-modal">
                    <div className="modal-header">
                      <h4>Registration Requests</h4>
                      <button className="close-modal" onClick={toggleNotifications}>×</button>
                    </div>
                    <div className="modal-content">
                      {!Array.isArray(registrationRequests) || registrationRequests.length === 0 ? (
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
                                <strong>Course: {request.courseTitle}</strong>
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
                </>
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