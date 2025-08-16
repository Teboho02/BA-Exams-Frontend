// components/StatisticsSection.tsx
import React from 'react';
import type { Statistics, Assignment } from '../types/TeacherQuizReviewTypes';
import { getLetterGradeColor } from '../utils/helpers';

interface StatisticsSectionProps {
    statistics: Statistics;
    assignment: Assignment;
}

const StatisticsSection: React.FC<StatisticsSectionProps> = ({ statistics, assignment }) => {
    return (
        <div className="statistics-section">
            <h2>Overview</h2>
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Students</h3>
                    <div className="stat-value">{statistics.totalStudents}</div>
                </div>
                <div className="stat-card">
                    <h3>Submitted</h3>
                    <div className="stat-value">{statistics.submittedCount}</div>
                    <div className="stat-subtitle">{statistics.completionRate}% completion</div>
                </div>
                <div className="stat-card">
                    <h3>Average Score</h3>
                    <div className="stat-value">{statistics.averageScore}/{assignment.maxPoints}</div>
                    <div className="stat-subtitle">{statistics.averagePercentage}%</div>
                </div>
                <div className="stat-card">
                    <h3>Grade Distribution</h3>
                    <div className="grade-distribution">
                        {Object.entries(statistics.gradeDistribution).map(([grade, count]) => (
                            <div key={grade} className="grade-item">
                                <span className="grade-letter" style={{ color: getLetterGradeColor(grade) }}>
                                    {grade}
                                </span>
                                <span className="grade-count">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsSection;