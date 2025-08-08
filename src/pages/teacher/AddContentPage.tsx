import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import './AddContentPage.css';

interface ContentFormData {
  type: 'lecture' | 'video' | 'quiz' | 'assignment' | 'forum' | 'resource';
  title: string;
  description: string;
  file?: File;
  link?: string;
  dueDate?: string;
  releaseDate?: string;
  duration?: number; // for quizzes
  totalPoints?: number; // for quizzes and assignments
  allowLateSubmission?: boolean;
  questions?: QuizQuestion[]; // for quizzes
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer?: string;
  points: number;
}

const AddContentPage: React.FC = () => {
  const { courseId, sectionId } = useParams<{ courseId: string; sectionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<ContentFormData>({
    type: 'lecture',
    title: '',
    description: '',
    releaseDate: new Date().toISOString().split('T')[0],
  });

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get section title from location state or default
  const sectionTitle = location.state?.sectionTitle || 'Week Section';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const addQuizQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10
    };
    setQuizQuestions([...quizQuestions, newQuestion]);
  };

  const updateQuizQuestion = (questionId: string, field: keyof QuizQuestion, value: any) => {
    setQuizQuestions(questions =>
      questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    );
  };

  const removeQuizQuestion = (questionId: string) => {
    setQuizQuestions(questions => questions.filter(q => q.id !== questionId));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.type === 'lecture' && !formData.file) {
      newErrors.file = 'Please upload a PDF file';
    }

    if (formData.type === 'video' && !formData.link && !formData.file) {
      newErrors.media = 'Please provide a video link or upload a video file';
    }

    if ((formData.type === 'quiz' || formData.type === 'assignment') && !formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (formData.type === 'quiz' && quizQuestions.length === 0) {
      newErrors.questions = 'Please add at least one question';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, this would be an API call
      console.log('Creating content:', {
        courseId,
        sectionId,
        formData,
        quizQuestions: formData.type === 'quiz' ? quizQuestions : undefined
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate back to course page
      navigate(`/teacher/courses/${courseId}`, {
        state: { message: 'Content added successfully!' }
      });
    } catch (error) {
      console.error('Error creating content:', error);
      setErrors({ submit: 'Failed to create content. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture': return '📄';
      case 'video': return '🎥';
      case 'quiz': return '📝';
      case 'assignment': return '📋';
      case 'forum': return '💬';
      case 'resource': return '🔗';
      default: return '📌';
    }
  };

  return (
    <Layout role="teacher">
      <div className="add-content-page">
        <div className="page-header">
          <div className="breadcrumbs">
            <span onClick={() => navigate('/teacher/courses')} className="breadcrumb-link">
              My Courses
            </span>
            <span className="breadcrumb-separator">/</span>
            <span onClick={() => navigate(`/teacher/courses/${courseId}`)} className="breadcrumb-link">
              Course
            </span>
            <span className="breadcrumb-separator">/</span>
            <span>Add Content</span>
          </div>
          
          <h1>Add New Content</h1>
          <p className="section-info">Adding to: {sectionTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="content-form">
          <div className="form-section">
            <h2>Content Type</h2>
            <div className="content-type-grid">
              {(['lecture', 'video', 'quiz', 'assignment', 'forum', 'resource'] as const).map(type => (
                <label key={type} className={`content-type-option ${formData.type === type ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={formData.type === type}
                    onChange={handleInputChange}
                  />
                  <span className="type-icon">{getContentTypeIcon(type)}</span>
                  <span className="type-label">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter content title"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter content description"
                rows={4}
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="releaseDate">Release Date</label>
                <input
                  type="date"
                  id="releaseDate"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleInputChange}
                />
              </div>

              {(formData.type === 'quiz' || formData.type === 'assignment') && (
                <div className="form-group">
                  <label htmlFor="dueDate">Due Date *</label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate || ''}
                    onChange={handleInputChange}
                    className={errors.dueDate ? 'error' : ''}
                  />
                  {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Content-specific fields */}
          {formData.type === 'lecture' && (
            <div className="form-section">
              <h2>Lecture Material</h2>
              <div className="form-group">
                <label htmlFor="file">Upload PDF *</label>
                <input
                  type="file"
                  id="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className={errors.file ? 'error' : ''}
                />
                {errors.file && <span className="error-message">{errors.file}</span>}
                {formData.file && (
                  <p className="file-info">Selected: {formData.file.name}</p>
                )}
              </div>
            </div>
          )}

          {formData.type === 'video' && (
            <div className="form-section">
              <h2>Video Content</h2>
              <div className="form-group">
                <label>Choose video source:</label>
                <div className="video-options">
                  <div className="form-group">
                    <label htmlFor="link">Video URL</label>
                    <input
                      type="url"
                      id="link"
                      name="link"
                      value={formData.link || ''}
                      onChange={handleInputChange}
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>
                  <div className="or-divider">OR</div>
                  <div className="form-group">
                    <label htmlFor="videoFile">Upload Video</label>
                    <input
                      type="file"
                      id="videoFile"
                      accept="video/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
                {errors.media && <span className="error-message">{errors.media}</span>}
              </div>
            </div>
          )}

          {formData.type === 'quiz' && (
            <div className="form-section">
              <h2>Quiz Settings</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="duration">Duration (minutes)</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration || ''}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="60"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="totalPoints">Total Points</label>
                  <input
                    type="number"
                    id="totalPoints"
                    name="totalPoints"
                    value={formData.totalPoints || ''}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="quiz-questions">
                <div className="questions-header">
                  <h3>Questions</h3>
                  <button type="button" onClick={addQuizQuestion} className="btn-secondary">
                    + Add Question
                  </button>
                </div>
                
                {errors.questions && <span className="error-message">{errors.questions}</span>}
                
                {quizQuestions.map((question, index) => (
                  <div key={question.id} className="question-card">
                    <div className="question-header">
                      <h4>Question {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeQuizQuestion(question.id)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="form-group">
                      <label>Question Type</label>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuizQuestion(question.id, 'type', e.target.value)}
                      >
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="true-false">True/False</option>
                        <option value="short-answer">Short Answer</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Question Text</label>
                      <textarea
                        value={question.question}
                        onChange={(e) => updateQuizQuestion(question.id, 'question', e.target.value)}
                        placeholder="Enter your question"
                        rows={2}
                      />
                    </div>
                    
                    {question.type === 'multiple-choice' && (
                      <div className="form-group">
                        <label>Options</label>
                        {question.options?.map((option, optionIndex) => (
                          <input
                            key={optionIndex}
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(question.options || [])];
                              newOptions[optionIndex] = e.target.value;
                              updateQuizQuestion(question.id, 'options', newOptions);
                            }}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="option-input"
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Correct Answer</label>
                        <input
                          type="text"
                          value={question.correctAnswer || ''}
                          onChange={(e) => updateQuizQuestion(question.id, 'correctAnswer', e.target.value)}
                          placeholder="Enter correct answer"
                        />
                      </div>
                      <div className="form-group">
                        <label>Points</label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuizQuestion(question.id, 'points', parseInt(e.target.value))}
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.type === 'assignment' && (
            <div className="form-section">
              <h2>Assignment Settings</h2>
              <div className="form-group">
                <label htmlFor="totalPoints">Total Points</label>
                <input
                  type="number"
                  id="totalPoints"
                  name="totalPoints"
                  value={formData.totalPoints || ''}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="100"
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="allowLateSubmission"
                    checked={formData.allowLateSubmission || false}
                    onChange={handleCheckboxChange}
                  />
                  Allow late submissions
                </label>
              </div>
              <div className="form-group">
                <label htmlFor="assignmentFile">Upload Assignment Instructions (optional)</label>
                <input
                  type="file"
                  id="assignmentFile"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          )}

          {formData.type === 'resource' && (
            <div className="form-section">
              <h2>Resource Link</h2>
              <div className="form-group">
                <label htmlFor="link">Resource URL</label>
                <input
                  type="url"
                  id="link"
                  name="link"
                  value={formData.link || ''}
                  onChange={handleInputChange}
                  placeholder="https://example.com/resource"
                />
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="error-banner">
              {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/teacher/courses/${courseId}`)}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Content'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddContentPage;