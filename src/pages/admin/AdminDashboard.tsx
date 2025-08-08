
import React from 'react';
import Layout from '../../components/Layout';
import DashboardCard from '../../components/DashboardCard';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  return (
    <Layout role="admin">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-grid">
        <DashboardCard
          to="/admin/users"
          title="User Management"
          description="Manage all users in the system"
        />
        <DashboardCard
          to="/admin/courses"
          title="Course Overview"
          description="View and manage all courses"
        />
        <DashboardCard
          to="/admin/reports"
          title="Reports"
          description="System analytics and reports"
        />
      </div>
    </Layout>
  );
};

export default AdminDashboard;