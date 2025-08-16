import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Timer, AlertCircle, Save, HelpCircle, Play, RotateCcw } from 'lucide-react';
import type { Assignment, Question, Answer } from './types';
import './StudentQuizView.css';

interface QuizInstructionsProps {
  quiz: Assignment;
  questions: Question[];
  onBack: () => void;
  onStartQuiz: () => void;
}

const QuizInstructions: React.FC<QuizInstructionsProps> = ({
  quiz,
  questions,
  onBack,
  onStartQuiz
}) => {
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [savedData, setSavedData] = useState<any>(null);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Check for saved quiz progress
  useEffect(() => {
    const checkSavedProgress = () => {
      try {
        // We need the assignmentId - this should be passed as a prop or obtained from URL
        // For now, we'll extract it from the current URL or you can pass it as a prop
        const pathParts = window.location.pathname.split('/');
        const assignmentId = pathParts[pathParts.length - 1];
        
        if (!assignmentId) return;

        const storageKey = `quiz_answers_${assignmentId}`;
        const savedDataStr = localStorage.getItem(storageKey);
        
        if (savedDataStr) {
          const parsed = JSON.parse(savedDataStr);
          
          // Check if saved answers match current questions
          if (parsed.answers && parsed.answers.length === questions.length) {
            setHasSavedProgress(true);
            setSavedData(parsed);
            
            // Count answered questions
            const answered = parsed.answers.filter((answer: Answer) => answer.isAnswered).length;
            setAnsweredCount(answered);
          }
        }
      } catch (error) {
        console.error('Error checking saved progress:', error);
      }
    };

    if (questions.length > 0) {
      checkSavedProgress();
    }
  }, [questions]);

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const clearSavedProgress = () => {
    try {
      const pathParts = window.location.pathname.split('/');
      const assignmentId = pathParts[pathParts.length - 1];
      
      if (assignmentId) {
        const storageKey = `quiz_answers_${assignmentId}`;
        localStorage.removeItem(storageKey);
        setHasSavedProgress(false);
        setSavedData(null);
        setAnsweredCount(0);
      }
    } catch (error) {
      console.error('Error clearing saved progress:', error);
    }
  };

  return (
    <div className="assignment-creator">
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={onBack} className="btn btn-secondary" style={{ marginRight: '16px' }}>
              <ArrowLeft size={16} />
              Back
            </button>
            <h1 className="title">{quiz.title}</h1>
            <div className="badges">
              <span className="badge badge-info">
                <FileText size={14} />
                {hasSavedProgress ? 'Resume Quiz' : 'Instructions'}
              </span>
              <span className="points-display">
                {totalPoints} Points • {questions.length} Questions
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Saved Progress Alert */}
          {hasSavedProgress && (
            <div className="card" style={{ 
              padding: '20px', 
              marginBottom: '24px', 
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              border: '2px solid #3b82f6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <Save size={24} style={{ color: '#3b82f6', marginRight: '12px' }} />
                <h3 style={{ margin: 0, color: '#1e40af', fontSize: '18px', fontWeight: '600' }}>
                  Quiz Progress Found
                </h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
                    {answeredCount}/{questions.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Questions Answered</div>
                </div>
                
                {savedData?.timeRemaining !== undefined && quiz.hasTimeLimit && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
                      {formatTime(savedData.timeRemaining)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Time Remaining</div>
                  </div>
                )}
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                    {savedData?.lastSaved ? new Date(savedData.lastSaved).toLocaleTimeString() : 'Unknown'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Last Saved</div>
                </div>
              </div>
              
              <p style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '14px' }}>
                We found your previous quiz progress. You can continue where you left off or start fresh.
              </p>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={onStartQuiz}
                  className="btn btn-primary"
                  style={{ minWidth: '140px' }}
                  type="button"
                >
                  <Play size={16} />
                  Continue Quiz
                </button>
                <button
                  onClick={clearSavedProgress}
                  className="btn btn-secondary"
                  style={{ minWidth: '140px' }}
                  type="button"
                >
                  <RotateCcw size={16} />
                  Start Fresh
                </button>
              </div>
            </div>
          )}

          <div className="card" style={{ padding: '32px' }}>
            <h2 className="card-header" style={{ marginBottom: '20px' }}>
              {hasSavedProgress ? 'Quiz Details' : 'Quiz Instructions'}
            </h2>
            
            {!hasSavedProgress && (
              <div className="info-box" style={{ marginBottom: '24px' }}>
                <p className="info-text" style={{ fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
                  {quiz.quizInstructions || quiz.description || 'Please read all questions carefully and select the best answer.'}
                </p>
              </div>
            )}

            {/* Quiz Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div className="info-box" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
                  {questions.length}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Questions</div>
              </div>
              
              <div className="info-box" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
                  {totalPoints}
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

            {!hasSavedProgress && (
              <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                <button
                  onClick={onStartQuiz}
                  className="btn btn-primary btn-large"
                  style={{ fontSize: '18px', padding: '16px 32px', minWidth: '200px' }}
                  type="button"
                >
                  <FileText size={20} />
                  Begin Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizInstructions;