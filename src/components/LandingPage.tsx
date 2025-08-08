
import React from 'react';
import RoleCard from '../components/RoleCard';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-container">
      <h1 className="landing-title">Educational Platform</h1>
      <p className="landing-subtitle">Choose your role to continue</p>
      
      <div className="role-grid">
        <RoleCard
          to="/admin"
          icon="👨‍💼"
          title="Admin"
          description="Manage users, courses, and platform settings"
        />
        <RoleCard
          to="/teacher"
          icon="👨‍🏫"
          title="Teacher"
          description="Create courses, assignments, and grade students"
        />
        <RoleCard
          to="/student"
          icon="👨‍🎓"
          title="Student"
          description="View courses, submit assignments, and check grades"
        />
      </div>
    </div>
  );
};

export default LandingPage;