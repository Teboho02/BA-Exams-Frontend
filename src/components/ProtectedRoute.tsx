import React from 'react';
import { Navigate } from 'react-router-dom';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  isActive: boolean;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'teacher' | 'student')[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/' 
}) => {
  const getUserFromStorage = (): User | null => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) return null;
      return JSON.parse(userString);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('user'); // Clean up invalid data
      return null;
    }
  };

  const user = getUserFromStorage();

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // If user's role is not allowed, redirect based on their role
  if (!allowedRoles.includes(user.role)) {
    const roleRedirects = {
      admin: '/admin',
      teacher: '/teacher/courses',
      student: '/student/courses'
    };
    return <Navigate to={roleRedirects[user.role]} replace />;
  }

  // If user is authenticated and authorized, render the component
  return <>{children}</>;
};

export default ProtectedRoute;
