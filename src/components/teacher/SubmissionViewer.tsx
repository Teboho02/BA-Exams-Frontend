import React, { useState } from 'react';
import './SubmissionViewer.css';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}


interface Question {
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'mathematical';
  question: string;
  points: number;
  options?: Option[];
  correctAnswer?: string | string[];
  explanation?: string;
}
export interface AssignmentSettings {
  autoGrade: boolean;
  timeLimit?: number;
  allowMultipleAttempts: boolean;
  maxAttempts?: number;
  showCorrectAnswers: boolean;
  showResultsAfterSubmission: boolean;
  dueDate?: string;
  availableFrom?: string;
  availableUntil?: string;
}


interface Assignment {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  totalPoints: number;
  settings: AssignmentSettings;
  createdAt: string;
  updatedAt: string;
  teacherId: string;
  classId: string;
  status: 'draft' | 'published' | 'closed';
}


export interface Answer {
  questionId: string;
  answer: string | string[];
  isCorrect?: boolean;
  pointsEarned?: number;
  pointsAwarded?: number; // For manual grading
}
interface SubmissionViewerProps {
  assignment: Assignment;
  submissions: Submission[];
  onGradeSubmission?: (submissionId: string, grades: { questionId: string; points: number }[]) => void;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  answers: Answer[];
  score: number;
  percentage: number;
  status: 'in-progress' | 'submitted' | 'graded';
  startedAt: string;
  submittedAt?: string;
  timeTaken: number; // in seconds
  attemptNumber: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
}
const SubmissionViewer: React.FC<SubmissionViewerProps> = ({ 
  assignment, 
  submissions, 
  onGradeSubmission 
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'graded' | 'in-progress'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'time' | 'score'>('name');
  const [manualGrades, setManualGrades] = useState<{ [key: string]: number }>({});

  const filteredSubmissions = submissions.filter((sub: Submission) => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });

  const sortedSubmissions = [...filteredSubmissions].sort((a: Submission, b: Submission) => {
    switch (sortBy) {
      case 'name':
        return a.studentName.localeCompare(b.studentName);
      case 'time':
        return a.timeTaken - b.timeTaken;
      case 'score':
        return (b.percentage || 0) - (a.percentage || 0);
      default:
        return 0;
    }
  });

  const formatDateTime = (date: string | Date | undefined) => {
    if (!date) return 'Not submitted';
    return new Date(date).toLocaleString();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'submitted': '#3498db',
      'graded': '#2ecc71',
      'in-progress': '#f39c12',
      'late': '#e74c3c'
    };
    return (
      <span 
        className="status-badge" 
        style={{ backgroundColor: colors[status as keyof typeof colors] || '#95a5a6' }}
      >
        {status}
      </span>
    );
  };

  const handleGradeChange = (questionId: string, points: number) => {
    setManualGrades(prev => ({
      ...prev,
      [questionId]: points
    }));
  };

  const submitGrades = () => {
    if (!selectedSubmission || !onGradeSubmission) return;
    
    const grades = Object.entries(manualGrades).map(([questionId, points]) => ({
      questionId,
      points
    }));
    
    onGradeSubmission(selectedSubmission.id, grades);
    setManualGrades({});
  };

  return (
    <div className="submission-viewer">
      <div className="viewer-header">
        <h2>Submissions for {assignment.title}</h2>
        <div className="viewer-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as 'all' | 'submitted' | 'graded' | 'in-progress')}
            className="filter-select"
          >
            <option value="all">All Submissions</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
            <option value="in-progress">In Progress</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'name' | 'time' | 'score')}
            className="sort-select"
          >
            <option value="name">Sort by Name</option>
            <option value="time">Sort by Time Taken</option>
            <option value="score">Sort by Score</option>
          </select>
        </div>
      </div>

      <div className="viewer-content">
        <div className="submissions-list">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Time Taken</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSubmissions.map((submission: Submission) => (
                <tr 
                  key={submission.id}
                  className={selectedSubmission?.id === submission.id ? 'selected' : ''}
                >
                  <td>{submission.studentName}</td>
                  <td>{getStatusBadge(submission.status)}</td>
                  <td>{formatDateTime(submission.submittedAt)}</td>
                  <td>{formatTime(submission.timeTaken)}</td>
                  <td>
                    {submission.score !== undefined ? (
                      <span style={{ 
                        color: submission.percentage && submission.percentage >= 70 ? '#2ecc71' : '#e74c3c' 
                      }}>
                        {submission.score}/{assignment.totalPoints} ({submission.percentage?.toFixed(0)}%)
                      </span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>
                    <button 
                      onClick={() => setSelectedSubmission(submission)}
                      className="btn-view"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedSubmission && (
          <div className="submission-detail">
            <div className="detail-header">
              <h3>{selectedSubmission.studentName}'s Submission</h3>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="btn-close"
              >
                ×
              </button>
            </div>

            <div className="submission-info">
              <p><strong>Started:</strong> {formatDateTime(selectedSubmission.startedAt)}</p>
              <p><strong>Submitted:</strong> {formatDateTime(selectedSubmission.submittedAt)}</p>
              <p><strong>Time Taken:</strong> {formatTime(selectedSubmission.timeTaken)}</p>
              <p><strong>Attempt:</strong> {selectedSubmission.attemptNumber}</p>
            </div>

            <div className="answers-section">
              <h4>Answers</h4>
              {assignment.questions.map((question: Question, index: number) => {
                const answer = selectedSubmission.answers.find((a: Answer) => a.questionId === question.id);
                
                return (
                  <div key={question.id} className="answer-item">
                    <div className="question-header">
                      <h5>Question {index + 1} ({question.points} points)</h5>
                      {answer?.isCorrect !== undefined && (
                        <span className={`correct-indicator ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                          {answer.isCorrect ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                    
                    <div className="question-text">{question.question}</div>
                    
                    <div className="student-answer">
                      <strong>Student's Answer:</strong>
                      {question.type === 'multiple-choice' && question.options ? (
                        <div>
                          {question.options.map((option, optIndex: number) => (
                            <div 
                              key={option.id} 
                              className={`option ${
                                answer?.answer === option.id ? 'selected' : ''
                              } ${
                                option.isCorrect ? 'correct-option' : ''
                              }`}
                            >
                              {String.fromCharCode(65 + optIndex)}. {option.text}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>{Array.isArray(answer?.answer) ? answer.answer.join(', ') : answer?.answer || 'No answer provided'}</p>
                      )}
                    </div>

                    {question.correctAnswer && (
                      <div className="correct-answer">
                        <strong>Correct Answer:</strong> {
                          Array.isArray(question.correctAnswer) 
                            ? question.correctAnswer.join(', ') 
                            : question.correctAnswer
                        }
                      </div>
                    )}

                    {question.explanation && selectedSubmission.status === 'graded' && (
                      <div className="explanation">
                        <strong>Explanation:</strong> {question.explanation}
                      </div>
                    )}

                    {selectedSubmission.status !== 'graded' && assignment.settings.autoGrade === false && (
                      <div className="manual-grading">
                        <label>Award Points:</label>
                        <input
                          type="number"
                          min="0"
                          max={question.points}
                          value={manualGrades[question.id] || answer?.pointsEarned || 0}
                          onChange={(e) => handleGradeChange(question.id, parseInt(e.target.value) || 0)}
                        />
                        <span>/ {question.points}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedSubmission.status !== 'graded' && assignment.settings.autoGrade === false && (
              <div className="grading-actions">
                <button onClick={submitGrades} className="btn-submit-grades">
                  Submit Grades
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionViewer;