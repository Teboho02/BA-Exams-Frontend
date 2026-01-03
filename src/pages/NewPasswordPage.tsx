import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from './utils/supabaseClient';
import './auth.css';

const NewPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // ✅ Check if user has valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Supabase automatically handles the token exchange when user clicks the email link
        // We just need to verify they have a valid session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          setError('Invalid or expired password reset link.');
          setCheckingSession(false);
          return;
        }

        if (session) {
          // Valid session exists (created automatically by Supabase from the email link)
          setIsValidSession(true);
        } else {
          setError('Invalid or expired password reset link. Please request a new one.');
        }
      } catch (err) {
        console.error('Session verification error:', err);
        setError('Failed to verify reset link.');
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
    return null;
  };

  const getPasswordRequirements = () => ([
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(password), text: 'One lowercase letter' },
    { met: /[0-9]/.test(password), text: 'One number' },
  ]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // ✅ Update password using the authenticated session
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) throw error;

      setSuccess('Password reset successfully! Redirecting to login...');
      
      // Sign out the user after successful password reset
      await supabase.auth.signOut();
      
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking session
  if (checkingSession) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <p>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Show error if session is invalid
  if (!isValidSession && error) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="alert-error">⚠️ {error}</div>
          <div className="auth-footer">
            <Link to="/forgot-password" className="auth-link">
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Set New Password</h1>
          <p className="auth-subtitle">Enter your new password below</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password" className="form-label">New Password</label>
            <input
              id="password"
              type="password"
              required
              className="form-input"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              disabled={loading}
            />
            <div className="password-requirements">
              <ul className="requirement-list">
                {getPasswordRequirements().map((req, i) => (
                  <li
                    key={i}
                    className={`requirement-item ${req.met ? 'requirement-met' : 'requirement-unmet'}`}
                  >
                    {req.met ? '✓ ' : '○ '}{req.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              className="form-input"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              disabled={loading}
            />
          </div>

          {error && <div className="alert-error">⚠️ {error}</div>}
          {success && <div className="alert-success">✅ {success}</div>}

          <button
            type="submit"
            className="auth-button"
            disabled={loading || !isValidSession}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Resetting password...
              </>
            ) : (
              'Reset Password'
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

export default NewPasswordPage;