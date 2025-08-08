import React from 'react';
import type { Assignment, AssignmentStats, Submission } from '../../types/teacher.types';
import './AssignmentStats.css';

interface AssignmentStatsProps {
  assignment: Assignment;
  stats: AssignmentStats;
  submissions: Submission[];
}

const AssignmentStatsComponent: React.FC<AssignmentStatsProps> = ({ assignment, stats, submissions }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return '#2ecc71';
      case 'in-progress': return '#f39c12';
      case 'late': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return '#2ecc71';
    if (percentage >= 80) return '#3498db';
    if (percentage >= 70) return '#f39c12';
    if (percentage >= 60) return '#e67e22';
    return '#e74c3c';
  };

  return (
    <div className="assignment-stats">
      <div className="stats-header">
        <h2>{assignment.title}</h2>
        <div className="assignment-meta">
          <span className="meta-item">Type: {assignment.type}</span>
          <span className="meta-item">Total Points: {assignment.totalPoints}</span>
          <span className="meta-item">Questions: {assignment.questions.length}</span>
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <h3>Submission Status</h3>
          <div className="stat-content">
            <div className="stat-row">
              <span>Total Students:</span>
              <strong>{stats.totalStudents}</strong>
            </div>
            <div className="stat-row">
              <span>Submitted:</span>
              <strong style={{ color: getStatusColor('submitted') }}>
                {stats.submitted} ({Math.round((stats.submitted / stats.totalStudents) * 100)}%)
              </strong>
            </div>
            <div className="stat-row">
              <span>In Progress:</span>
              <strong style={{ color: getStatusColor('in-progress') }}>
                {stats.inProgress}
              </strong>
            </div>
            <div className="stat-row">
              <span>Not Started:</span>
              <strong>{stats.notStarted}</strong>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Score Statistics</h3>
          <div className="stat-content">
            <div className="stat-row">
              <span>Average Score:</span>
              <strong style={{ color: getGradeColor(stats.averageScore) }}>
                {stats.averageScore.toFixed(1)}%
              </strong>
            </div>
            <div className="stat-row">
              <span>Highest Score:</span>
              <strong style={{ color: '#2ecc71' }}>{stats.highestScore}%</strong>
            </div>
            <div className="stat-row">
              <span>Lowest Score:</span>
              <strong style={{ color: '#e74c3c' }}>{stats.lowestScore}%</strong>
            </div>
            <div className="stat-row">
              <span>Average Time:</span>
              <strong>{formatTime(stats.averageTimeTaken)}</strong>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Grade Distribution</h3>
          <div className="grade-distribution">
            {stats.scoreDistribution.map((item, index) => (
              <div key={index} className="distribution-row">
                <span className="range">{item.range}</span>
                <div className="distribution-bar">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      width: `${(item.count / stats.submitted) * 100}%`,
                      backgroundColor: getGradeColor(parseInt(item.range.split('-')[0]))
                    }}
                  />
                </div>
                <span className="count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="question-performance">
        <h3>Question Performance</h3>
        <table className="performance-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Type</th>
              <th>Points</th>
              <th>Avg Score</th>
              <th>Success Rate</th>
            </tr>
          </thead>
          <tbody>
            {assignment.questions.map((question, index) => {
              const questionSubmissions = submissions.filter(s => s.status === 'graded');
              const questionScores = questionSubmissions.map(sub => {
                const answer = sub.answers.find(a => a.questionId === question.id);
                return answer ? (answer.pointsAwarded || 0) / question.points : 0;
              });
              const avgScore = questionScores.length > 0 
                ? questionScores.reduce((a, b) => a + b, 0) / questionScores.length 
                : 0;
              
              return (
                <tr key={question.id}>
                  <td>Question {index + 1}</td>
                  <td>{question.type}</td>
                  <td>{question.points}</td>
                  <td>{(avgScore * question.points).toFixed(1)}</td>
                  <td>
                    <span style={{ color: getGradeColor(avgScore * 100) }}>
                      {(avgScore * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignmentStatsComponent;