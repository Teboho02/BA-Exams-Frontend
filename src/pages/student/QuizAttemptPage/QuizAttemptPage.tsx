import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Timer,
  AlertCircle,
  Save
} from 'lucide-react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './StudentQuizView.css';
// Import components
import QuizInstructions from './QuizInstructions';
import QuizCompletion from './QuizCompletion';
import QuizNavigator from './QuizNavigator';
import QuestionDisplay from './QuestionDisplay';
import SubmitModal from './SubmitModal';
import TimeWarning from './TimeWarning';

// Import types
import type { Assignment, Question, Answer, QuizState } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const QuizAttemptPage: React.FC = () => {
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
  const [startTime, setStartTime] = useState(new Date());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [loading, setLoading] = useState(!quiz);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('');

  // New state for submission status
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(quizState?.hasSubmitted || false);
  const [canRetake, setCanRetake] = useState<boolean>(quizState?.canRetake || false);
  const [submission, setSubmission] = useState<any>(quizState?.submission || null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  // localStorage functions
  const saveAnswersToStorage = useCallback((answers: Answer[], assignmentId: string, timeRemaining?: number | null, startTime?: Date) => {
    try {
      const storageKey = `quiz_answers_${assignmentId}`;
      const now = new Date();
      const dataToSave = {
        answers,
        timeRemaining,
        startTime: startTime?.toISOString(),
        timestamp: Date.now(),
        lastSaved: now.toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      setLastSaved(now.toLocaleTimeString());
      console.log('Answers and time saved to localStorage');
    } catch (error) {
      console.error('Failed to save answers to localStorage:', error);
    }
  }, []);

  const loadAnswersFromStorage = useCallback((assignmentId: string): { answers: Answer[], timeRemaining?: number, startTime?: Date } | null => {
    try {
      const storageKey = `quiz_answers_${assignmentId}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('Loaded answers from localStorage:', parsedData.lastSaved);
        
        return {
          answers: parsedData.answers,
          timeRemaining: parsedData.timeRemaining,
          startTime: parsedData.startTime ? new Date(parsedData.startTime) : undefined
        };
      }
    } catch (error) {
      console.error('Failed to load answers from localStorage:', error);
    }
    return null;
  }, []);

  const clearAnswersFromStorage = useCallback((assignmentId: string) => {
    try {
      const storageKey = `quiz_answers_${assignmentId}`;
      localStorage.removeItem(storageKey);
      console.log('Cleared saved answers from localStorage');
    } catch (error) {
      console.error('Failed to clear answers from localStorage:', error);
    }
  }, []);

  // Show restore notification
  const showRestoreNotification = (timeRestored: boolean = false) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #059669;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      font-size: 14px;
    `;
    notification.textContent = timeRestored 
      ? '✓ Quiz progress and remaining time restored' 
      : '✓ Previous answers restored from local storage';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 4000);
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

      const response = await fetch(API_BASE_URL + `/api/assignments/${assignmentId}`, {
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
        setHasSubmitted(data.hasSubmitted || false);
        setCanRetake(data.canRetake || false);
        setSubmission(data.submission || null);
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
    } else if (quiz && questions.length > 0 && assignmentId) {
      // Try to load saved answers first
      const savedData = loadAnswersFromStorage(assignmentId);
      
      let initialAnswers: Answer[];
      let restoredTime = false;
      
      if (savedData && savedData.answers && savedData.answers.length === questions.length) {
        // Use saved answers if they exist and match current questions
        console.log('Restoring saved answers and time');
        initialAnswers = savedData.answers;
        
        // Restore start time if available
        if (savedData.startTime) {
          setStartTime(savedData.startTime);
        }
        
        // Restore remaining time if quiz has time limit and saved time exists
        if (quiz.hasTimeLimit && savedData.timeRemaining !== undefined && savedData.timeRemaining !== null) {
          setTimeRemaining(savedData.timeRemaining);
          restoredTime = true;
        } else if (quiz.hasTimeLimit && quiz.timeLimitMinutes) {
          // Calculate remaining time based on elapsed time since start
          const now = new Date();
          const elapsed = savedData.startTime ? 
            Math.floor((now.getTime() - new Date(savedData.startTime).getTime()) / 1000) : 0;
          const totalTimeInSeconds = quiz.timeLimitMinutes * 60;
          const remaining = Math.max(0, totalTimeInSeconds - elapsed);
          setTimeRemaining(remaining);
          restoredTime = true;
        }
        
        showRestoreNotification(restoredTime);
      } else {
        // Create fresh answers
        initialAnswers = questions.map(q => ({
          questionId: q.id,
          selectedAnswer: undefined,
          textAnswer: '',
          isAnswered: false,
          flagged: false
        }));
        
        // Set initial time limit for new quiz attempt
        if (quiz.hasTimeLimit && quiz.timeLimitMinutes) {
          setTimeRemaining(quiz.timeLimitMinutes * 60);
        }
      }
      
      setAnswers(initialAnswers);
      setLoading(false);
    }
  }, [quiz, questions, assignmentId, loadAnswersFromStorage]);

  // Timer countdown with auto-save
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          // Auto-submit when time runs out
          handleSubmitQuiz();
          return 0;
        }
        const newTime = prev - 1;
        
        // Auto-save time every 10 seconds to avoid too frequent saves
        if (newTime % 10 === 0 && assignmentId) {
          saveAnswersToStorage(answers, assignmentId, newTime, startTime);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isSubmitted, answers, assignmentId, saveAnswersToStorage, startTime]);

  // Cleanup and beforeunload handler
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (answers.some(answer => answer.isAnswered) && !isSubmitted) {
        e.preventDefault();
        e.returnValue = 'You have unsaved quiz answers. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [answers, isSubmitted]);

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
    setAnswers(prev => {
      const updatedAnswers = prev.map(answer =>
        answer.questionId === questionId
          ? {
            ...answer,
            selectedAnswer,
            textAnswer: textAnswer !== undefined ? textAnswer : answer.textAnswer,
            isAnswered: selectedAnswer !== undefined || (!!textAnswer && textAnswer.trim() !== '')
          }
          : answer
      );
      
      // Auto-save to localStorage with current time
      if (assignmentId) {
        saveAnswersToStorage(updatedAnswers, assignmentId, timeRemaining, startTime);
      }
      
      return updatedAnswers;
    });
  }, [assignmentId, saveAnswersToStorage, timeRemaining, startTime]);

  const toggleFlag = useCallback((questionId: string) => {
    setAnswers(prev => {
      const updatedAnswers = prev.map(answer =>
        answer.questionId === questionId
          ? { ...answer, flagged: !answer.flagged }
          : answer
      );
      
      // Auto-save to localStorage with current time
      if (assignmentId) {
        saveAnswersToStorage(updatedAnswers, assignmentId, timeRemaining, startTime);
      }
      
      return updatedAnswers;
    });
  }, [assignmentId, saveAnswersToStorage, timeRemaining, startTime]);

  const getAnsweredCount = (): number => {
    return answers.filter(answer => answer.isAnswered).length;
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

      const response = await fetch(API_BASE_URL + `/api/assignments/${assignmentId}/submit`, {
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
        // Clear saved answers from localStorage on successful submission
        if (assignmentId) {
          clearAnswersFromStorage(assignmentId);
        }
        
        setIsSubmitted(true);
        setShowSubmitModal(false);
        setHasSubmitted(true);
        setSubmission(data.submission);

        // Navigate to results after a short delay
        setTimeout(() => {
          navigate(`/student/quiz/review/${data.submission.id}`, {
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

  // Show submission summary if user has already submitted
  if (quiz && hasSubmitted && !canRetake && submission) {
    return (
      <div className="assignment-creator">
        <div className="header">
          <div className="header-content">
            <div className="header-left">
              <button
                onClick={() => navigate(-1)}
                className="btn btn-secondary"
                style={{ marginRight: '16px' }}
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <h1 className="title">{quiz.title}</h1>
            </div>
          </div>
        </div>
        <div className="main-content">
          <div className="card" style={{
            padding: '32px',
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h2 style={{ marginBottom: '24px' , color: 'black'}}>Quiz Submitted</h2>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: '#f0f9ff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                border: '4px solid #3b82f6'
              }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold' , color: '#3b82f6' }}>
                  {submission.score} / {submission.maxScore}
                </span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Points
                </span>
              </div>
            </div>

            <p style={{ fontSize: '18px', marginBottom: '24px', color: '#374151' }}>
              {(submission?.percentage ?? 0).toFixed(2)}%
            </p>

            {submission.feedback && (
              <div className="feedback" style={{
                marginBottom: '24px',
                padding: '16px',
                color: '#374151',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'left'
              }}>
                <p><strong>Feedback:</strong> {submission.feedback}</p>
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={() => navigate(`/student/quiz/review/${submission.id}`)}
              style={{ width: '100%', marginBottom: '16px' }}
            >
              Review Quiz
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => navigate('/student/dashboard')}
              style={{ width: '100%' }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      <QuizInstructions
        quiz={quiz}
        questions={questions}
        onBack={() => navigate(-1)}
        onStartQuiz={startQuizAttempt}
      />
    );
  }

  // Quiz completion screen
  if (isSubmitted) {
    return (
      <QuizCompletion
        quiz={quiz}
        questions={questions}
        answeredCount={getAnsweredCount()}
        startTime={startTime}
      />
    );
  }

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers.find(a => a.questionId === currentQ.id);

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
              {lastSaved && (
                <span className="badge badge-success" style={{ fontSize: '12px' }}>
                  <Save size={12} />
                  Saved {lastSaved}
                </span>
              )}
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
            <QuestionDisplay
              question={currentQ}
              questionNumber={currentQuestion + 1}
              answer={currentAnswer}
              onUpdateAnswer={updateAnswer}
              onToggleFlag={toggleFlag}
            />

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
            <QuizNavigator
              quiz={quiz}
              questions={questions}
              answers={answers}
              currentQuestion={currentQuestion}
              onNavigateToQuestion={navigateToQuestion}
            />
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <SubmitModal
        isOpen={showSubmitModal}
        questions={questions}
        answers={answers}
        isSubmitting={isSubmitting}
        onClose={() => setShowSubmitModal(false)}
        onSubmit={handleSubmitQuiz}
      />

      {/* Time Warning (when < 1 minute remaining) */}
      {timeRemaining !== null && (
        <TimeWarning
          timeRemaining={timeRemaining}
          formatTime={formatTime}
        />
      )}
    </div>
  );
};

export default QuizAttemptPage;