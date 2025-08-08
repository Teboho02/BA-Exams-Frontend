import React from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'teacher' | 'student';
}

const Layout: React.FC<LayoutProps> = ({ children, role }) => {
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

  return (
    <div className="layout">
      <nav className="navbar" style={{ backgroundColor: getRoleColor() }}>
        <Link to="/" className="nav-brand">
          Edu Platform
        </Link>
        <span className="role-indicator">{role.toUpperCase()}</span>
      </nav>
      <div className="content">{children}</div>
    </div>
  );
};

export default Layout;
