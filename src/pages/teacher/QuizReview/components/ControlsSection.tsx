// components/ControlsSection.tsx
import React from 'react';

interface ControlsSectionProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filterStatus: 'all' | 'submitted' | 'not_submitted';
    setFilterStatus: (status: 'all' | 'submitted' | 'not_submitted') => void;
    sortBy: 'name' | 'score' | 'submission_date';
    setSortBy: (sortBy: 'name' | 'score' | 'submission_date') => void;
}

const ControlsSection: React.FC<ControlsSectionProps> = ({
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy
}) => {
    return (
        <div className="controls-section">
            <div className="filters">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>
                
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="filter-select"
                >
                    <option value="all">All Students</option>
                    <option value="submitted">Submitted Only</option>
                    <option value="not_submitted">Not Submitted</option>
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="sort-select"
                >
                    <option value="name">Sort by Name</option>
                    <option value="score">Sort by Score</option>
                    <option value="submission_date">Sort by Submission Date</option>
                </select>
            </div>

            <div className="action-buttons">
                <button className="export-btn">📊 Export Results</button>
                <button className="email-btn">📧 Email Students</button>
            </div>
        </div>
    );
};

export default ControlsSection;