import React, { useState } from 'react';
import './CourseRegistrationModal.css';
import { API_BASE_URL } from '../../../config/api';

interface CourseRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Optional callback for when registration succeeds
}

const CourseRegistrationModal: React.FC<CourseRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [courseCode, setCourseCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseCode.trim()) {
      setError('Please enter a course code');
      return;
    }

    setError(null);
    setLoading(true);
    
    try {
      
      // Fixed URL to match the backend route
      const response = await fetch(`${API_BASE_URL}/api/courses/register`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseCode: courseCode.trim().toUpperCase()
        })
      });

      // Add debugging
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is HTML instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Server returned HTML instead of JSON. URL might be incorrect.');
        throw new Error('Server error: Invalid response format. Please check if the API endpoint exists.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register for course');
      }

      setSuccess(true);
      setCourseCode('');
      
      // Call success callback if provided
      onSuccess?.();
      
      // Auto-close modal after success message
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Failed to register for course');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCourseCode('');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Register for Course</h2>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            disabled={loading}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {success ? (
            <div className="success-state">
              <div className="success-icon">✓</div>
              <h3 className="success-title">Registration Request Sent!</h3>
              <p className="success-message">
                Your registration request has been submitted. You'll receive a notification
                once the instructor approves your enrollment.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="registration-form">
              <div className="form-group">
                <label htmlFor="courseCode" className="form-label">
                  Course Code
                </label>
                <input
                  type="text"
                  id="courseCode"
                  className="form-input"
                  value={courseCode}
                  onChange={(e) => {
                    setCourseCode(e.target.value);
                    setError(null); // Clear error when user types
                  }}
                  disabled={loading}
                  autoFocus
                />
                <p className="form-help-text">
                  Enter the course code provided by your instructor
                </p>
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠</span>
                  {error}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading || !courseCode.trim()}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Submitting...
                    </>
                  ) : (
                    'Send Registration Request'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseRegistrationModal;