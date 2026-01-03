// components/StatisticsSection.tsx (Enhanced version)
import React from 'react';
import type { Statistics, Assignment, StudentReview } from '../types/TeacherQuizReviewTypes';

interface StatisticsSectionProps {
    statistics: Statistics;
    assignment: Assignment;
    studentReviews?: StudentReview[]; // Optional: for calculating grade distribution
}

const StatisticsSection: React.FC<StatisticsSectionProps> = ({ 
    statistics, 
    assignment, 
    studentReviews = [] 
}) => {
    // Calculate completion rate
    const completionRate = statistics.totalStudents > 0 
        ? Math.round((statistics.submittedCount / statistics.totalStudents) * 100) 
        : 0;

    // Calculate grading completion rate
    const gradingCompletionRate = statistics.submittedCount > 0 
        ? Math.round((statistics.gradedCount / statistics.submittedCount) * 100) 
        : 0;

    // Calculate grade distribution from student data
    const calculateGradeDistribution = () => {
        const distribution = {
            'A': 0,
            'B': 0,
            'C': 0,
            'D': 0,
            'F': 0,
            'Not Graded': 0
        };

        studentReviews.forEach(review => {
            if (review.submission) {
                const grade = review.submission.letterGrade;
                if (grade in distribution) {
                    distribution[grade as keyof typeof distribution]++;
                } else {
                    distribution['Not Graded']++;
                }
            } else {
                distribution['Not Graded']++;
            }
        });

        return distribution;
    };

    const gradeDistribution = calculateGradeDistribution();
    const hasGradeData = Object.values(gradeDistribution).some(count => count > 0);

    return (
        <div className="statistics-section">
            <h2>Quiz Overview</h2>
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Students</h3>
                    <div className="stat-value">{statistics.totalStudents}</div>
                </div>
                
                <div className="stat-card">
                    <h3>Submitted</h3>
                    <div className="stat-value">{statistics.submittedCount}</div>
                    <div className="stat-subtitle">{completionRate}% completion</div>
                </div>
                
                <div className="stat-card">
                    <h3>Not Submitted</h3>
                    <div className="stat-value">{statistics.notSubmittedCount}</div>
                    <div className="stat-subtitle">{100 - completionRate}% remaining</div>
                </div>
                
                <div className="stat-card">
                    <h3>Graded</h3>
                    <div className="stat-value">{statistics.gradedCount}</div>
                    <div className="stat-subtitle">
                        {gradingCompletionRate}% of submissions
                    </div>
                </div>
                
                <div className="stat-card">
                    <h3>Average Score</h3>
                    <div className="stat-value">{statistics.averageScore}/{assignment.maxPoints}</div>
                    <div className="stat-subtitle">{statistics.averagePercentage}%</div>
                </div>
                
                <div className="stat-card">
                    <h3>Submission Rate</h3>
                    <div className="stat-value">{statistics.submissionRate}%</div>
                    <div className="stat-subtitle">of total students</div>
                </div>
            </div>

            {/* Grade Distribution */}
            {hasGradeData && (
                <div className="grade-distribution-section">
                    <h3>Grade Distribution</h3>
                    <div className="grade-distribution">
                        {Object.entries(gradeDistribution).map(([grade, count]) => (
                            <div key={grade} className="grade-item">
                                <span className="grade-letter" style={{ color: getLetterGradeColor(grade) }}>
                                    {grade}
                                </span>
                                <span className="grade-count">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}


        </div>
    );
};



const getLetterGradeColor = (grade: string): string => {
    const colors: Record<string, string> = {
        'A': '#2e7d32',
        'B': '#1565c0',
        'C': '#ef6c00',
        'D': '#ed6c02',
        'F': '#c62828',
        'Not Graded': '#666'
    };
    return colors[grade] || '#666';
};

export default StatisticsSection;