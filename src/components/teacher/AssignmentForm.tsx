
import React, { useState } from 'react';
import type { Assignment, Question, AssignmentSettings } from '../../types/teacher.types';
import QuestionEditor from './QuestionEditor';
import './AssignmentForm.css';

interface AssignmentFormProps {
  courseId: string;
  onSubmit: (assignment: Omit<Assignment, 'id' | 'submissions' | 'createdAt'>) => void;
  onCancel: () => void;
  initialData?: Assignment;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ courseId, onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    courseId,
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'quiz' as const,
    totalPoints: initialData?.totalPoints || 0,
    openDate: initialData?.openDate ? new Date(initialData.openDate).toISOString().slice(0, 16) : '',
    closeDate: initialData?.closeDate ? new Date(initialData.closeDate).toISOString().slice(0, 16) : '',
    duration: initialData?.duration || undefined,
    questions: initialData?.questions || [],
    settings: initialData?.settings || {
      autoGrade: true,
      showMarksAfterSubmission: false,
      allowLateSubmission: false,
      randomizeQuestions: false,
      randomizeOptions: false,
      attemptsAllowed: 1
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate total points from questions
    const totalPoints = formData.questions.reduce((sum, q) => sum + q.points, 0);
    
    onSubmit({
      ...formData,
      totalPoints,
      openDate: new Date(formData.openDate),
      closeDate: new Date(formData.closeDate),
      duration: formData.duration || undefined
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (parseInt(value) || undefined) : value
    }));
  };

  const handleSettingChange = (setting: keyof AssignmentSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: value
      }
    }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'multiple-choice',
      question: '',
      points: 10,
      options: []
    };
    
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (index: number, question: Question) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? question : q)
    }));
  };

  const deleteQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const totalPoints = formData.questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <form onSubmit={handleSubmit} className="assignment-form">
      <h2>{initialData ? 'Edit' : 'Create'} Assignment</h2>
      
      <div className="form-section">
        <h3>Basic Information</h3>
        
        <div className="form-group">
          <label htmlFor="title">Assignment Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Chapter 5 Quiz"
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Assignment Type*</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="homework">Homework</option>
            <option value="quiz">Quiz</option>
            <option value="exam">Exam</option>
            <option value="project">Project</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Instructions or description for students..."
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Timing</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="openDate">Opens At*</label>
            <input
              type="datetime-local"
              id="openDate"
              name="openDate"
              value={formData.openDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="closeDate">Closes At*</label>
            <input
              type="datetime-local"
              id="closeDate"
              name="closeDate"
              value={formData.closeDate}
              onChange={handleChange}
              required
              min={formData.openDate}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="duration">
            Time Limit (minutes)
            <span className="field-hint">Leave empty for unlimited time</span>
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration || ''}
            onChange={handleChange}
            min="1"
            placeholder="e.g., 60"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Settings</h3>
        
        <div className="settings-grid">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.settings.autoGrade}
              onChange={(e) => handleSettingChange('autoGrade', e.target.checked)}
            />
            Enable auto-grading
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.settings.showMarksAfterSubmission}
              onChange={(e) => handleSettingChange('showMarksAfterSubmission', e.target.checked)}
            />
            Show marks immediately after submission
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.settings.allowLateSubmission}
              onChange={(e) => handleSettingChange('allowLateSubmission', e.target.checked)}
            />
            Allow late submissions
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.settings.randomizeQuestions}
              onChange={(e) => handleSettingChange('randomizeQuestions', e.target.checked)}
            />
            Randomize question order
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.settings.randomizeOptions}
              onChange={(e) => handleSettingChange('randomizeOptions', e.target.checked)}
            />
            Randomize answer options
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="attemptsAllowed">
            Attempts Allowed
          </label>
          <input
            type="number"
            id="attemptsAllowed"
            value={formData.settings.attemptsAllowed}
            onChange={(e) => handleSettingChange('attemptsAllowed', parseInt(e.target.value) || 1)}
            min="1"
            max="10"
          />
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h3>Questions</h3>
          <span className="total-points">Total Points: {totalPoints}</span>
        </div>
        
        {formData.questions.map((question, index) => (
          <QuestionEditor
            key={question.id}
            question={question}
            onChange={(q) => updateQuestion(index, q)}
            onDelete={() => deleteQuestion(index)}
            index={index}
          />
        ))}
        
        <button type="button" onClick={addQuestion} className="btn-add-question">
          + Add Question
        </button>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn-primary"
          disabled={formData.questions.length === 0}
        >
          {initialData ? 'Update' : 'Create'} Assignment
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;