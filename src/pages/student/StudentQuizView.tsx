import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {Clock, Calendar,Lock,Eye,EyeOff,Play,BookOpen,AlertCircle,CheckCircle,Timer,Users,X,ArrowLeft} from 'lucide-react';
import './StudentQuizView.css';
//import Layout from '../../components/Layout';

// Updated types to match your API response
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
  answers: Answer[];
}

interface Answer {
  id: string;
  questionId: string;
  answerText: string;
  isCorrect: boolean;
  feedback?: string;
  answerOrder: number;
}

interface QuizData {
  assignment: Assignment;
  questions: Question[];
  canEdit: boolean;
}

interface QuizAttempt {
  id: string;
  assignmentId: string;
  studentId: string;
  score: number;
  submittedAt: string;
  attemptNumber: number;
  status: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

const StudentQuizView: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Fetch quiz data from API
  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/assignments/${assignmentId}`, {
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

      const data: ApiResponse<QuizData> = await response.json();

      if (data.success && data.data) {
        // Only show quiz assignments
        if (data.data.assignment.assignmentType !== 'quiz') {
          setError('This assignment is not a quiz');
          return;
        }

        setQuizData(data.data);

        // Fetch user attempts for this quiz
        await fetchUserAttempts();
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

  // Fetch user's attempts for this quiz
  const fetchUserAttempts = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // You'll need to implement this endpoint in your API
      const response = await fetch(`http://localhost:3000/api/assignments/${assignmentId}/submissions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.submissions) {
          setAttempts(data.submissions);
        }
      }
    } catch (err) {
      console.error('Error fetching attempts:', err);
    }
  };

  // Verify quiz password
  const verifyQuizPassword = async (enteredPassword: string): Promise<boolean> => {
    try {
      const token = getAuthToken();
      if (!token) return false;

      const response = await fetch(`http://localhost:3000/api/assignments/${assignmentId}/verify-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: enteredPassword }),
      });

      const data = await response.json();
      return data.success;
    } catch (err) {
      console.error('Error verifying password:', err);
      return false;
    }
  };

  useEffect(() => {
    if (assignmentId) {
      fetchQuizData();
    }
  }, [assignmentId]);

  const getQuizStatus = (assignment: Assignment): 'available' | 'upcoming' | 'expired' | 'completed' => {
    if (!assignment) return 'expired';

    const now = new Date();
    const availableFrom = assignment.availableFrom ? new Date(assignment.availableFrom) : null;
    const availableUntil = assignment.availableUntil ? new Date(assignment.availableUntil) : null;
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;

    // Check if completed
    const userAttempts = attempts.filter(attempt => attempt.assignmentId === assignment.id);
    if (userAttempts.length >= assignment.allowedAttempts && assignment.allowedAttempts !== -1) {
      return 'completed';
    }

    // Check availability dates
    if (availableFrom && now < availableFrom) {
      return 'upcoming';
    }

    if ((availableUntil && now > availableUntil) || (dueDate && now > dueDate)) {
      return 'expired';
    }

    return 'available';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getTotalPoints = (questions: Question[]): number => {
    return questions.reduce((total, question) => total + question.points, 0);
  };

  const getUserAttempts = (assignmentId: string): QuizAttempt[] => {
    return attempts.filter(attempt => attempt.assignmentId === assignmentId);
  };

  const getBestScore = (assignmentId: string): number | null => {
    const userAttempts = getUserAttempts(assignmentId);
    if (userAttempts.length === 0) return null;
    return Math.max(...userAttempts.map(attempt => attempt.score));
  };

  const startQuizSession = (assignment: Assignment) => {
    // Navigate to quiz taking interface
    navigate(`/student/quizAttemp/${assignment.id}`, {
      state: {
        assignment,
        questions: quizData?.questions || [],
        attemptNumber: getUserAttempts(assignment.id).length + 1
      }
    });
  };

  const handleStartQuiz = async (assignment: Assignment) => {
    if (assignment.password) {
      setShowPasswordModal(true);
      setPassword('');
      setPasswordError('');
    } else {
      startQuizSession(assignment);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!quizData?.assignment) return;

    setPasswordError('');

    // Verify password with API
    const isValid = await verifyQuizPassword(password);

    if (isValid) {
      setShowPasswordModal(false);
      setPassword('');
      setPasswordError('');
      startQuizSession(quizData.assignment);
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="assignment-creator">
        <div className="header">
          <div className="header-content">
            <div className="header-left">
              <button onClick={handleBack} className="btn btn-secondary" style={{ marginRight: '16px' }}>
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
            <p style={{ color: '#6b7280' }}>Loading your quiz...</p>
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
              <button onClick={handleBack} className="btn btn-secondary" style={{ marginRight: '16px' }}>
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
            <button onClick={fetchQuizData} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const assignment = quizData?.assignment;
  const questions = quizData?.questions || [];

  return (
    <div className="assignment-creator">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={handleBack} className="btn btn-secondary" style={{ marginRight: '16px' }}>
              <ArrowLeft size={16} />
              Back
            </button>
            <h1 className="title">{assignment?.title || 'Quiz'}</h1>
            <div className="badges">
              {assignment && (
                <>
                  <span className={`badge ${getQuizStatus(assignment) === 'available' ? 'badge-published' :
                      getQuizStatus(assignment) === 'upcoming' ? 'badge-info' :
                        getQuizStatus(assignment) === 'expired' ? 'badge-danger' :
                          'badge-success'
                    }`}>
                    {getQuizStatus(assignment) === 'available' && <><CheckCircle size={14} />Available</>}
                    {getQuizStatus(assignment) === 'upcoming' && <><Clock size={14} />Upcoming</>}
                    {getQuizStatus(assignment) === 'expired' && <><AlertCircle size={14} />Expired</>}
                    {getQuizStatus(assignment) === 'completed' && <><CheckCircle size={14} />Completed</>}
                  </span>
                  {assignment.password && (
                    <span className="badge badge-warning">
                      <Lock size={14} />
                      Password Required
                    </span>
                  )}
                  <span className="points-display">
                    {getTotalPoints(questions)} Points • {questions.length} Questions
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        {!assignment ? (
          <div className="card empty-state">
            <div className="empty-icon">
              <BookOpen size={48} />
            </div>
            <h3 className="empty-title">No quiz available</h3>
            <p className="empty-description">Please check back later.</p>
          </div>
        ) : (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '32px' }}>
              {/* Quiz Overview Section */}
              <div style={{ marginBottom: '32px' }}>
                <h2 className="card-header" style={{ marginBottom: '16px' }}>Quiz Overview</h2>
                <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#374151', marginBottom: '20px' }}>
                  {assignment.description}
                </p>
              </div>

              {/* Quiz Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="info-box" style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
                    {questions.length}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Questions</div>
                </div>
                <div className="info-box" style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
                    {getTotalPoints(questions)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Total Points</div>
                </div>
                <div className="info-box" style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
                    {assignment.hasTimeLimit ? formatDuration(assignment.timeLimitMinutes || 0) : 'No Limit'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Time Limit</div>
                </div>
                <div className="info-box" style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '8px' }}>
                    {getUserAttempts(assignment.id).length}/{assignment.allowedAttempts === -1 ? '∞' : assignment.allowedAttempts}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Attempts</div>
                </div>
              </div>

              {/* Quiz Details Section */}
              <div style={{ marginBottom: '32px' }}>
                <h3 className="card-header" style={{ marginBottom: '16px' }}>Quiz Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Due Date */}
                  {assignment.dueDate && (
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#374151' }}>
                      <Calendar size={20} style={{ marginRight: '12px', color: '#ef4444' }} />
                      <span><strong>Due Date:</strong> {formatDate(assignment.dueDate)}</span>
                    </div>
                  )}

                  {/* Available Period */}
                  {assignment.availableFrom && assignment.availableUntil && (
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#374151' }}>
                      <Clock size={20} style={{ marginRight: '12px', color: '#8b5cf6' }} />
                      <span>
                        <strong>Available:</strong> {formatDate(assignment.availableFrom)} - {formatDate(assignment.availableUntil)}
                      </span>
                    </div>
                  )}

                  {/* Attempts */}
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#374151' }}>
                    <Users size={20} style={{ marginRight: '12px', color: '#3b82f6' }} />
                    <span>
                      <strong>Allowed Attempts:</strong> {assignment.allowedAttempts === -1 ? 'Unlimited' : assignment.allowedAttempts}
                    </span>
                  </div>

                  {/* Time Limit */}
                  {assignment.hasTimeLimit && (
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#374151' }}>
                      <Timer size={20} style={{ marginRight: '12px', color: '#f59e0b' }} />
                      <span>
                        <strong>Time Limit:</strong> {formatDuration(assignment.timeLimitMinutes || 0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions Section */}
              {assignment.quizInstructions && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 className="card-header" style={{ marginBottom: '16px' }}>Instructions</h3>
                  <div className="info-box">
                    <p className="info-text" style={{ fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
                      {assignment.quizInstructions}
                    </p>
                  </div>
                </div>
              )}

              {/* Best Score Display */}
              {getBestScore(assignment.id) !== null && (
                <div style={{ marginBottom: '32px' }}>
                  <div className="info-box" style={{ backgroundColor: '#f0fdf4', borderColor: '#22c55e' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircle size={20} style={{ marginRight: '12px', color: '#16a34a' }} />
                      <span style={{ fontSize: '16px', color: '#16a34a', fontWeight: '600' }}>
                        Your Best Score: {getBestScore(assignment.id)} / {getTotalPoints(questions)} points
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                {(() => {
                  const status = getQuizStatus(assignment);
                  const userAttempts = getUserAttempts(assignment.id);

                  if (status === 'available') {
                    return (
                      <button
                        onClick={() => handleStartQuiz(assignment)}
                        className="btn btn-primary btn-large"
                        style={{ fontSize: '18px', padding: '16px 32px', minWidth: '200px' }}
                        type="button"
                      >
                        <Play size={20} />
                        {userAttempts.length > 0 ? 'Retake Quiz' : 'Start Quiz'}
                      </button>
                    );
                  }

                  if (status === 'upcoming') {
                    return (
                      <button
                        disabled
                        className="btn btn-secondary btn-large"
                        style={{ fontSize: '18px', padding: '16px 32px', minWidth: '200px', opacity: 0.6 }}
                        type="button"
                      >
                        <Clock size={20} />
                        Quiz Not Available Yet
                      </button>
                    );
                  }

                  if (status === 'expired') {
                    return (
                      <button
                        disabled
                        className="btn btn-secondary btn-large"
                        style={{ fontSize: '18px', padding: '16px 32px', minWidth: '200px', opacity: 0.6, color: '#ef4444' }}
                        type="button"
                      >
                        <AlertCircle size={20} />
                        Quiz Has Expired
                      </button>
                    );
                  }

                  if (status === 'completed') {
                    return (
                      <button
                        disabled
                        className="btn btn-success btn-large"
                        style={{ fontSize: '18px', padding: '16px 32px', minWidth: '200px', opacity: 0.8 }}
                        type="button"
                      >
                        <CheckCircle size={20} />
                        Quiz Completed
                      </button>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && assignment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="card-header" style={{ margin: 0 }}>Enter Quiz Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setPasswordError('');
                }}
                className="icon-btn"
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            <div className="info-box" style={{ marginBottom: '20px' }}>
              <p className="info-text" style={{ margin: 0 }}>
                This quiz requires a password to access: <strong>{assignment.title}</strong>
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  className="form-input"
                  placeholder="Enter password"
                  style={{ paddingRight: '40px' }}
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="icon-btn"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && (
                <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>{passwordError}</p>
              )}
            </div>

            <div className="bottom-buttons" style={{ marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setPasswordError('');
                }}
                className="btn btn-secondary"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="btn btn-primary"
                type="button"
                disabled={!password.trim()}
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default StudentQuizView;