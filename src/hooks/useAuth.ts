import { useState, useEffect } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  isActive: boolean;
}

import { API_BASE_URL } from '../config/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserFromStorage = (): User | null => {
      try {
        console.log("Checking localStorage for user data...");
        const userString = localStorage.getItem('user');
        if (!userString) return null;
        return JSON.parse(userString);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('user');
        return null;
      }
    };

    const userData = getUserFromStorage();
    setUser(userData);
    setLoading(false);
  }, []);
const logout = async () => {
  try {
    // Remove user info from local storage
    localStorage.removeItem('user');

    // Call backend logout API
    const url = API_BASE_URL + '/api/auth/logout';
    await fetch(url, {
      method: 'POST',
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Clear local state
    setUser(null);
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

  const isAuthenticated = (): boolean => {
    return user !== null;
  };

  const hasRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  return {
    user,
    loading,
    logout,
    isAuthenticated,
    hasRole
  };
};
