import React from 'react';
import type { ActiveTab } from '../types/Assignment';

interface TabNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  questionCount: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  questionCount
}) => {
  return (
    <div className="tabs" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', maxWidth: '800px', margin: '0' }}>
      <nav className="tab-nav">
        <button
          onClick={() => onTabChange('details')}
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          type="button"
        >
          Details
        </button>
        <button
          onClick={() => onTabChange('questions')}
          className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
          type="button"
        >
          Questions ({questionCount})
        </button>
      </nav>
    </div>
  );
};