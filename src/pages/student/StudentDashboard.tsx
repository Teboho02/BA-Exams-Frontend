import React from 'react';
import Layout from '../../components/Layout';
import DashboardCard from '../../components/DashboardCard';
import './StudentDashboard.css';

const StudentDashboard: React.FC = () => {
  return (
    <Layout role="student">
      <h1>Student Dashboard</h1>
      <div className="dashboard-grid">
        <DashboardCard
          to="/student/courses"
          title="My Courses"
          description="View enrolled courses"
        />
        <DashboardCard
          to="/student/assignments"
          title="Assignments"
          description="View and submit assignments"
        />
        <DashboardCard
          to="/student/grades"
          title="My Grades"
          description="View your grades"
        />
      </div>
    </Layout>
  );
};

export default StudentDashboard;