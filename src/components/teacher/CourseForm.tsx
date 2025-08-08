import React, { useState } from 'react';
import type { Course } from '../../types/teacher.types';
import './CourseForm.css';

interface CourseFormProps {
  onSubmit: (courseData: Omit<Course, 'id' | 'teacherId' | 'students' | 'createdAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<Course>;
}

interface FormData {
  title: string;
  code: string;
  subject: string;
  description: string;
  maxStudents: number;
  credits: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false,
  initialData 
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || '',
    code: initialData?.code || '',
    subject: initialData?.subject || 'Computer Science',
    description: initialData?.description || '',
    maxStudents: initialData?.maxStudents || 50,
    credits: initialData?.credits || 3,
    startDate: initialData?.startDate ? initialData.startDate.toISOString().split('T')[0] : '',
    endDate: initialData?.endDate ? initialData.endDate.toISOString().split('T')[0] : '',
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const subjectOptions = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Geography',
    'Art',
    'Music',
    'Physical Education',
    'Business Studies',
    'Economics',
    'Psychology',
    'Philosophy',
    'Other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked 
              : type === 'number' ? parseInt(value) || 0 
              : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Course code is required';
    } else if (!/^[A-Z0-9-]+$/.test(formData.code)) {
      newErrors.code = 'Course code must contain only uppercase letters, numbers, and hyphens';
    }

    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    }

    if (formData.maxStudents < 1 || formData.maxStudents > 500) {
      newErrors.maxStudents = 'Max students must be between 1 and 500';
    }

    if (formData.credits < 1 || formData.credits > 10) {
      newErrors.credits = 'Credits must be between 1 and 10';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start >= end) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const courseData: Omit<Course, 'id' | 'teacherId' | 'students' | 'createdAt'> = {
      title: formData.title.trim(),
      code: formData.code.trim().toUpperCase(),
      subject: formData.subject,
      description: formData.description.trim(),
      maxStudents: formData.maxStudents,
      credits: formData.credits,
      startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
      endDate: formData.endDate ? new Date(formData.endDate) : new Date(),
      isActive: formData.isActive,
    };

    onSubmit(courseData);
  };

  return (
    <div className="course-form-container">
      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-header">
          <h2>{initialData ? 'Edit Course' : 'Create New Course'}</h2>
          <button type="button" onClick={onCancel} className="close-btn">
            ✕
          </button>
        </div>

        <div className="form-body">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Course Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={errors.title ? 'error' : ''}
                placeholder="e.g., Introduction to Web Development"
                disabled={isLoading}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="code">Course Code *</label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={errors.code ? 'error' : ''}
                placeholder="e.g., CS101"
                disabled={isLoading}
              />
              {errors.code && <span className="error-text">{errors.code}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={errors.subject ? 'error' : ''}
              disabled={isLoading}
            >
              {subjectOptions.map(subject => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            {errors.subject && <span className="error-text">{errors.subject}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Course Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder="Describe what students will learn in this course..."
              rows={4}
              disabled={isLoading}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maxStudents">Max Students *</label>
              <input
                type="number"
                id="maxStudents"
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleChange}
                className={errors.maxStudents ? 'error' : ''}
                min="1"
                max="500"
                disabled={isLoading}
              />
              {errors.maxStudents && <span className="error-text">{errors.maxStudents}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="credits">Credits *</label>
              <input
                type="number"
                id="credits"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                className={errors.credits ? 'error' : ''}
                min="1"
                max="10"
                disabled={isLoading}
              />
              {errors.credits && <span className="error-text">{errors.credits}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={errors.endDate ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.endDate && <span className="error-text">{errors.endDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span className="checkmark"></span>
              Course is active (students can enroll)
            </label>
          </div>
        </div>

        <div className="form-footer">
          <button 
            type="button" 
            onClick={onCancel}
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
            {isLoading ? (
              <>
                <span className="spinner"></span>
                {initialData ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              initialData ? 'Update Course' : 'Create Course'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;