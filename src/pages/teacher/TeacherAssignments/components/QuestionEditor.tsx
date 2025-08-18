import React from 'react';
import { Plus, Trash2, Image, X } from 'lucide-react';
import type { Question, Answer } from '../types/Assignment';
import { MathTextArea } from './MathTextArea';
import { MathInput } from './MathInput';

interface QuestionEditorProps {
    question: Question;
    onUpdateQuestion: (updates: Partial<Question>) => void;
    onDeleteQuestion: () => void;
    onAddAnswer: () => void;
    onUpdateAnswer: (answerId: number, field: keyof Answer, value: string | boolean) => void;
    onDeleteAnswer: (answerId: number) => void;
    onSetCorrectAnswer: (answerId: number) => void;
    onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = React.memo(({
    question,
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
        <div className="question-editor card">
            <div className="question-editor-header">
                <input
                    type="text"
                    value={question.title}
                    onChange={(e) => onUpdateQuestion({ title: e.target.value })}
                    className="question-title-input"
                    placeholder="Question title"
                />
                <div className="question-controls">
                    <select
                        value={question.type}
                        onChange={(e) => onUpdateQuestion({ type: e.target.value as Question['type'] })}
                        className="form-select"
                        style={{ width: 'auto', minWidth: '150px' }}
                    >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="short_answer">Short Answer</option>
                        <option value="essay">Long Answer</option>
                    </select>
                    <input
                        type="number"
                        value={question.points}
                        onChange={(e) => onUpdateQuestion({ points: parseInt(e.target.value) || 0 })}
                        className="points-input"
                        min="0"
                    />
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>pts</span>
                    <button
                        onClick={onDeleteQuestion}
                        className="icon-btn danger"
                        type="button"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Question Text</label>
                <MathTextArea
                    value={question.text}
                    onChange={(value) => onUpdateQuestion({ text: value })}
                    placeholder="Enter your question..."
                    className="form-textarea"
                    style={{ height: '96px' }}
                />
            </div>

            {/* Image Upload Section */}
            <div className="form-group">
                <label className="form-label">Question Image (Optional)</label>
                {question.imageUrl ? (
                    <div className="image-preview-container">
                        <img src={question.imageUrl} alt="Question" className="question-image-preview" />
                        <button
                            onClick={onRemoveImage}
                            className="remove-image-btn"
                            type="button"
                            title="Remove image"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="image-upload-area">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onImageUpload}
                            className="file-input-hidden"
                            id={`image-upload-${question.id}`}
                        />
                        <label htmlFor={`image-upload-${question.id}`} className="image-upload-label">
                            <Image size={24} />
                            <span>Click to upload an image</span>
                            <span className="image-upload-hint">PNG, JPG, GIF up to 10MB</span>
                        </label>
                    </div>
                )}
            </div>

            {/* Multiple Choice and True/False Answers */}
            {(question.type === 'multiple_choice' || question.type === 'true_false') && (
                <div className="answer-options">
                    <label className="form-label">Answer Options</label>
                    {question.answers.map((answer, index) => (
                        <div key={answer.id} className="answer-item">
                            <button
                                onClick={() => onSetCorrectAnswer(answer.id)}
                                className={`correct-btn ${answer.correct ? 'correct' : ''}`}
                                title="Mark as correct answer"
                                type="button"
                            >
                                {answer.correct && <div className="correct-indicator" />}
                            </button>
                            <div className="answer-inputs">
                                <MathInput
                                    value={answer.text}
                                    onChange={(value: string) => onUpdateAnswer(answer.id, 'text', value)}
                                    placeholder={`Answer ${index + 1}`}
                                    className="answer-input"
                                />
                                <MathInput
                                    value={answer.feedback}
                                    onChange={(value: string) => onUpdateAnswer(answer.id, 'feedback', value)}
                                    placeholder="Answer feedback (optional)"
                                    className="feedback-input"
                                />

                            </div>
                            {question.answers.length > 2 && (
                                <button
                                    onClick={() => onDeleteAnswer(answer.id)}
                                    className="icon-btn danger"
                                    style={{ marginTop: '4px' }}
                                    type="button"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={onAddAnswer}
                        className="add-answer"
                        type="button"
                    >
                        <Plus size={16} />
                        Add another answer
                    </button>
                </div>
            )}

            {/* Short Answer Section */}
            {question.type === 'short_answer' && (
                <div className="form-group">
                    <label className="form-label">Acceptable Answers</label>

                    <div style={{
                        background: '#f3f4f6',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                            Enter all acceptable answers. Students' responses will be automatically marked correct if they match any of these.
                        </p>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>
                            Matching Options:
                        </label>

                        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                            <select
                                value={question.matchType || 'exact'}
                                onChange={(e) => onUpdateQuestion({
                                    matchType: e.target.value as 'exact' | 'contains' | 'regex'
                                })}
                                className="form-select"
                                style={{ minWidth: '150px' }}
                            >
                                <option value="exact">Exact Match</option>
                                <option value="contains">Contains Text</option>
                                <option value="regex">Regular Expression</option>
                            </select>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={question.caseSensitive || false}
                                    onChange={(e) => onUpdateQuestion({ caseSensitive: e.target.checked })}
                                    className="checkbox"
                                />
                                <span style={{ fontSize: '14px' }}>Case Sensitive</span>
                            </label>
                        </div>
                    </div>

                    {/* Acceptable answers input */}
                    {(!question.acceptableAnswers || question.acceptableAnswers.length === 0 ? [''] : question.acceptableAnswers).map((answer, index) => (
                        <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <MathInput
                                value={answer}
                                onChange={(value: string) => {
                                    const newAnswers = [...(question.acceptableAnswers || [''])];
                                    newAnswers[index] = value;
                                    onUpdateQuestion({ acceptableAnswers: newAnswers });
                                }}
                                placeholder={
                                    question.matchType === 'regex'
                                        ? 'Enter regex pattern (e.g., ^\\d{4}$)'
                                        : `Acceptable answer ${index + 1}`
                                }
                                className="form-input"
                                style={{ flex: 1 }}
                            />
                            {(question.acceptableAnswers?.length || 1) > 1 && (
                                <button
                                    onClick={() => {
                                        const newAnswers = question.acceptableAnswers?.filter((_, i) => i !== index) || [];
                                        onUpdateQuestion({ acceptableAnswers: newAnswers });
                                    }}
                                    className="icon-btn danger"
                                    type="button"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={() => {
                            const currentAnswers = question.acceptableAnswers || [''];
                            onUpdateQuestion({ acceptableAnswers: [...currentAnswers, ''] });
                        }}
                        className="add-answer"
                        type="button"
                    >
                        <Plus size={16} />
                        Add another acceptable answer
                    </button>

                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px' }}>
                        Students will see a text box to type their answer. Their response will be automatically checked against these acceptable answers.
                    </p>
                </div>
            )}

            {/* Essay Question Info */}
            {question.type === 'essay' && (
                <div className="info-box">
                    <p className="info-text">
                        Students will be given a text area to compose their answer. This question type requires manual grading.
                    </p>
                </div>
            )}

            {/* File Upload Question Info */}
            {question.type === 'file_upload' && (
                <div className="info-box">
                    <p className="info-text">
                        Students will be able to upload a file as their answer. This question type requires manual grading.
                    </p>
                </div>
            )}
        </div>
    );
});