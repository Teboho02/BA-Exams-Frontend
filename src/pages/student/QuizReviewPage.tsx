import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Award,
  FileText,
  Eye,
  AlertCircle,
  Info,
  Target,
  TrendingUp
} from 'lucide-react';
import './StudentQuizView.css';

// Types
interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructions?: string;
  assignmentType: string;
  maxPoints: number;
  isPublished: boolean;
  submissionType: string;
  dueDate?: string;
  availableFrom?: string;
  availableUntil?: string;
  allowedAttempts: number;
  hasTimeLimit: boolean;
  timeLimitMinutes?: number;
  shuffleAnswers: boolean;
  showCorrectAnswers: boolean;
  oneQuestionAtTime: boolean;
  cantGoBack: boolean;
  requireAccessCode: boolean;
  accessCode?: string;
  password?: string;
  quizInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

interface Question {
  id: string;
  assignmentId: string;
  questionNumber: number;
  title: string;
  questionText: string;
  questionType: string;
  points: number;
  imageUrl?: string;
  answers: QuestionAnswer[];
}

interface QuestionAnswer {
  id: string;
  questionId: string;
  answerText: string;
  isCorrect: boolean;
  feedback?: string;
  answerOrder: number;
}

interface Submission {
  id: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: string;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
  attemptNumber: number;
  quizDetails?: {
    answers: { [questionId: string]: any };
    detailedResults: { [questionId: string]: any };
    autoGradedScore: number;
    totalPossiblePoints: number;
  };
}

interface ReviewData {
  assignment: Assignment;
  questions: Question[];
  submission: Submission;
  showCorrectAnswers: boolean;
}

const QuizReviewPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get review data from navigation state or fetch from API
  const reviewState = location.state as ReviewData;
  
  const [assignment, setAssignment] = useState<Assignment | null>(reviewState?.assignment || null);
  const [questions, setQuestions] = useState<Question[]>(reviewState?.questions || []);
  const [submission, setSubmission] = useState<Submission | null>(reviewState?.submission || null);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState<boolean>(reviewState?.showCorrectAnswers || false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(!reviewState);
  const [error, setError] = useState<string>('');

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Fetch submission data if not provided via navigation
  const fetchSubmissionData = async () => {
    if (!submissionId) return;
    
    try {
      setLoading(true);
      setError('');
      
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/submissions/${submissionId}`, {
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

      const data = await response.json();

      if (data.success) {
        setAssignment(data.assignment);
        setQuestions(data.questions || []);
        setSubmission(data.submission);
        setShowCorrectAnswers(data.showCorrectAnswers || false);
      } else {
        setError(data.message || 'Failed to fetch submission data');
      }
    } catch (err) {
      console.error('Error fetching submission:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!reviewState && submissionId) {
      fetchSubmissionData();
    } else if (reviewState) {
      setLoading(false);
    }
  }, [submissionId, reviewState]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startTime: string, endTime: string): string => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    
    if (diffMins > 0) {
      return `${diffMins}m ${diffSecs}s`;
    }
    return `${diffSecs}s`;
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'graded':
        return '#10b981';
      case 'submitted':
        return '#f59e0b';
      case 'draft':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 90) return '#10b981';
    if (percentage >= 80) return '#84cc16';
    if (percentage >= 70) return '#f59e0b';
    if (percentage >= 60) return '#f97316';
    return '#ef4444';
  };

  const getUserAnswer = (questionId: string) => {
    return submission?.quizDetails?.answers?.[questionId];
  };

  const getQuestionResult = (questionId: string) => {
    return submission?.quizDetails?.detailedResults?.[questionId];
  };

  const navigateToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getCorrectAnswersCount = (): number => {
    if (!submission?.quizDetails?.detailedResults) return 0;
    return Object.values(submission.quizDetails.detailedResults).filter((result: any) => result.correct).length;
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
              <h1 className="title">Loading Review...</h1>
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
            <p style={{ color: '#6b7280' }}>Loading your submission...</p>
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
            <h3 className="empty-title">Unable to Load Submission</h3>
            <p className="empty-description">{error}</p>
            <button onClick={() => navigate(-1)} className="btn btn-primary">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment || !submission || questions.length === 0) {
    return (
      <div className="assignment-creator">
        <div className="main-content">
          <div className="card empty-state">
            <div className="empty-icon">
              <AlertCircle size={48} />
            </div>
            <h3 className="empty-title">Submission not found</h3>
            <p className="empty-description">The submission you're looking for doesn't exist or has been removed.</p>
            <button onClick={() => navigate(-1)} className="btn btn-primary">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const userAnswer = getUserAnswer(currentQ.id);
  const questionResult = getQuestionResult(currentQ.id);
  const sortedAnswers = currentQ.answers ? [...currentQ.answers].sort((a, b) => a.answerOrder - b.answerOrder) : [];

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
            <h1 className="title">{assignment.title} - Review</h1>
            <div className="badges">
              <span className="badge badge-info">
                <Eye size={14} />
                Attempt #{submission.attemptNumber}
              </span>
              <span className="badge" style={{ 
                backgroundColor: submission.status === 'graded' ? '#f0fdf4' : '#fffbeb',
                color: getStatusColor(submission.status)
              }}>
                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
              </span>
              <span className="points-display">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Summary */}
      <div className="main-content" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {/* Score */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: getScoreColor(submission.percentage),
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <Award size={32} />
                {submission.score}/{submission.maxScore}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: getScoreColor(submission.percentage), marginBottom: '4px' }}>
                {submission.percentage?.toFixed(1)}%
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Final Score</div>
            </div>

            {/* Correct Answers */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: '#10b981',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <Target size={32} />
                {getCorrectAnswersCount()}/{questions.length}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#10b981', marginBottom: '4px' }}>
                {((getCorrectAnswersCount() / questions.length) * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Correct Answers</div>
            </div>

            {/* Time Taken */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: '#3b82f6',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <Clock size={32} />
                {submission.quizDetails ? 
                  formatDuration(
                    new Date(submission.submittedAt).toISOString(), 
                    new Date(submission.submittedAt).toISOString()
                  ) : 'N/A'}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Time Taken</div>
            </div>

            {/* Submission Date */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#8b5cf6',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <Calendar size={24} />
                <div>
                  <div>{formatDate(submission.submittedAt).split(',')[0]}</div>
                  <div style={{ fontSize: '14px', fontWeight: 'normal' }}>
                    {formatDate(submission.submittedAt).split(',')[1]}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Submitted</div>
            </div>
          </div>

          {/* Instructor Feedback */}
          {submission.feedback && (
            <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} />
                Instructor Feedback
              </h4>
              <p style={{ fontSize: '15px', color: '#4b5563', margin: 0, lineHeight: '1.6' }}>{submission.feedback}</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Main Question Review Area */}
        <div className="card" style={{ padding: '32px' }}>
          {/* Question Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h2 className="card-header" style={{ margin: 0 }}>
                  Question {currentQuestion + 1}
                </h2>
                <span className="badge badge-secondary">
                  {currentQ.points} point{currentQ.points !== 1 ? 's' : ''}
                </span>
                <span className="badge badge-info">
                  {currentQ.questionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                {questionResult && (
                  <span className={`badge ${questionResult.correct ? 'badge-success' : 'badge-danger'}`}>
                    {questionResult.correct ? (
                      <>
                        <CheckCircle size={14} />
                        Correct ({questionResult.points}/{currentQ.points})
                      </>
                    ) : (
                      <>
                        <XCircle size={14} />
                        Incorrect (0/{currentQ.points})
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '18px', fontWeight: '500', lineHeight: '1.6', color: '#374151', margin: 0 }}>
              {currentQ.questionText}
            </p>
          </div>

          {/* Question Image */}
          {currentQ.imageUrl && (
            <div style={{ marginBottom: '32px' }}>
              <img 
                src={currentQ.imageUrl} 
                alt="Question illustration" 
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
            </div>
          )}

          {/* Answer Review */}
          <div className="form-group">
            {(currentQ.questionType === 'multiple_choice' || currentQ.questionType === 'true_false') && sortedAnswers.length > 0 && (
              <div style={{ display: 'flex', flexDirection: currentQ.questionType === 'true_false' ? 'row' : 'column', gap: currentQ.questionType === 'true_false' ? '16px' : '12px' }}>
                {sortedAnswers.map((answer) => {
                  const isSelected = userAnswer?.answerId === answer.id;
                  const isCorrect = answer.isCorrect;
                  
                  let borderColor = '#e5e7eb';
                  let backgroundColor = '#fff';
                  let textColor = '#374151';
                  
                  if (showCorrectAnswers) {
                    if (isCorrect) {
                      borderColor = '#10b981';
                      backgroundColor = isSelected ? '#ecfdf5' : '#f0fdf4';
                      textColor = '#065f46';
                    } else if (isSelected && !isCorrect) {
                      borderColor = '#ef4444';
                      backgroundColor = '#fef2f2';
                      textColor = '#991b1b';
                    }
                  } else if (isSelected) {
                    borderColor = '#3b82f6';
                    backgroundColor = '#eff6ff';
                    textColor = '#1e40af';
                  }

                  return (
                    <div
                      key={answer.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px',
                        border: '2px solid',
                        borderColor,
                        borderRadius: '8px',
                        backgroundColor,
                        color: textColor,
                        position: 'relative',
                        ...(currentQ.questionType === 'true_false' && {
                          minWidth: '120px',
                          justifyContent: 'center',
                          flex: 1
                        })
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQ.id}`}
                        value={answer.id}
                        checked={isSelected}
                        disabled
                        style={{ 
                          marginRight: currentQ.questionType === 'true_false' ? '8px' : '12px',
                          opacity: 0.7
                        }}
                      />
                      <span style={{ 
                        fontSize: '16px',
                        fontWeight: currentQ.questionType === 'true_false' ? '500' : 'normal',
                        flex: 1
                      }}>
                        {answer.answerText}
                      </span>
                      
                      {/* Status Icons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                        {isSelected && (
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: '600', 
                            color: textColor,
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            Your Answer
                          </span>
                        )}
                        {showCorrectAnswers && isCorrect && (
                          <CheckCircle size={20} style={{ color: '#10b981' }} />
                        )}
                        {showCorrectAnswers && isSelected && !isCorrect && (
                          <XCircle size={20} style={{ color: '#ef4444' }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {(currentQ.questionType === 'short_answer' || currentQ.questionType === 'essay') && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                    Your Answer:
                  </h4>
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#f9fafb', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '6px',
                    fontSize: '16px',
                    color: '#374151',
                    minHeight: currentQ.questionType === 'essay' ? '120px' : '40px'
                  }}>
                    {userAnswer?.textAnswer || <em style={{ color: '#9ca3af' }}>No answer provided</em>}
                  </div>
                </div>

                {questionResult && (
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: questionResult.correct ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${questionResult.correct ? '#bbf7d0' : '#fecaca'}`,
                    borderRadius: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      {questionResult.correct ? (
                        <CheckCircle size={16} style={{ color: '#10b981' }} />
                      ) : (
                        <XCircle size={16} style={{ color: '#ef4444' }} />
                      )}
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '600',
                        color: questionResult.correct ? '#065f46' : '#991b1b'
                      }}>
                        {questionResult.correct ? 'Correct' : 'Incorrect'} - {questionResult.points}/{currentQ.points} points
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Answer Feedback */}
            {showCorrectAnswers && sortedAnswers.some(a => a.feedback && (a.isCorrect || userAnswer?.answerId === a.id)) && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16} />
                  Answer Feedback
                </h4>
                {sortedAnswers.map((answer) => {
                  const shouldShowFeedback = answer.feedback && (answer.isCorrect || userAnswer?.answerId === answer.id);
                  if (!shouldShowFeedback) return null;
                  
                  return (
                    <div key={answer.id} style={{ 
                      padding: '12px', 
                      backgroundColor: answer.isCorrect ? '#f0fdf4' : '#fef2f2',
                      border: `1px solid ${answer.isCorrect ? '#bbf7d0' : '#fecaca'}`,
                      borderRadius: '6px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ fontSize: '14px', color: '#374151', marginBottom: '4px', fontWeight: '500' }}>
                        {answer.answerText}:
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {answer.feedback}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="bottom-buttons" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className="btn btn-secondary"
              type="button"
            >
              <ArrowLeft size={16} />
              Previous
            </button>
            
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="btn btn-primary"
                type="button"
              >
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => navigate(-1)}
                className="btn btn-success"
                type="button"
              >
                <CheckCircle size={16} />
                Finish Review
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div className="card" style={{ padding: '24px', height: 'fit-content' }}>
          <h3 className="card-header" style={{ marginBottom: '16px' }}>Review Progress</h3>
          
          {/* Overall Stats */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              <span>Score</span>
              <span>{submission.percentage?.toFixed(1)}%</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${submission.percentage}%`,
                height: '100%',
                backgroundColor: getScoreColor(submission.percentage),
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Question Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {questions.map((q, index) => {
              const result = getQuestionResult(q.id);
              const isCorrect = result?.correct || false;
              const wasAnswered = getUserAnswer(q.id)?.answerId || getUserAnswer(q.id)?.textAnswer;
              
              return (
                <button
                  key={q.id}
                  onClick={() => navigateToQuestion(index)}
                  className={`question-nav-btn ${
                    index === currentQuestion ? 'current' : 
                    isCorrect ? 'correct' : 
                    wasAnswered ? 'incorrect' : 'unanswered'
                  }`}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '2px solid',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    borderColor: 
                      index === currentQuestion ? '#3b82f6' :
                      isCorrect ? '#10b981' :
                      wasAnswered ? '#ef4444' : '#6b7280',
                    backgroundColor:
                      index === currentQuestion ? '#eff6ff' :
                      isCorrect ? '#f0fdf4' :
                      wasAnswered ? '#fef2f2' : '#fff',
                    color:
                      index === currentQuestion ? '#3b82f6' :
                      isCorrect ? '#10b981' :
                      wasAnswered ? '#ef4444' : '#6b7280',
                    position: 'relative'
                  }}
                  type="button"
                >
                  {index + 1}
                  {isCorrect && (
                    <CheckCircle size={10} style={{ 
                      position: 'absolute', 
                      top: '2px', 
                      right: '2px',
                      color: '#10b981'
                    }} />
                  )}
                  {wasAnswered && !isCorrect && (
                    <XCircle size={10} style={{ 
                      position: 'absolute', 
                      top: '2px', 
                      right: '2px',
                      color: '#ef4444'
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#eff6ff', border: '1px solid #3b82f6', borderRadius: '2px', marginRight: '8px' }}></div>
              <span>Current</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#f0fdf4', border: '1px solid #10b981', borderRadius: '2px', marginRight: '8px' }}></div>
              <span>Correct</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#fef2f2', border: '1px solid #ef4444', borderRadius: '2px', marginRight: '8px' }}></div>
              <span>Incorrect</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#fff', border: '1px solid #6b7280', borderRadius: '2px', marginRight: '8px' }}></div>
              <span>No Answer</span>
            </div>
          </div>

          {/* Performance Summary */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} />
              Performance Summary
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={12} />
                  Correct
                </span>
                <span style={{ fontWeight: '500' }}>{getCorrectAnswersCount()}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <XCircle size={12} />
                  Incorrect
                </span>
                <span style={{ fontWeight: '500' }}>{questions.length - getCorrectAnswersCount()}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Award size={12} />
                  Points Earned
                </span>
                <span style={{ fontWeight: '500' }}>{submission.score}/{submission.maxScore}</span>
              </div>
            </div>
          </div>

          {/* Show Correct Answers Toggle */}
          {assignment.showCorrectAnswers && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showCorrectAnswers}
                  onChange={(e) => setShowCorrectAnswers(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <span>Show Correct Answers</span>
              </label>
            </div>
          )}

          {/* Additional Info */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
              <div style={{ marginBottom: '4px' }}>
                <strong>Submitted:</strong> {formatDate(submission.submittedAt)}
              </div>
              {submission.gradedAt && (
                <div style={{ marginBottom: '4px' }}>
                  <strong>Graded:</strong> {formatDate(submission.gradedAt)}
                </div>
              )}
              <div>
                <strong>Status:</strong> {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizReviewPage;