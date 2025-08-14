import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle,
  XCircle,
  Calendar,
  Award,
  AlertCircle,
  Target,
  Clock
} from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Types based on Postman response
interface QuizQuestionAnswer {
  id: string;
  feedback: string;
  created_at: string;
  is_correct: boolean;
  answer_text: string;
  question_id: string;
  answer_order: number;
}

interface QuizQuestion {
  id: string;
  title: string;
  question_text: string;
  points: number;
  quiz_question_answers: QuizQuestionAnswer[];
}

interface QuizDetails {
  answers: { 
    [questionId: string]: {
      answerId?: string;
      textAnswer?: string;
    } 
  };
  detailedResults: { 
    [questionId: string]: {
      correct?: boolean;
      points: number;
      requiresManualGrading?: boolean;
    } 
  };
  autoGradedScore: number;
  totalPossiblePoints: number;
}

interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  score: number;
  attemptNumber: number;
  submittedAt: string;
  quizData: string; // This will be parsed to QuizDetails
  status: string;
  feedback?: string;
}

interface QuizReviewData {
  success: boolean;
  submission: Submission;
  questions: QuizQuestion[];
  canViewAnswers: boolean;
}

const StudentQuizReview: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();

  console.log("the submissionID is", submissionId);
  const navigate = useNavigate();
  
  const [reviewData, setReviewData] = useState<QuizReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Calculate grading statistics
  const calculateGradingStats = (questions: QuizQuestion[], quizDetails: QuizDetails) => {
    let gradedPoints = 0;
    let totalGradedPossiblePoints = 0;
    let ungradedPoints = 0;
    
    questions.forEach(question => {
      const result = quizDetails.detailedResults[question.id];
      if (result?.requiresManualGrading) {
        ungradedPoints += question.points;
      } else {
        gradedPoints += result?.points || 0;
        totalGradedPossiblePoints += question.points;
      }
    });
    
    return {
      gradedPoints,
      totalGradedPossiblePoints,
      ungradedPoints,
      totalPoints: quizDetails.totalPossiblePoints
    };
  };

  // Fetch quiz review data
  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/assignments/submission/${submissionId}/results`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data: QuizReviewData = await response.json();

      console.log("Fetched quiz review data:", data);
      
      if (data.success) {
        setReviewData(data);
        // Parse the quizData string
        if (data.submission.quizData) {
          const parsedData: QuizDetails = JSON.parse(data.submission.quizData);
          setQuizDetails(parsedData);
        }
      } else {
        setError('Failed to fetch quiz data');
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (submissionId) {
      fetchQuizData();
    }
  }, [submissionId]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const renderStudentAnswer = (question: QuizQuestion, studentAnswer: any) => {
    if (!studentAnswer) {
      return <span style={{ color: '#ef4444' }}>No answer provided</span>;
    }
    
    if (question.quiz_question_answers.length > 0) {
      // Multiple choice or true/false
      const selectedAnswerId = studentAnswer.answerId;
      const selectedAnswer = question.quiz_question_answers.find(a => a.id === selectedAnswerId);
      return <span>{selectedAnswer ? selectedAnswer.answer_text : 'Unknown answer'}</span>;
    }
    
    // Short answer or essay
    if (studentAnswer.textAnswer) {
      return <span>{studentAnswer.textAnswer}</span>;
    }
    
    return null;
  };

  const renderCorrectAnswer = (question: QuizQuestion) => {
    if (question.quiz_question_answers.length > 0) {
      const correctAnswers = question.quiz_question_answers.filter(a => a.is_correct);
      return (
        <div>
          {correctAnswers.map(answer => (
            <div key={answer.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} style={{ color: '#16a34a' }} />
              <span>{answer.answer_text}</span>
            </div>
          ))}
        </div>
      );
    }
    
    return <span>Model answer not available</span>;
  };

  if (loading) {
    return (
      <div className="assignment-creator">
        <div className="header">
          <div className="header-content">
            <div className="header-left">
              <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginRight: '16px' }}>
                <ArrowLeft size={16} />
                Back
              </button>
              <h1 className="title">Loading Quiz Review...</h1>
            </div>
          </div>
        </div>
        <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              border: '3px solid #e5e7eb', 
              borderTop: '3px solid #3b82f6', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#6b7280' }}>Loading quiz data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assignment-creator">
        <div className="header">
          <div className="header-content">
            <div className="header-left">
              <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginRight: '16px' }}>
                <ArrowLeft size={16} />
                Back
              </button>
              <h1 className="title">Error</h1>
            </div>
          </div>
        </div>
        <div className="main-content">
          <div className="card empty-state">
            <div className="empty-icon">
              <AlertCircle size={48} style={{ color: '#ef4444' }} />
            </div>
            <h3 className="empty-title">Unable to Load Quiz Review</h3>
            <p className="empty-description">{error}</p>
            <button onClick={() => navigate(-1)} className="btn btn-primary">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!reviewData || !reviewData.submission || !quizDetails) {
    return null;
  }

  const submission = reviewData.submission;
  const questions = reviewData.questions;
  const gradingStats = calculateGradingStats(questions, quizDetails);

  return (
    <div className="assignment-creator">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginRight: '16px' }}>
              <ArrowLeft size={16} />
              Back
            </button>
            <h1 className="title">{submission.assignmentTitle} - Review</h1>
            <div className="badges">
              <span className="badge badge-secondary">
                {gradingStats.totalPoints} points total
              </span>
              <span className="badge badge-info">
                Attempt #{submission.attemptNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Quiz Info Card */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 className="card-header">Quiz Information</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Target size={16} style={{ color: '#6b7280' }} />
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Questions</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                {questions.length}
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Award size={16} style={{ color: '#6b7280' }} />
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Points</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                {gradingStats.totalPoints}
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Award size={16} style={{ color: '#6b7280' }} />
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Graded Score</span>
              </div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: '600',
                color: gradingStats.totalGradedPossiblePoints > 0 && gradingStats.gradedPoints >= gradingStats.totalGradedPossiblePoints * 0.7 ? '#10b981' : '#ef4444'
              }}>
                {gradingStats.gradedPoints}/{gradingStats.totalGradedPossiblePoints}
                {gradingStats.totalGradedPossiblePoints > 0 && (
                  <span style={{ fontSize: '16px', marginLeft: '8px' }}>
                    ({((gradingStats.gradedPoints / gradingStats.totalGradedPossiblePoints) * 100).toFixed(1)}%)
                  </span>
                )}
              </div>
              {gradingStats.ungradedPoints > 0 && (
                <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>
                  +{gradingStats.ungradedPoints} pts pending review
                </div>
              )}
            </div>

            {submission.submittedAt && (
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Calendar size={16} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Submitted At</span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                  {formatDate(submission.submittedAt)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Review Section */}
        {quizDetails && (
          <div className="card" style={{ marginTop: '24px' }}>
            <h2 className="card-header">Questions Review</h2>
            
            {questions.map((question) => {
              const questionId = question.id;
              const studentAnswer = quizDetails.answers[questionId];
              const detailedResult = quizDetails.detailedResults[questionId];
              const isCorrect = detailedResult?.correct;
              const pointsAwarded = detailedResult?.points || 0;
              const requiresManualGrading = detailedResult?.requiresManualGrading;
              
              return (
                <div key={question.id} style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
                      {question.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {requiresManualGrading ? (
                        <>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            fontWeight: '500'
                          }}>
                            Ungraded / {question.points} pts
                          </span>
                          <Clock size={20} style={{ color: '#f59e0b' }} />
                        </>
                      ) : (
                        <>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            backgroundColor: isCorrect ? '#dcfce7' : '#fee2e2',
                            color: isCorrect ? '#166534' : '#991b1b',
                            fontWeight: '500'
                          }}>
                            {pointsAwarded} / {question.points} pts
                          </span>
                          {isCorrect ? (
                            <CheckCircle size={20} style={{ color: '#16a34a' }} />
                          ) : (
                            <XCircle size={20} style={{ color: '#dc2626' }} />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '16px', color: '#374151' }}>
                    <p>{question.question_text}</p>
                  </div>
                  
                  <div style={{ marginBottom: '16px', color: '#374151' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Your Answer:</h4>
                    {renderStudentAnswer(question, studentAnswer)}
                  </div>
                  
                  {reviewData.canViewAnswers && question.quiz_question_answers.length > 0 && !requiresManualGrading && (
                    <div style={{ marginBottom: '16px', color: '#374151' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'black' }}>Correct Answer:</h4>
                      {renderCorrectAnswer(question)}
                    </div>
                  )}
                  
                  {requiresManualGrading && (
                    <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px', marginTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Clock size={16} style={{ color: '#f59e0b' }} />
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>Pending Manual Review</h4>
                      </div>
                      <p style={{ color: '#92400e', margin: 0 }}>This question requires manual grading by your instructor.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Instructor Feedback */}
        {submission.feedback && (
          <div className="card" style={{ marginTop: '24px' }}>
            <h2 className="card-header">Feedback</h2>
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '16px', lineHeight: '1.6' }}>{submission.feedback}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQuizReview;