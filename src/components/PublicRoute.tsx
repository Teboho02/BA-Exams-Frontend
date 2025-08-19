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

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
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

  // If user is already logged in, redirect them to their dashboard
  if (user) {
    const roleRedirects = {
      admin: '/admin',
      teacher: '/teacher/courses',
      student: '/student/courses'
    };
    return <Navigate to={roleRedirects[user.role]} replace />;
  }

  // If no user is logged in, render the public page
  return <>{children}</>;
};

export default PublicRoute;