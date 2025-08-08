import React, { useState } from 'react';
import type { Question, Option } from '../../types/teacher.types';
import MathEditor from './MathEditor';
import './QuestionEditor.css';

interface QuestionEditorProps {
  question: Question;
  onChange: (question: Question) => void;
  onDelete: () => void;
  index: number;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onChange, onDelete, index }) => {
  const [showExplanation, setShowExplanation] = useState(!!question.explanation);

  const handleQuestionChange = (field: keyof Question, value: any) => {
    onChange({ ...question, [field]: value });
  };

  const handleOptionChange = (optionIndex: number, field: keyof Option, value: any) => {
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = { ...newOptions[optionIndex], [field]: value };
    onChange({ ...question, options: newOptions });
  };

  const addOption = () => {
    const newOption: Option = {
      id: Date.now().toString(),
      text: '',
      isCorrect: false
    };
    onChange({ ...question, options: [...(question.options || []), newOption] });
  };

  const removeOption = (optionIndex: number) => {
    const newOptions = question.options?.filter((_, i) => i !== optionIndex);
    onChange({ ...question, options: newOptions });
  };

  const toggleCorrectOption = (optionIndex: number) => {
    const newOptions = question.options?.map((opt, i) => ({
      ...opt,
      isCorrect: question.type === 'multiple-choice' ? i === optionIndex : 
                 i === optionIndex ? !opt.isCorrect : opt.isCorrect
    }));
    onChange({ ...question, options: newOptions });
  };

  return (
    <div className="question-editor">
      <div className="question-header">
        <h4>Question {index + 1}</h4>
        <button type="button" onClick={onDelete} className="btn-delete">
          Delete Question
        </button>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Question Type</label>
          <select
            value={question.type}
            onChange={(e) => handleQuestionChange('type', e.target.value)}
          >
            <option value="multiple-choice">Multiple Choice</option>
            <option value="short-answer">Short Answer</option>
            <option value="essay">Essay</option>
            <option value="mathematical">Mathematical Expression</option>
          </select>
        </div>

        <div className="form-group">
          <label>Points</label>
          <input
            type="number"
            value={question.points}
            onChange={(e) => handleQuestionChange('points', parseInt(e.target.value) || 0)}
            min="0"
            step="1"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Question Text</label>
        <MathEditor
          value={question.question}
          onChange={(value) => handleQuestionChange('question', value)}
          placeholder="Enter your question..."
        />
      </div>

      {question.type === 'multiple-choice' && (
        <div className="options-section">
          <label>Answer Options</label>
          {question.options?.map((option, optionIndex) => (
            <div key={option.id} className="option-editor">
              <input
                type="checkbox"
                checked={option.isCorrect}
                onChange={() => toggleCorrectOption(optionIndex)}
                title="Mark as correct answer"
              />
              <MathEditor
                value={option.text}
                onChange={(value) => handleOptionChange(optionIndex, 'text', value)}
                placeholder={`Option ${optionIndex + 1}`}
              />
              <button
                type="button"
                onClick={() => removeOption(optionIndex)}
                className="btn-remove-option"
              >
                ×
              </button>
            </div>
          ))}
          <button type="button" onClick={addOption} className="btn-add-option">
            Add Option
          </button>
        </div>
      )}

      {(question.type === 'short-answer' || question.type === 'mathematical') && (
        <div className="form-group">
          <label>Correct Answer (for auto-grading)</label>
          <MathEditor
            value={question.correctAnswer as string || ''}
            onChange={(value) => handleQuestionChange('correctAnswer', value)}
            placeholder="Enter the correct answer..."
          />
        </div>
      )}

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={showExplanation}
            onChange={(e) => {
              setShowExplanation(e.target.checked);
              if (!e.target.checked) {
                handleQuestionChange('explanation', undefined);
              }
            }}
          />
          Add explanation
        </label>
      </div>

      {showExplanation && (
        <div className="form-group">
          <label>Explanation (shown after submission)</label>
          <MathEditor
            value={question.explanation || ''}
            onChange={(value) => handleQuestionChange('explanation', value)}
            placeholder="Explain the correct answer..."
          />
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;