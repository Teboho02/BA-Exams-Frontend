import React from 'react';
import { Plus, HelpCircle, Edit, Trash2, Sparkles } from 'lucide-react';
import type { Question, Answer } from '../types/Assignment';
import { QuestionEditor } from './QuestionEditor';

interface QuestionsTabProps {
  questions: Question[];
  editingQuestion: number | null;
  totalPoints: number;
  onAddQuestion: () => void;
  onSetEditingQuestion: (questionId: number | null) => void;
  onUpdateQuestion: (questionId: number, updates: Partial<Question>) => void;
  onDeleteQuestion: (questionId: number) => void;
  onAddAnswer: (questionId: number) => void;
  onUpdateAnswer: (questionId: number, answerId: number, field: keyof Answer, value: string | boolean) => void;
  onDeleteAnswer: (questionId: number, answerId: number) => void;
  onSetCorrectAnswer: (questionId: number, answerId: number) => void;
  onImageUpload: (questionId: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (questionId: number) => void;
  onGenerateQuestions?: (prompt: string, difficulty: string, count: number) => Promise<void>;
}

export const QuestionsTab: React.FC<QuestionsTabProps> = ({
  questions,
  editingQuestion,
  totalPoints,
  onAddQuestion,
  onSetEditingQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddAnswer,
  onUpdateAnswer,
  onDeleteAnswer,
  onSetCorrectAnswer,
  onImageUpload,
  onRemoveImage,
  onGenerateQuestions
}) => {
  const [showAIDialog, setShowAIDialog] = React.useState(false);
  const [aiPrompt, setAiPrompt] = React.useState('');
  const [aiDifficulty, setAiDifficulty] = React.useState('medium');
  const [aiCount, setAiCount] = React.useState(5);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerateQuestions = async () => {
    if (!aiPrompt.trim() || !onGenerateQuestions) return;
    
    setIsGenerating(true);
    try {
      await onGenerateQuestions(aiPrompt, aiDifficulty, aiCount);
      setShowAIDialog(false);
      setAiPrompt('');
      setAiDifficulty('medium');
      setAiCount(5);
    } catch (error) {
      console.error('Failed to generate questions:', error);
      alert('Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    } 
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Questions Header */}
      <div className="card">
        <div className="questions-header">
          <div>
            <h2 className="card-header" style={{ margin: 0 }}>Questions</h2>
            <p className="questions-info">
              {questions.length} questions, {totalPoints} points total
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {onGenerateQuestions && (
              <button
                onClick={() => setShowAIDialog(true)}
                className="btn btn-secondary"
                type="button"
              >
                <Sparkles size={16} />
                Generate with AI
              </button>
            )}
            <button
              onClick={onAddQuestion}
              className="btn btn-primary"
              type="button"
            >
              <Plus size={16} />
              New Question
            </button>
          </div>
        </div>
      </div>

      {/* AI Generation Dialog */}
      {showAIDialog && (
        <div className="modal-overlay" onClick={() => !isGenerating && setShowAIDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              <Sparkles size={20} style={{ display: 'inline', marginRight: '8px' }} />
              Generate Questions with AI
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Prompt Input */}
              <div>
                <label className="form-label">
                  Prompt <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe the topic and type of questions you want. E.g., 'Create multiple choice questions about World War II focusing on key battles and dates' or 'Generate true/false questions about basic JavaScript concepts'"
                  className="form-input"
                  rows={4}
                  disabled={isGenerating}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Be specific about the topic, question type, and any focus areas
                </p>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="form-label">
                  Difficulty Level <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setAiDifficulty(level)}
                      className={`difficulty-btn ${aiDifficulty === level ? 'active' : ''}`}
                      type="button"
                      disabled={isGenerating}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        border: aiDifficulty === level ? '2px solid #2563eb' : '2px solid #e5e7eb',
                        borderRadius: '6px',
                        background: aiDifficulty === level ? '#eff6ff' : 'white',
                        color: aiDifficulty === level ? '#2563eb' : '#374151',
                        fontWeight: aiDifficulty === level ? '600' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textTransform: 'capitalize'
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="form-label">
                  Number of Questions <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="range"
                    value={aiCount}
                    onChange={(e) => setAiCount(parseInt(e.target.value))}
                    min="1"
                    max="20"
                    className="range-input"
                    disabled={isGenerating}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    value={aiCount}
                    onChange={(e) => setAiCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                    min="1"
                    max="20"
                    className="form-input"
                    disabled={isGenerating}
                    style={{ width: '70px', textAlign: 'center' }}
                  />
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Select between 1 and 20 questions
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                justifyContent: 'flex-end',
                paddingTop: '8px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button
                  onClick={() => {
                    setShowAIDialog(false);
                    setAiPrompt('');
                    setAiDifficulty('medium');
                    setAiCount(5);
                  }}
                  className="btn btn-secondary"
                  type="button"
                  disabled={isGenerating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateQuestions}
                  className="btn btn-primary"
                  type="button"
                  disabled={isGenerating || !aiPrompt.trim()}
                  style={{
                    opacity: isGenerating || !aiPrompt.trim() ? 0.6 : 1,
                    cursor: isGenerating || !aiPrompt.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles size={16} className="spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate {aiCount} Question{aiCount !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">
            <HelpCircle size={48} />
          </div>
          <h3 className="empty-title">No questions yet</h3>
          <p className="empty-description">Get started by adding your first question.</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {onGenerateQuestions && (
              <button
                onClick={() => setShowAIDialog(true)}
                className="btn btn-secondary"
                type="button"
              >
                <Sparkles size={16} />
                Generate with AI
              </button>
            )}
            <button
              onClick={onAddQuestion}
              className="btn btn-primary"
              type="button"
            >
              Add Your First Question
            </button>
          </div>
        </div>
      ) : (
        <div className="question-list">
          {questions.map((question) => {
            if (editingQuestion === question.id) {
              return (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  onUpdateQuestion={(updates) => onUpdateQuestion(question.id, updates)}
                  onDeleteQuestion={() => onDeleteQuestion(question.id)}
                  onAddAnswer={() => onAddAnswer(question.id)}
                  onUpdateAnswer={(answerId, field, value) => onUpdateAnswer(question.id, answerId, field, value)}
                  onDeleteAnswer={(answerId) => onDeleteAnswer(question.id, answerId)}
                  onSetCorrectAnswer={(answerId) => onSetCorrectAnswer(question.id, answerId)}
                  onImageUpload={(event) => onImageUpload(question.id, event)}
                  onRemoveImage={() => onRemoveImage(question.id)}
                />
              );
            } else {
              return (
                <div key={question.id} className="question-item card">
                  <div className="question-header">
                    <div className="question-content">
                      <h3 className="question-title">{question.title}</h3>
                      <p className="question-meta">
                        {question.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {question.points} pts
                      </p>
                      {question.text && (
                        <p className="question-text">{question.text}</p>
                      )}
                      {question.imageUrl && (
                        <img src={question.imageUrl} alt="Question thumbnail" className="question-thumbnail" />
                      )}
                    </div>
                    <div className="question-actions">
                      <button
                        onClick={() => onSetEditingQuestion(question.id)}
                        className="icon-btn"
                        type="button"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteQuestion(question.id)}
                        className="icon-btn danger"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
};