import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  Flag,
  Save,
  Send,
  X,
  Timer,
  HelpCircle,
  FileText
} from 'lucide-react';
import './StudentQuizView.css';

// Updated types to match your API
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

interface QuizData {
  assignment: Assignment;
  questions: Question[];
  canEdit: boolean;
}

interface Answer {
  questionId: string;
  selectedAnswer?: string; // Answer ID instead of index
  textAnswer?: string;
  isAnswered: boolean;
  flagged: boolean;
}

interface QuizState {
  assignment: Assignment;
  questions: Question[];
  attemptNumber: number;
}

const QuizAttemptPage: React.FC = () => {
//  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  

  const location = useLocation();
  const navigate = useNavigate();
  
  // Get quiz data from navigation state or fetch from API
  const quizState = location.state as QuizState;
  
  const [quiz, setQuiz] = useState<Assignment | null>(quizState?.assignment || null);
  const [questions, setQuestions] = useState<Question[]>(quizState?.questions || []);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime] = useState(new Date());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [loading, setLoading] = useState(!quiz);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Fetch quiz data if not provided via navigation
  const fetchQuizData = async () => {
    if (!assignmentId) return;
    
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

      const data = await response.json();

      if (data.success && data.assignment) {
        // Only allow quiz assignments
        if (data.assignment.assignmentType !== 'quiz') {
          setError('This assignment is not a quiz');
          return;
        }
        
        setQuiz(data.assignment);
        setQuestions(data.questions || []);
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

  // Initialize quiz and answers
  useEffect(() => {
    if (!quiz && assignmentId) {
      fetchQuizData();
    } else if (quiz && questions.length > 0) {
      const initialAnswers: Answer[] = questions.map(q => ({
        questionId: q.id,
        selectedAnswer: undefined,
        textAnswer: '',
        isAnswered: false,
        flagged: false
      }));
      setAnswers(initialAnswers);
      
      if (quiz.hasTimeLimit && quiz.timeLimitMinutes) {
        setTimeRemaining(quiz.timeLimitMinutes * 60); // Convert to seconds
      }
      
      setLoading(false);
    }
  }, [quiz, questions, assignmentId]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          // Auto-submit when time runs out
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isSubmitted]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (seconds: number): string => {
    if (seconds < 300) return '#ef4444'; // Red for < 5 minutes
    if (seconds < 600) return '#f59e0b'; // Orange for < 10 minutes
    return '#10b981'; // Green for > 10 minutes
  };

  const updateAnswer = useCallback((questionId: string, selectedAnswer?: string, textAnswer?: string) => {
    setAnswers(prev => prev.map(answer => 
      answer.questionId === questionId 
        ? { 
            ...answer, 
            selectedAnswer,
            textAnswer: textAnswer !== undefined ? textAnswer : answer.textAnswer,
            isAnswered: selectedAnswer !== undefined || (!!textAnswer && textAnswer.trim() !== '')
          }
        : answer
    ));
  }, []);

  const toggleFlag = useCallback((questionId: string) => {
    setAnswers(prev => prev.map(answer => 
      answer.questionId === questionId 
        ? { ...answer, flagged: !answer.flagged }
        : answer
    ));
  }, []);

  const getAnsweredCount = (): number => {
    return answers.filter(answer => answer.isAnswered).length;
  };

  const getFlaggedCount = (): number => {
    return answers.filter(answer => answer.flagged).length;
  };

  const navigateToQuestion = (index: number) => {
    if (quiz?.cantGoBack && index < currentQuestion) {
      return; // Can't go back
    }
    setCurrentQuestion(index);
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (!quiz?.cantGoBack && currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      // Convert answers to the format expected by API
      const submissionAnswers: { [questionId: string]: any } = {};
      answers.forEach(answer => {
        if (answer.isAnswered) {
          submissionAnswers[answer.questionId] = {
            answerId: answer.selectedAnswer,
            textAnswer: answer.textAnswer
          };
        }
      });

      const response = await fetch(`http://localhost:3000/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: submissionAnswers,
          timeStarted: startTime.toISOString(),
          timeCompleted: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        setShowSubmitModal(false);
        
        // Navigate to results after a short delay
        setTimeout(() => {
          navigate(`/quiz/results/${data.submission.id}`, {
            state: {
              submission: data.submission,
              showCorrectAnswers: data.showCorrectAnswers
            }
          });
        }, 2000);
      } else {
        alert('Failed to submit quiz: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Submit quiz error:', error);
      alert('Network error occurred while submitting quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startQuizAttempt = () => {
    setShowInstructions(false);
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
            <p style={{ color: '#6b7280' }}>Preparing your quiz...</p>
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

  if (!quiz || questions.length === 0) {
    return (
      <div className="assignment-creator">
        <div className="main-content">
          <div className="card empty-state">
            <div className="empty-icon">
              <AlertCircle size={48} />
            </div>
            <h3 className="empty-title">Quiz not found</h3>
            <p className="empty-description">The quiz you're looking for doesn't exist or has been removed.</p>
            <button onClick={() => navigate(-1)} className="btn btn-primary">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Instructions screen
  if (showInstructions) {
    return (
      <div className="assignment-creator">
        <div className="header">
          <div className="header-content">
            <div className="header-left">
              <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginRight: '16px' }}>
                <ArrowLeft size={16} />
                Back
              </button>
              <h1 className="title">{quiz.title}</h1>
              <div className="badges">
                <span className="badge badge-info">
                  <FileText size={14} />
                  Instructions
                </span>
                <span className="points-display">
                  {questions.reduce((sum, q) => sum + q.points, 0)} Points • {questions.length} Questions
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '32px' }}>
              <h2 className="card-header" style={{ marginBottom: '20px' }}>Quiz Instructions</h2>
              
              <div className="info-box" style={{ marginBottom: '24px' }}>
                <p className="info-text" style={{ fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
                  {quiz.quizInstructions || quiz.description || 'Please read all questions carefully and select the best answer.'}
                </p>
              </div>

              {/* Quiz Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="info-box" style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
                    {questions.length}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Questions</div>
                </div>
                
                <div className="info-box" style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
                    {questions.reduce((sum, q) => sum + q.points, 0)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Points</div>
                </div>
                
                <div className="info-box" style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
                    {quiz.hasTimeLimit ? `${quiz.timeLimitMinutes} min` : 'No Limit'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Time Limit</div>
                </div>
                
                <div className="info-box" style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '8px' }}>
                    {quiz.allowedAttempts === -1 ? '∞' : quiz.allowedAttempts}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Attempts</div>
                </div>
              </div>

              {/* Important Notes */}
              <div style={{ marginBottom: '32px' }}>
                <h3 className="card-header" style={{ marginBottom: '16px' }}>Important Notes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {quiz.hasTimeLimit && (
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#374151' }}>
                      <Timer size={20} style={{ marginRight: '12px', color: '#f59e0b' }} />
                      <span>This quiz has a time limit of {quiz.timeLimitMinutes} minutes</span>
                    </div>
                  )}
                  
                  {quiz.cantGoBack && (
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#374151' }}>
                      <AlertCircle size={20} style={{ marginRight: '12px', color: '#ef4444' }} />
                      <span>You cannot go back to previous questions once answered</span>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#374151' }}>
                    <Save size={20} style={{ marginRight: '12px', color: '#10b981' }} />
                    <span>Your answers are automatically saved as you progress</span>
                  </div>
                  
                  {quiz.shuffleAnswers && (
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#374151' }}>
                      <HelpCircle size={20} style={{ marginRight: '12px', color: '#3b82f6' }} />
                      <span>Answer choices are randomly shuffled</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                <button
                  onClick={startQuizAttempt}
                  className="btn btn-primary btn-large"
                  style={{ fontSize: '18px', padding: '16px 32px', minWidth: '200px' }}
                  type="button"
                >
                  <FileText size={20} />
                  Begin Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz completion screen
  if (isSubmitted) {
    return (
      <div className="assignment-creator">
        <div className="header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="title">Quiz Completed</h1>
              <div className="badges">
                <span className="badge badge-success">
                  <CheckCircle size={14} />
                  Submitted
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{ marginBottom: '24px' }}>
                <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 16px' }} />
                <h2 className="card-header" style={{ marginBottom: '8px' }}>Quiz Successfully Submitted!</h2>
                <p style={{ color: '#6b7280', fontSize: '16px' }}>
                  Thank you for completing "{quiz.title}"
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="info-box" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }}>
                    {getAnsweredCount()}/{questions.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Questions Answered</div>
                </div>
                
                <div className="info-box" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>
                    {Math.floor((new Date().getTime() - startTime.getTime()) / 60000)}m
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Time Taken</div>
                </div>
              </div>

              <div className="info-box" style={{ marginBottom: '24px' }}>
                <p className="info-text" style={{ margin: 0 }}>
                  Redirecting to results page... Your results will be available once your instructor has reviewed your submission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers.find(a => a.questionId === currentQ.id);

  // Sort answers by their order
  const sortedAnswers = currentQ.answers ? [...currentQ.answers].sort((a, b) => a.answerOrder - b.answerOrder) : [];

  return (
    <div className="assignment-creator">
      {/* Header with Timer */}
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="title">{quiz.title}</h1>
            <div className="badges">
              <span className="badge badge-info">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              {timeRemaining !== null && (
                <span className="badge" style={{ 
                  backgroundColor: getTimeColor(timeRemaining) === '#ef4444' ? '#fef2f2' : 
                                 getTimeColor(timeRemaining) === '#f59e0b' ? '#fffbeb' : '#f0fdf4',
                  color: getTimeColor(timeRemaining)
                }}>
                  <Timer size={14} />
                  {formatTime(timeRemaining)}
                </span>
              )}
              <span className="points-display">
                {getAnsweredCount()}/{questions.length} Answered
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setShowSubmitModal(true)}
              className="btn btn-success"
              disabled={isSubmitting}
              type="button"
            >
              <Send size={16} />
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div style={{ display: 'grid', gridTemplateColumns: quiz.oneQuestionAtTime ? '1fr' : '1fr 300px', gap: '24px' }}>
          {/* Main Question Area */}
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
                </div>
              </div>
              <button
                onClick={() => toggleFlag(currentQ.id)}
                className={`icon-btn ${currentAnswer?.flagged ? 'danger' : ''}`}
                title={currentAnswer?.flagged ? 'Remove flag' : 'Flag for review'}
                type="button"
              >
                <Flag size={16} />
              </button>
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

            {/* Answer Options */}
            <div className="form-group">
              {(currentQ.questionType === 'multiple_choice' || currentQ.questionType === 'true_false') && sortedAnswers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: currentQ.questionType === 'true_false' ? 'row' : 'column', gap: currentQ.questionType === 'true_false' ? '16px' : '12px' }}>
                  {sortedAnswers.map((answer) => (
                    <label
                      key={answer.id}
                      className={`answer-option ${currentAnswer?.selectedAnswer === answer.id ? 'selected' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px',
                        border: '2px solid',
                        borderColor: currentAnswer?.selectedAnswer === answer.id ? '#3b82f6' : '#e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: currentAnswer?.selectedAnswer === answer.id ? '#eff6ff' : '#fff',
                        transition: 'all 0.2s ease',
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
                        checked={currentAnswer?.selectedAnswer === answer.id}
                        onChange={() => updateAnswer(currentQ.id, answer.id)}
                        style={{ marginRight: currentQ.questionType === 'true_false' ? '8px' : '12px' }}
                      />
                      <span style={{ 
                        fontSize: '16px', 
                        color: '#374151',
                        fontWeight: currentQ.questionType === 'true_false' ? '500' : 'normal'
                      }}>
                        {answer.answerText}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {currentQ.questionType === 'short_answer' && (
                <input
                  type="text"
                  value={currentAnswer?.textAnswer || ''}
                  onChange={(e) => updateAnswer(currentQ.id, undefined, e.target.value)}
                  className="form-input"
                  placeholder="Enter your answer..."
                  style={{ fontSize: '16px', padding: '12px' }}
                />
              )}

              {currentQ.questionType === 'essay' && (
                <textarea
                  value={currentAnswer?.textAnswer || ''}
                  onChange={(e) => updateAnswer(currentQ.id, undefined, e.target.value)}
                  className="form-textarea"
                  placeholder="Enter your detailed answer..."
                  style={{ fontSize: '16px', padding: '12px', minHeight: '200px' }}
                />
              )}

              {currentQ.questionType === 'file_upload' && (
                <div className="info-box">
                  <p>File upload questions are not yet supported in this interface.</p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="bottom-buttons" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0 || quiz.cantGoBack}
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
                  onClick={() => setShowSubmitModal(true)}
                  className="btn btn-success"
                  disabled={isSubmitting}
                  type="button"
                >
                  <Send size={16} />
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>
          </div>

          {/* Question Navigator Sidebar (only if not one-question-at-time) */}
          {!quiz.oneQuestionAtTime && (
            <div className="card" style={{ padding: '24px', height: 'fit-content' }}>
              <h3 className="card-header" style={{ marginBottom: '16px' }}>Question Navigator</h3>
              
              {/* Progress Summary */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  <span>Progress</span>
                  <span>{getAnsweredCount()}/{questions.length}</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#e5e7eb', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: `${(getAnsweredCount() / questions.length) * 100}%`,
                    height: '100%',
                    backgroundColor: '#10b981',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Question Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '16px' }}>
                {questions.map((q, index) => {
                  const answer = answers.find(a => a.questionId === q.id);
                  return (
                    <button
                      key={q.id}
                      onClick={() => navigateToQuestion(index)}
                      disabled={quiz.cantGoBack && index < currentQuestion}
                      className={`question-nav-btn ${
                        index === currentQuestion ? 'current' : 
                        answer?.isAnswered ? 'answered' : 
                        answer?.flagged ? 'flagged' : 'unanswered'
                      }`}
                      style={{
                        width: '40px',
                        height: '40px',
                        border: '2px solid',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: (quiz.cantGoBack && index < currentQuestion) ? 'not-allowed' : 'pointer',
                        opacity: (quiz.cantGoBack && index < currentQuestion) ? 0.5 : 1,
                        borderColor: 
                          index === currentQuestion ? '#3b82f6' :
                          answer?.isAnswered ? '#10b981' :
                          answer?.flagged ? '#f59e0b' : '#6b7280',
                        backgroundColor:
                          index === currentQuestion ? '#eff6ff' :
                          answer?.isAnswered ? '#f0fdf4' :
                          answer?.flagged ? '#fffbeb' : '#fff',
                        color:
                          index === currentQuestion ? '#3b82f6' :
                          answer?.isAnswered ? '#10b981' :
                          answer?.flagged ? '#f59e0b' : '#6b7280',
                        position: 'relative'
                      }}
                      type="button"
                    >
                      {index + 1}
                      {answer?.flagged && (
                        <Flag size={10} style={{ 
                          position: 'absolute', 
                          top: '2px', 
                          right: '2px',
                          color: '#f59e0b'
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
                  <span>Answered</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '2px', marginRight: '8px' }}></div>
                  <span>Flagged</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '2px', marginRight: '8px' }}></div>
                  <span>Unanswered</span>
                </div>
              </div>

              {/* Flagged Questions */}
              {getFlaggedCount() > 0 && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <Flag size={16} style={{ color: '#f59e0b', marginRight: '8px' }} />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                      Flagged for Review ({getFlaggedCount()})
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {answers
                      .map((answer, index) => ({ answer, index }))
                      .filter(({ answer }) => answer.flagged)
                      .map(({ index }) => (
                        <button
                          key={index}
                          onClick={() => navigateToQuestion(index)}
                          disabled={quiz.cantGoBack && index < currentQuestion}
                          className="btn btn-secondary"
                          style={{ 
                            fontSize: '12px', 
                            padding: '4px 8px',
                            opacity: (quiz.cantGoBack && index < currentQuestion) ? 0.5 : 1
                          }}
                          type="button"
                        >
                          Q{index + 1}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
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
              <h3 className="card-header" style={{ margin: 0 }}>Submit Quiz</h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="icon-btn"
                disabled={isSubmitting}
                type="button"
              >
                <X size={16} />
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '16px', color: '#374151', marginBottom: '16px' }}>
                Are you sure you want to submit your quiz? This action cannot be undone.
              </p>
              
              {/* Submission Summary */}
              <div className="info-box" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: getAnsweredCount() === questions.length ? '#10b981' : '#f59e0b' }}>
                      {getAnsweredCount()}/{questions.length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Questions Answered</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: getFlaggedCount() > 0 ? '#f59e0b' : '#6b7280' }}>
                      {getFlaggedCount()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Flagged for Review</div>
                  </div>
                </div>
              </div>

              {getAnsweredCount() < questions.length && (
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#fffbeb', 
                  border: '1px solid #f9d71c', 
                  borderRadius: '6px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AlertCircle size={16} style={{ color: '#f59e0b', marginRight: '8px' }} />
                    <span style={{ fontSize: '14px', color: '#92400e' }}>
                      You have {questions.length - getAnsweredCount()} unanswered question{questions.length - getAnsweredCount() !== 1 ? 's' : ''}.
                    </span>
                  </div>
                </div>
              )}

              {getFlaggedCount() > 0 && (
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#fef3c7', 
                  border: '1px solid #f59e0b', 
                  borderRadius: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Flag size={16} style={{ color: '#f59e0b', marginRight: '8px' }} />
                    <span style={{ fontSize: '14px', color: '#92400e' }}>
                      You have {getFlaggedCount()} question{getFlaggedCount() !== 1 ? 's' : ''} flagged for review.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="bottom-buttons" style={{ marginTop: '24px' }}>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="btn btn-secondary"
                disabled={isSubmitting}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuiz}
                className="btn btn-success"
                disabled={isSubmitting}
                type="button"
              >
                {isSubmitting ? (
                  <>
                    <span style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid transparent',
                      borderTop: '2px solid currentColor',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      display: 'inline-block',
                      marginRight: '8px'
                    }}></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Quiz
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Warning (when < 1 minute remaining) */}
      {timeRemaining !== null && timeRemaining <= 60 && timeRemaining > 0 && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 999,
          animation: 'pulse 2s infinite'
        }}>
          <div className="card" style={{ 
            padding: '16px', 
            backgroundColor: '#fef2f2', 
            borderColor: '#ef4444',
            minWidth: '300px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <AlertCircle size={20} style={{ marginRight: '12px', color: '#ef4444' }} />
              <div>
                <div style={{ fontWeight: '600', color: '#ef4444' }}>Time Running Out!</div>
                <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
                  Only {formatTime(timeRemaining)} remaining
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAttemptPage;