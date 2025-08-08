import React from 'react';
import { Link } from 'react-router-dom';
import './RoleCard.css';

interface RoleCardProps {
  to: string;
  icon: string;
  title: string;
  description: string;
}

const RoleCard: React.FC<RoleCardProps> = ({ to, icon, title, description }) => {
  return (
    <Link to={to} className="role-card-link">
      <div className="role-card">
        <div className="role-icon">{icon}</div>
        <h2 className="role-title">{title}</h2>
        <p className="role-description">{description}</p>
      </div>
    </Link>
  );
};

export default RoleCard;