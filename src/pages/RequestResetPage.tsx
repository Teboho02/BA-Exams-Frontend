import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './utils/supabaseClient';
import './auth.css';

const RequestResetPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // ✅ Call Supabase directly from frontend - no backend needed
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Reset password error:', error);
        setError('Failed to send reset email. Please try again.');
      } else {
        // For security, always show success message
        setSuccess('If an account exists for this email, a reset link has been sent. Please check your inbox.');
        setEmail(''); // Clear email field
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            Enter your email address to receive a password reset link
          </p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
                if (success) setSuccess('');
              }}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="alert-error">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="alert-success">
              ✅ {success}
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Sending reset link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="auth-link">
              Go back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequestResetPage;