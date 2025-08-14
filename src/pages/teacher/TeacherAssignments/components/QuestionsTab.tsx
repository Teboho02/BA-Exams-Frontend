// components/QuestionsTab.tsx
import React from 'react';
import { Plus, HelpCircle, Edit, Trash2 } from 'lucide-react';
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
  onRemoveImage
}) => {
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

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">
            <HelpCircle size={48} />
          </div>
          <h3 className="empty-title">No questions yet</h3>
          <p className="empty-description">Get started by adding your first question.</p>
          <button
            onClick={onAddQuestion}
            className="btn btn-primary"
            type="button"
          >
            Add Your First Question
          </button>
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