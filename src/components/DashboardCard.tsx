import React from 'react';
import { Link } from 'react-router-dom';
import './DashboardCard.css';

interface DashboardCardProps {
  to: string;
  title: string;
  description: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ to, title, description }) => {
  return (
    <Link to={to} className="dashboard-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </Link>
  );
};

export default DashboardCard;