import React, { useState, useEffect } from 'react';
import { X, Timer, Flag, ArrowLeft, ArrowRight, AlertCircle, FileText } from 'lucide-react';
import type { Assignment, Question } from '../types/Assignment';
import LatexRenderer from '../../../student/QuizAttemptPage/LatexRenderer';
import '../TeacherAssignments.css';

interface QuizPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
  questions: Question[];
}

const QuizPreviewModal: React.FC<QuizPreviewModalProps> = ({
  isOpen,
  onClose,
  assignment,
  questions
}) => {
  const [currentView, setCurrentView] = useState<'instructions' | 'quiz'>('instructions');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: any }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [textAnswers, setTextAnswers] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (isOpen) {
      setCurrentView('instructions');
      setCurrentQuestion(0);
      setSelectedAnswers({});
      setFlaggedQuestions(new Set());
      setTextAnswers({});
    }
  }, [isOpen]);

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const answeredCount = Object.keys(selectedAnswers).length + Object.values(textAnswers).filter(t => t.trim()).length;

  const handleStartQuiz = () => {
    setCurrentView('quiz');
  };

  const handleSelectAnswer = (questionId: number, answerId: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const handleTextAnswer = (questionId: number, text: string) => {
    setTextAnswers(prev => ({ ...prev, [questionId]: text }));
  };

  const toggleFlag = (questionId: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const navigateToQuestion = (index: number) => {
    if (assignment.cantGoBack && index < currentQuestion) return;
    setCurrentQuestion(index);
  };

  const currentQ = questions[currentQuestion];

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        width: '90%',
        maxWidth: '1200px',
        height: '90vh',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f9fafb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              Preview: {assignment.title}
            </h2>
            <span style={{
              padding: '4px 12px',
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              PREVIEW MODE
            </span>
            {currentView === 'quiz' && (
              <>
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {answeredCount}/{questions.length} Answered
                </span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}>
          {currentView === 'instructions' ? (
            // Instructions View
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '32px'
              }}>
                <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
                  Quiz Instructions
                </h3>
                
                {assignment.quizInstructions ? (
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                    marginBottom: '24px'
                  }}>
                    <div style={{ margin: 0, lineHeight: '1.6' }}>
                      <LatexRenderer content={assignment.quizInstructions} />
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                    marginBottom: '24px'
                  }}>
                    <div style={{ margin: 0, lineHeight: '1.6' }}>
                      <LatexRenderer content={assignment.description || 'Please read all questions carefully and select the best answer.'} />
                    </div>
                  </div>
                )}

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px',
                  marginBottom: '32px'
                }}>
                  <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                      {questions.length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Questions</div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                      {totalPoints}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Points</div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                      {assignment.hasTimeLimit ? `${assignment.timeLimit} min` : 'No Limit'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Time Limit</div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                      {assignment.allowedAttempts === -1 ? '∞' : assignment.allowedAttempts}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Attempts</div>
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                    Important Notes
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {assignment.hasTimeLimit && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Timer size={20} style={{ color: '#f59e0b' }} />
                        <span>This quiz has a time limit of {assignment.timeLimit} minutes</span>
                      </div>
                    )}
                    {assignment.cantGoBack && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <AlertCircle size={20} style={{ color: '#ef4444' }} />
                        <span>You cannot go back to previous questions once answered</span>
                      </div>
                    )}
                    {assignment.shuffleAnswers && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <AlertCircle size={20} style={{ color: '#3b82f6' }} />
                        <span>Answer choices are randomly shuffled</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={handleStartQuiz}
                    style={{
                      padding: '12px 32px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    <FileText size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Begin Quiz (Preview)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Quiz View
            <div style={{ display: 'grid', gridTemplateColumns: assignment.oneQuestionAtTime ? '1fr' : '1fr 280px', gap: '24px' }}>
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '32px'
              }}>
                {currentQ && (
                  <>
                    {/* Question Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '24px'
                    }}>
                      <div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                          Question {currentQuestion + 1}
                        </h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {currentQ.points} point{currentQ.points !== 1 ? 's' : ''}
                          </span>
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {currentQ.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFlag(currentQ.id)}
                        style={{
                          background: flaggedQuestions.has(currentQ.id) ? '#fef2f2' : 'none',
                          border: '1px solid',
                          borderColor: flaggedQuestions.has(currentQ.id) ? '#ef4444' : '#e5e7eb',
                          borderRadius: '6px',
                          padding: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <Flag size={16} style={{ color: flaggedQuestions.has(currentQ.id) ? '#ef4444' : '#6b7280' }} />
                      </button>
                    </div>

                    {/* Question Text */}
                    <div style={{ marginBottom: '32px' }}>
                      <div style={{ fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
                        <LatexRenderer content={currentQ.text} />
                      </div>
                    </div>

                    {/* Question Image */}
                    {currentQ.imageUrl && (
                      <div style={{ marginBottom: '32px' }}>
                        <img
                          src={currentQ.imageUrl}
                          alt="Question illustration"
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                          }}
                        />
                      </div>
                    )}

                    {/* Answer Options */}
                    <div>
                      {(currentQ.type === 'multiple_choice' || currentQ.type === 'true_false') && (
                        <div style={{
                          display: 'flex',
                          flexDirection: currentQ.type === 'true_false' ? 'row' : 'column',
                          gap: '12px'
                        }}>
                          {currentQ.answers.map((answer) => (
                            <label
                              key={answer.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '16px',
                                border: '2px solid',
                                borderColor: selectedAnswers[currentQ.id] === answer.id ? '#3b82f6' : '#e5e7eb',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                backgroundColor: selectedAnswers[currentQ.id] === answer.id ? '#eff6ff' : '#fff',
                                flex: currentQ.type === 'true_false' ? 1 : 'auto'
                              }}
                            >
                              <input
                                type="radio"
                                checked={selectedAnswers[currentQ.id] === answer.id}
                                onChange={() => handleSelectAnswer(currentQ.id, answer.id)}
                                style={{ marginRight: '12px' }}
                              />
                              <div>
                                <LatexRenderer content={answer.text} />
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {currentQ.type === 'short_answer' && (
                        <input
                          type="text"
                          value={textAnswers[currentQ.id] || ''}
                          onChange={(e) => handleTextAnswer(currentQ.id, e.target.value)}
                          placeholder="Enter your answer..."
                          style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px'
                          }}
                        />
                      )}

                      {currentQ.type === 'essay' && (
                        <textarea
                          value={textAnswers[currentQ.id] || ''}
                          onChange={(e) => handleTextAnswer(currentQ.id, e.target.value)}
                          placeholder="Enter your detailed answer..."
                          style={{
                            width: '100%',
                            minHeight: '200px',
                            padding: '12px',
                            fontSize: '16px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            resize: 'vertical'
                          }}
                        />
                      )}
                    </div>

                    {/* Navigation */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '32px',
                      paddingTop: '24px',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <button
                        onClick={() => navigateToQuestion(currentQuestion - 1)}
                        disabled={currentQuestion === 0 || assignment.cantGoBack}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: currentQuestion === 0 || assignment.cantGoBack ? '#f3f4f6' : '#fff',
                          color: currentQuestion === 0 || assignment.cantGoBack ? '#9ca3af' : '#374151',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          cursor: currentQuestion === 0 || assignment.cantGoBack ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <ArrowLeft size={16} />
                        Previous
                      </button>

                      <button
                        onClick={() => currentQuestion < questions.length - 1 ? 
                          navigateToQuestion(currentQuestion + 1) : 
                          alert('This is a preview. In the real quiz, students would submit here.')
                        }
                        style={{
                          padding: '10px 20px',
                          backgroundColor: currentQuestion === questions.length - 1 ? '#10b981' : '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        {currentQuestion === questions.length - 1 ? 'Submit Quiz (Preview)' : 'Next'}
                        {currentQuestion < questions.length - 1 && <ArrowRight size={16} />}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Question Navigator (if not one-at-a-time) */}
              {!assignment.oneQuestionAtTime && (
                <div style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  height: 'fit-content',
                  position: 'sticky',
                  top: '24px'
                }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600' }}>
                    Question Navigator
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '8px'
                  }}>
                    {questions.map((_, index) => {
                      const isAnswered = selectedAnswers[questions[index].id] !== undefined || 
                                       (textAnswers[questions[index].id] && textAnswers[questions[index].id].trim());
                      const isFlagged = flaggedQuestions.has(questions[index].id);
                      
                      return (
                        <button
                          key={index}
                          onClick={() => navigateToQuestion(index)}
                          disabled={assignment.cantGoBack && index < currentQuestion}
                          style={{
                            padding: '8px',
                            backgroundColor: index === currentQuestion ? '#3b82f6' :
                                          isAnswered ? '#10b981' :
                                          isFlagged ? '#fef2f2' : '#f3f4f6',
                            color: index === currentQuestion || isAnswered ? 'white' : '#374151',
                            border: isFlagged ? '2px solid #ef4444' : '1px solid #e5e7eb',
                            borderRadius: '4px',
                            cursor: assignment.cantGoBack && index < currentQuestion ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            fontWeight: index === currentQuestion ? '600' : '400',
                            position: 'relative'
                          }}
                        >
                          {index + 1}
                          {isFlagged && (
                            <span style={{
                              position: 'absolute',
                              top: '-4px',
                              right: '-4px',
                              backgroundColor: '#ef4444',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%'
                            }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }} />
                      <span>Answered</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '2px' }} />
                      <span>Not Answered</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#fef2f2', border: '2px solid #ef4444', borderRadius: '2px' }} />
                      <span>Flagged</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPreviewModal;