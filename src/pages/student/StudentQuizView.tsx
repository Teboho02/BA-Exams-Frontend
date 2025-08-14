import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Award,
  Eye,
  AlertCircle,
  Info,
  Target,
  Lock,
  RefreshCw
} from 'lucide-react';
import './StudentQuizView.css';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Types - Updated to match actual API response
interface Assignment {
  id: string;
  courseId?: string;
  title: string;
  description: string;
  instructions?: string;
  assignmentType?: string;
  assignment_type: string;
  assignment_group: string;
  grading_type: string;
  maxPoints?: number;
  max_points: number;
  isPublished?: boolean;
  is_published: boolean;
  submissionType?: string;
  submission_type: string;
  dueDate?: string;
  due_date?: string;
  availableFrom?: string;
  available_from?: string;
  availableUntil?: string;
  available_until?: string;
  allowedAttempts?: number;
  allowed_attempts: number;
  hasTimeLimit?: boolean;
  has_time_limit: boolean;
  timeLimitMinutes?: number;
  time_limit_minutes?: number;
  shuffleAnswers?: boolean;
  showCorrectAnswers?: boolean;
  oneQuestionAtTime?: boolean;
  one_question_at_time?: boolean;
  cantGoBack?: boolean;
  cant_go_back?: boolean;
  requireAccessCode?: boolean;
  accessCode?: string;
  password?: string;
  quizInstructions?: string;
  createdAt?: string;
  created_at: string;
  updatedAt?: string;
  updated_at: string;
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
  percentage: number | null;
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

interface QuizData {
  success: boolean;
  assignment: Assignment;
  questions: Question[];
  canEdit?: boolean;
  isStudent?: boolean;
  hasSubmitted?: boolean;
  canRetake?: boolean;
  attemptsUsed?: number;
  attemptsRemaining?: number;
  submission?: Submission;
}

const StudentQuizView: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
//  const location = useLocation();
  const navigate = useNavigate();
  
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [takingQuiz, setTakingQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Fetch quiz data
  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}/quiz`, {
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
        setQuizData(data);
      } else {
        setError(data.message || 'Failed to fetch quiz data');
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      fetchQuizData();
    }
  }, [assignmentId]);

  // Timer for timed quizzes
  useEffect(() => {
    if (takingQuiz && quizData?.assignment.has_time_limit && timeRemaining !== null) {
      if (timeRemaining <= 0) {
        handleSubmitQuiz();
        return;
      }

      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 0) return 0;
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [takingQuiz, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const handleStartQuiz = () => {
    if (!quizData) return;
    
    setTakingQuiz(true);
    setCurrentQuestion(0);
    setAnswers({});
    
    if (quizData.assignment.has_time_limit && quizData.assignment.time_limit_minutes) {
      setTimeRemaining(quizData.assignment.time_limit_minutes * 60);
    }
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (!quizData) return;
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quizData || submitting) return;
    
    try {
      setSubmitting(true);
      
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh quiz data to show submission
        await fetchQuizData();
        setTakingQuiz(false);
      } else {
        alert(data.message || 'Failed to submit quiz');
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewSubmission = () => {
    if (!quizData?.submission) return;
    
    navigate(`/quiz/review/${quizData.submission.id}`, {
      state: {
        assignment: quizData.assignment,
        questions: quizData.questions,
        submission: quizData.submission,
        showCorrectAnswers: quizData.assignment.showCorrectAnswers
      }
    });
  };

  const hasSubmission = () => !!quizData?.submission;
  
  // Calculate attempts information
  const getAllowedAttempts = () => 
    quizData?.assignment.allowed_attempts ?? 1;
  
  const getAttemptsUsed = () => 
    quizData?.attemptsUsed ?? 0;
  
  const getAttemptsRemaining = () => 
    quizData?.attemptsRemaining ?? 0;

  const canTakeQuiz = quizData && 
    (!hasSubmission() || quizData.canRetake) && 
    (getAllowedAttempts() === -1 || getAttemptsRemaining() > 0);
  
  const isMaxedOut = quizData && 
    getAttemptsUsed() >= getAllowedAttempts() && 
    getAllowedAttempts() !== -1;

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
              <h1 className="title">Loading Quiz...</h1>
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
            <h3 className="empty-title">Unable to Load Quiz</h3>
            <p className="empty-description">{error}</p>
            <button onClick={() => navigate(-1)} className="btn btn-primary">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return null;
  }

  // Taking quiz view
  if (takingQuiz && quizData.questions.length > 0) {
    const currentQ = quizData.questions[currentQuestion];
    const currentAnswer = answers[currentQ.id];
    const sortedAnswers = currentQ.answers ? [...currentQ.answers].sort((a, b) => a.answerOrder - b.answerOrder) : [];

    return (
      <div className="assignment-creator">
        {/* Quiz Header */}
        <div className="header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="title">{quizData.assignment.title}</h1>
              <div className="badges">
                <span className="badge badge-info">
                  Question {currentQuestion + 1} of {quizData.questions.length}
                </span>
                <span className="points-display">
                  {currentQ.points} point{currentQ.points !== 1 ? 's' : ''}
                </span>
                {timeRemaining !== null && (
                  <span className={`badge ${timeRemaining < 300 ? 'badge-danger' : 'badge-secondary'}`}>
                    <Clock size={14} />
                    {formatTime(timeRemaining)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Question */}
            <div style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
                {currentQ.questionText}
              </h2>

              {currentQ.imageUrl && (
                <div style={{ marginBottom: '24px' }}>
                  <img 
                    src={currentQ.imageUrl} 
                    alt="Question illustration" 
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                  />
                </div>
              )}

              {/* Answer Options */}
              {currentQ.questionType === 'multiple_choice' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {sortedAnswers.map((answer) => (
                    <label
                      key={answer.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px',
                        border: '2px solid',
                        borderColor: currentAnswer?.answerId === answer.id ? '#3b82f6' : '#e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: currentAnswer?.answerId === answer.id ? '#eff6ff' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQ.id}`}
                        value={answer.id}
                        checked={currentAnswer?.answerId === answer.id}
                        onChange={() => handleAnswerChange(currentQ.id, { answerId: answer.id })}
                        style={{ marginRight: '12px' }}
                      />
                      <span style={{ fontSize: '16px' }}>{answer.answerText}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQ.questionType === 'true_false' && (
                <div style={{ display: 'flex', gap: '16px' }}>
                  {sortedAnswers.map((answer) => (
                    <label
                      key={answer.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px 32px',
                        border: '2px solid',
                        borderColor: currentAnswer?.answerId === answer.id ? '#3b82f6' : '#e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: currentAnswer?.answerId === answer.id ? '#eff6ff' : '#fff',
                        cursor: 'pointer',
                        flex: 1,
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQ.id}`}
                        value={answer.id}
                        checked={currentAnswer?.answerId === answer.id}
                        onChange={() => handleAnswerChange(currentQ.id, { answerId: answer.id })}
                        style={{ marginRight: '8px' }}
                      />
                      <span style={{ fontSize: '16px', fontWeight: '500' }}>{answer.answerText}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQ.questionType === 'short_answer' && (
                <input
                  type="text"
                  value={currentAnswer?.textAnswer || ''}
                  onChange={(e) => handleAnswerChange(currentQ.id, { textAnswer: e.target.value })}
                  placeholder="Enter your answer"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              )}

              {currentQ.questionType === 'essay' && (
                <textarea
                  value={currentAnswer?.textAnswer || ''}
                  onChange={(e) => handleAnswerChange(currentQ.id, { textAnswer: e.target.value })}
                  placeholder="Enter your answer"
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              )}
            </div>

            {/* Navigation */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '24px 32px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0 || quizData.assignment.cant_go_back}
                className="btn btn-secondary"
              >
                <ArrowLeft size={16} />
                Previous
              </button>

              {currentQuestion < quizData.questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="btn btn-primary"
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="btn btn-success"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Submit Quiz
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Question Navigator */}
            <div style={{ padding: '24px 32px', borderTop: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#6b7280' }}>
                Question Navigator
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {quizData.questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => !quizData.assignment.cant_go_back && setCurrentQuestion(index)}
                    disabled={quizData.assignment.cant_go_back && index < currentQuestion}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '1px solid',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: quizData.assignment.cant_go_back && index < currentQuestion ? 'not-allowed' : 'pointer',
                      borderColor: index === currentQuestion ? '#3b82f6' : answers[q.id] ? '#10b981' : '#e5e7eb',
                      backgroundColor: index === currentQuestion ? '#eff6ff' : answers[q.id] ? '#f0fdf4' : '#fff',
                      color: index === currentQuestion ? '#3b82f6' : answers[q.id] ? '#10b981' : '#6b7280'
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Overview/Results view
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
            <h1 className="title">{quizData.assignment.title}</h1>
            <div className="badges">
              <span className="badge badge-secondary">
                {quizData.assignment.max_points} points
              </span>
              {quizData.assignment.has_time_limit && quizData.assignment.time_limit_minutes && (
                <span className="badge badge-info">
                  <Clock size={14} />
                  {quizData.assignment.time_limit_minutes} minutes
                </span>
              )}
              {/* Attempt Badge */}
              {getAllowedAttempts() !== -1 && (
                <span className={`badge ${isMaxedOut ? 'badge-danger' : getAttemptsUsed() > 0 ? 'badge-warning' : 'badge-info'}`}>
                  {getAttemptsUsed()}/{getAllowedAttempts()} attempts used
                </span>
              )}
              {getAllowedAttempts() === -1 && (
                <span className="badge badge-info">
                  Unlimited attempts
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Attempt Status Alert */}
        {isMaxedOut && (
          <div style={{ 
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Lock size={20} style={{ color: '#ef4444' }} />
            <div>
              <div style={{ fontWeight: '600', color: '#991b1b', marginBottom: '4px' }}>
                All attempts used
              </div>
              <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
                You have used all {getAllowedAttempts()} available attempt{getAllowedAttempts() !== 1 ? 's' : ''} for this quiz.
                {hasSubmission() && ` Your final score: ${quizData.submission?.score}/${quizData.submission?.maxScore} (${quizData.submission?.percentage?.toFixed(1)}%)`}
              </div>
            </div>
          </div>
        )}

        {/* Quiz Info Card */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 className="card-header">Quiz Information</h2>
          
          {quizData.assignment.description && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Description</h3>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>{quizData.assignment.description}</p>
            </div>
          )}

          {quizData.assignment.instructions && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Instructions</h3>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>{quizData.assignment.instructions}</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Target size={16} style={{ color: '#6b7280' }} />
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Questions</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                {quizData.questions.length}
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Award size={16} style={{ color: '#6b7280' }} />
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Points</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                {quizData.assignment.max_points}
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <RefreshCw size={16} style={{ color: '#6b7280' }} />
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Attempts Remaining</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: getAttemptsRemaining() === 0 ? '#ef4444' : '#111827' }}>
                {getAllowedAttempts() === -1 ? '∞' : getAttemptsRemaining()}
              </div>
            </div>

            {quizData.assignment.due_date && (
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Calendar size={16} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Due Date</span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                  {formatDate(quizData.assignment.due_date)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Previous Submission Card */}
        {hasSubmission() && quizData.submission && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2 className="card-header">Your Submission</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                  {quizData.submission.score}/{quizData.submission.maxScore}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Score</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '600',
                  color: (quizData.submission.percentage || 0) >= 70 ? '#10b981' : '#ef4444'
                }}>
                  {(quizData.submission.percentage || 0).toFixed(1)}%
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Percentage</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#8b5cf6' }}>
                  #{quizData.submission.attemptNumber}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Attempt</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: quizData.submission.status === 'graded' ? '#10b981' : '#f59e0b',
                  textTransform: 'capitalize'
                }}>
                  {quizData.submission.status}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Status</div>
              </div>
            </div>

            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
              <div style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>
                <strong>Submitted:</strong> {formatDate(quizData.submission.submittedAt)}
              </div>
              {quizData.submission.gradedAt && (
                <div style={{ fontSize: '14px', color: '#4b5563' }}>
                  <strong>Graded:</strong> {formatDate(quizData.submission.gradedAt)}
                </div>
              )}
            </div>

            {quizData.submission.feedback && (
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  Instructor Feedback
                </h4>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: 0 }}>
                  {quizData.submission.feedback}
                </p>
              </div>
            )}

            <button 
              onClick={handleViewSubmission}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              <Eye size={16} />
              Review Submission
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="card">
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {canTakeQuiz ? (
              <>
                <button 
                  onClick={handleStartQuiz}
                  className="btn btn-primary"
                  style={{ flex: 1, minWidth: '200px' }}
                >
                  {quizData.hasSubmitted ? (
                    <>
                      <RefreshCw size={16} />
                      Retake Quiz (Attempt {getAttemptsUsed() + 1})
                    </>
                  ) : (
                    <>
                      <ArrowRight size={16} />
                      Start Quiz
                    </>
                  )}
                </button>
                {quizData.hasSubmitted && hasSubmission() && (
                  <button 
                    onClick={handleViewSubmission}
                    className="btn btn-secondary"
                    style={{ flex: 1, minWidth: '200px' }}
                  >
                    <Eye size={16} />
                    View Last Attempt
                  </button>
                )}
              </>
            ) : (
              <>
                {quizData.hasSubmitted && hasSubmission() && getAttemptsRemaining() === 0 && (
                  <div style={{ 
                    flex: 1,
                    padding: '16px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    textAlign: 'center',
                    minWidth: '200px'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
                      {quizData.submission?.score}/{quizData.submission?.maxScore}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Final Score</div>
                    <button 
                      onClick={handleViewSubmission}
                      className="btn btn-primary"
                      style={{ marginTop: '12px', width: '100%' }}
                    >
                      <Eye size={16} />
                      Review
                    </button>
                  </div>
                )}
                {(!quizData.hasSubmitted || !hasSubmission()) && !canTakeQuiz && (
                  <div style={{ 
                    flex: 1,
                    padding: '16px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    textAlign: 'center',
                    minWidth: '200px'
                  }}>
                    <Lock size={20} style={{ color: '#ef4444', marginBottom: '8px' }} />
                    <div style={{ color: '#991b1b', fontWeight: '600' }}>
                      Quiz Unavailable
                    </div>
                    <div style={{ fontSize: '14px', color: '#7f1d1d', marginTop: '4px' }}>
                      {isMaxedOut ? 'All attempts have been used' : 'This quiz is not available'}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Additional Information */}
          {canTakeQuiz && (
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={16} />
                Before You Start
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1e3a8a' }}>
                {quizData.assignment.has_time_limit && (
                  <li>You have {quizData.assignment.time_limit_minutes} minutes to complete this quiz</li>
                )}
                {quizData.assignment.one_question_at_time && (
                  <li>Questions are presented one at a time</li>
                )}
                {quizData.assignment.cant_go_back && (
                  <li>You cannot go back to previous questions</li>
                )}
                {quizData.assignment.shuffleAnswers && (
                  <li>Answer choices are shuffled</li>
                )}
                {getAllowedAttempts() !== -1 && (
                  <li>
                    This is attempt {getAttemptsUsed() + 1} of {getAllowedAttempts()}
                  </li>
                )}
                <li>Make sure you have a stable internet connection</li>
              </ul>
            </div>
          )}
        </div>

        {/* Quiz Settings Info */}
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 className="card-header">Quiz Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {quizData.assignment.showCorrectAnswers ? (
                <CheckCircle size={16} style={{ color: '#10b981' }} />
              ) : (
                <XCircle size={16} style={{ color: '#ef4444' }} />
              )}
              <span style={{ fontSize: '14px', color: '#4b5563' }}>
                {quizData.assignment.showCorrectAnswers ? 'Shows correct answers after submission' : 'Correct answers hidden'}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {quizData.assignment.one_question_at_time ? (
                <CheckCircle size={16} style={{ color: '#10b981' }} />
              ) : (
                <XCircle size={16} style={{ color: '#ef4444' }} />
              )}
              <span style={{ fontSize: '14px', color: '#4b5563' }}>
                {quizData.assignment.one_question_at_time ? 'One question at a time' : 'All questions visible'}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!quizData.assignment.cant_go_back ? (
                <CheckCircle size={16} style={{ color: '#10b981' }} />
              ) : (
                <XCircle size={16} style={{ color: '#ef4444' }} />
              )}
              <span style={{ fontSize: '14px', color: '#4b5563' }}>
                {!quizData.assignment.cant_go_back ? 'Can review previous questions' : 'Cannot go back'}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {quizData.assignment.shuffleAnswers ? (
                <CheckCircle size={16} style={{ color: '#10b981' }} />
              ) : (
                <XCircle size={16} style={{ color: '#ef4444' }} />
              )}
              <span style={{ fontSize: '14px', color: '#4b5563' }}>
                {quizData.assignment.shuffleAnswers ? 'Answers shuffled' : 'Answers in fixed order'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizView;