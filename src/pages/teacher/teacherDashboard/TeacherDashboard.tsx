
import React from 'react';
import Layout from '../../../components/Layout';
import DashboardCard from '../../../components/DashboardCard';
import './TeacherDashboard.css';

const TeacherDashboard: React.FC = () => {
  return (
    <Layout role="teacher">
      <h1>Teacher Dashboard</h1>
      <div className="dashboard-grid">
        <DashboardCard
          to="/teacher/courses"
          title="My Courses"
          description="Manage your courses"
        />
        <DashboardCard
          to="/teacher/assignments"
          title="Assignments"
          description="Create and grade assignments"
        />
        <DashboardCard
          to="/teacher/grades"
          title="Gradebook"
          description="View and manage grades"
        />
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
