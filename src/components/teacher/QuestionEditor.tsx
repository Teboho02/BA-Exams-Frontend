//@ts-nocheck
import React from 'react';
import { X, Image as ImageIcon, Trash2 } from 'lucide-react';
import MathEditorV2 from '../MathEditor/MathEditor';
import type { Question, Answer } from '../types/Assignment';

interface QuestionEditorProps {
  question: Question;
  onUpdate: (questionId: number, updates: Partial<Question>) => void;
  onDelete: (questionId: number) => void;
  onClose: () => void;
  onAddAnswer: (questionId: number) => void;
  onUpdateAnswer: (questionId: number, answerId: number, field: keyof Answer, value: string | boolean) => void;
  onDeleteAnswer: (questionId: number, answerId: number) => void;
  onSetCorrectAnswer: (questionId: number, answerId: number) => void;
  onImageUpload: (questionId: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (questionId: number) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  onUpdate,
  onDelete,
  onClose,
  onAddAnswer,
  onUpdateAnswer,
  onDeleteAnswer,
  onSetCorrectAnswer,
  onImageUpload,
  onRemoveImage,
}) => {
  const handleQuestionTypeChange = (newType: Question['type']) => {
    const updates: Partial<Question> = { type: newType };
    
    if (newType === 'true_false') {
      updates.answers = [
        { id: 1, text: 'True', correct: true, feedback: '' },
        { id: 2, text: 'False', correct: false, feedback: '' }
      ];
    } else if (newType === 'multiple_choice' && question.type === 'true_false') {
      updates.answers = [
        { id: 1, text: '', correct: true, feedback: '' },
        { id: 2, text: '', correct: false, feedback: '' }
      ];
    } else if (newType === 'short_answer') {
      updates.acceptableAnswers = question.acceptableAnswers || [''];
      updates.matchType = question.matchType || 'exact';
      updates.caseSensitive = question.caseSensitive || false;
    }
    
    onUpdate(question.id, updates);
  };

  const addAcceptableAnswer = () => {
    const currentAnswers = question.acceptableAnswers || [''];
    onUpdate(question.id, {
      acceptableAnswers: [...currentAnswers, '']
    });
  };

  const updateAcceptableAnswer = (index: number, value: string) => {
    const currentAnswers = [...(question.acceptableAnswers || [''])];
    currentAnswers[index] = value;
    onUpdate(question.id, { acceptableAnswers: currentAnswers });
  };

  const removeAcceptableAnswer = (index: number) => {
    const currentAnswers = question.acceptableAnswers || [''];
    if (currentAnswers.length > 1) {
      onUpdate(question.id, {
        acceptableAnswers: currentAnswers.filter((_, i) => i !== index)
      });
    }
  };

  return (
    <div className="question-editor-modal">
      <div className="question-editor-header">
        <h3>{question.title}</h3>
        <button onClick={onClose} className="close-btn" type="button">
          <X size={20} />
        </button>
      </div>

      <div className="question-editor-content">
        {/* Question Title */}
        <div className="form-group">
          <label>Question Title</label>
          <input
            type="text"
            value={question.title}
            onChange={(e) => onUpdate(question.id, { title: e.target.value })}
            placeholder="Question 1"
          />
        </div>

        {/* Question Type and Points */}
        <div className="form-row">
          <div className="form-group">
            <label>Question Type</label>
            <select
              value={question.type}
              onChange={(e) => handleQuestionTypeChange(e.target.value as Question['type'])}
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="short_answer">Short Answer</option>
              <option value="essay">Essay</option>
            </select>
          </div>

          <div className="form-group">
            <label>Points</label>
            <input
              type="number"
              value={question.points}
              onChange={(e) => onUpdate(question.id, { points: parseInt(e.target.value) || 1 })}
              min="1"
            />
          </div>
        </div>

        {/* Question Text with MathEditor */}
        <div className="form-group">
          <label>Question Text</label>
          <MathEditorV2
            value={question.text}
            onChange={(value) => onUpdate(question.id, { text: value })}
            placeholder="Enter your question text..."
            defaultMode="text"
            showToolbar={true}
          />
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label>Question Image (Optional)</label>
          <div className="image-upload-section">
            {question.imageUrl && question.imageUrl !== 'uploading...' ? (
              <div className="image-preview">
                <img src={question.imageUrl} alt="Question" />
                <button
                  type="button"
                  onClick={() => onRemoveImage(question.id)}
                  className="remove-image-btn"
                >
                  <Trash2 size={16} />
                  Remove Image
                </button>
              </div>
            ) : question.imageUrl === 'uploading...' ? (
              <div className="uploading-indicator">Uploading image...</div>
            ) : (
              <label className="upload-btn">
                <ImageIcon size={20} />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onImageUpload(question.id, e)}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
        </div>

        {/* Multiple Choice / True False Answers */}
        {(question.type === 'multiple_choice' || question.type === 'true_false') && (
          <div className="answers-section">
            <label>Answer Options</label>
            {question.answers.map((answer, index) => (
              <div key={answer.id} className="answer-item">
                <div className="answer-main">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={answer.correct}
                    onChange={() => onSetCorrectAnswer(question.id, answer.id)}
                    title="Mark as correct answer"
                  />
                  
                  {question.type === 'true_false' ? (
                    <div className="true-false-text">{answer.text}</div>
                  ) : (
                    <MathEditorV2
                      value={answer.text}
                      onChange={(value) => onUpdateAnswer(question.id, answer.id, 'text', value)}
                      placeholder={`Option ${index + 1}`}
                      defaultMode="text"
                      showToolbar={false}
                      compact={true}
                    />
                  )}

                  {question.type === 'multiple_choice' && question.answers.length > 2 && (
                    <button
                      type="button"
                      onClick={() => onDeleteAnswer(question.id, answer.id)}
                      className="delete-answer-btn"
                      title="Delete answer"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Answer Feedback */}
                <div className="answer-feedback">
                  <input
                    type="text"
                    value={answer.feedback || ''}
                    onChange={(e) => onUpdateAnswer(question.id, answer.id, 'feedback', e.target.value)}
                    placeholder="Optional feedback for this answer"
                    className="feedback-input"
                  />
                </div>
              </div>
            ))}

            {question.type === 'multiple_choice' && (
              <button
                type="button"
                onClick={() => onAddAnswer(question.id)}
                className="add-answer-btn"
              >
                + Add Answer Option
              </button>
            )}
          </div>
        )}

        {/* Short Answer Configuration */}
        {question.type === 'short_answer' && (
          <div className="short-answer-section">
            <label>Acceptable Answers</label>
            {(question.acceptableAnswers || ['']).map((answer, index) => (
              <div key={index} className="acceptable-answer-item">
                <MathEditorV2
                  value={answer}
                  onChange={(value) => updateAcceptableAnswer(index, value)}
                  placeholder="Enter acceptable answer..."
                  defaultMode="text"
                  showToolbar={false}
                  compact={true}
                />
                {(question.acceptableAnswers || ['']).length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAcceptableAnswer(index)}
                    className="delete-answer-btn"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addAcceptableAnswer}
              className="add-answer-btn"
            >
              + Add Acceptable Answer
            </button>

            <div className="matching-options">
              <div className="form-group">
                <label>Match Type</label>
                <select
                  value={question.matchType || 'exact'}
                  onChange={(e) => onUpdate(question.id, { 
                    matchType: e.target.value as 'exact' | 'contains' | 'regex' 
                  })}
                >
                  <option value="exact">Exact Match</option>
                  <option value="contains">Contains</option>
                  <option value="regex">Regular Expression</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={question.caseSensitive || false}
                    onChange={(e) => onUpdate(question.id, { caseSensitive: e.target.checked })}
                  />
                  Case Sensitive
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Essay Type - No answer configuration needed */}
        {question.type === 'essay' && (
          <div className="essay-info">
            <p className="info-text">
              Essay questions require manual grading. Students will submit their written response.
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="question-editor-footer">
        <button
          type="button"
          onClick={() => onDelete(question.id)}
          className="delete-question-btn"
        >
          Delete Question
        </button>
        <button
          type="button"
          onClick={onClose}
          className="done-btn"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default QuestionEditor;