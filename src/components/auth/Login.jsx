import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { authService } from '../../services/authService';
import { isAdmin } from '../../utils/roleHelpers';
import '../shared/GlassmorphismHeader.css';
import '../shared/AuthPages.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const { login } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(formData);
      showSuccess('Login successful!');
      
      if (isAdmin(response.user)) {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (error) {
      const errorMsg = error.response?.data || error.message || 'Login failed';
      
      if (errorMsg.includes('deactivated') || errorMsg.includes('contact support')) {
        showError('Your account is deactivated. Please contact support.');
      } else if (errorMsg.includes('User not found') || errorMsg.includes('No user found') || errorMsg.includes('user does not exist')) {
        showError('No account found with this email address.');
      } else if (errorMsg.includes('Bad credentials') || errorMsg.includes('Invalid password') || errorMsg.includes('incorrect password')) {
        showError('Incorrect password. Please try again.');
      } else {
        showError('Invalid email or password. Please check your credentials.');
      }
      
      // Show forgot password for any login failure with valid email format
      if (formData.email && /\S+@\S+\.\S+/.test(formData.email)) {
        setShowForgotPassword(true);
        setResetEmail(formData.email);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmNewPassword) {
      showError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }

    try {
      console.log('Attempting password reset for:', resetEmail);
      const response = await authService.resetPassword(resetEmail, newPassword);
      console.log('Reset response:', response);
      showSuccess('Password reset successfully! Please login with your new password.');
      setShowResetModal(false);
      setShowForgotPassword(false);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMsg = error.response?.data || error.message || 'Failed to reset password';
      
      if (errorMsg.includes('User not found') || errorMsg.includes('not found with this email')) {
        showError('No account found with this email address.');
      } else {
        showError(typeof errorMsg === 'string' ? errorMsg : 'Failed to reset password. Please try again.');
      }
    }
  };

  return (
    <div className="auth-page">
      {/* Header */}
      <nav className="glassmorphism-header">
        <div className="header-container">
          <div className="header-content">
            <div className="logo-section">
              <Link to="/" className="logo-text" style={{textDecoration: 'none'}}>
                Budget Tracker
              </Link>
            </div>
            <div className="nav-section">
              <Link to="/register" className="nav-link">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="flex gap-8 items-center">
            <div className="flex-1">
              <div className="auth-header">
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to your account to continue</p>
              </div>
              
              <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {formData.password && (
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            
            {showForgotPassword && (
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => setShowResetModal(true)}
              >
                Forgot your password?
              </button>
            )}
            
            <div className="auth-link">
              <Link to="/register">
                Don't have an account? Sign up
              </Link>
            </div>
          </form>
            </div>
            
            <div className="flex-1 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=500&fit=crop&crop=center" 
                alt="Budget Management" 
                className="auth-image animate-float"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Reset Password</h3>
            <form onSubmit={handleResetPassword}>
              <input
                type="email"
                value={resetEmail}
                className="modal-input"
                disabled
                style={{background: 'rgba(0,0,0,0.1)'}}
              />
              <input
                type="password"
                placeholder="New Password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="modal-input"
                required
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="modal-input"
                required
              />
              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="modal-button secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="modal-button primary">
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;