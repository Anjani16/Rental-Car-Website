import React, { useState, useContext  } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api'; // Import the forgotPassword function
import '../styles/ForgotPassword.css';
import { ThemeContext } from './ThemeContext'; // adjust the path as needed

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext); // Get current theme ('light' or 'dark')

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      console.log('Sending request to backend:', { email, newPassword }); // Log the request
      const response = await forgotPassword(email, newPassword); // Call the forgotPassword function
      console.log('Backend response:', response.data); // Log the response
      setMessage(response.data.message);
      setError('');
      navigate('/login'); // Redirect to login page after successful password reset
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
      setMessage('');
    }
  };

  return (
    <div className="forgot-password-wrapper">
      {/* Header */}
      <header className={`app-header ${theme}`}>
        <h1 className={`header-title ${theme}`}>Car Rental Management System</h1>
      </header>

      {/* Forgot Password Form */}
      <div className="forgot-password-container">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit} className="forgot-password-form">
          {/* Email */}
          <div className="input-field">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* New Password */}
          <div className="input-field">
            <label htmlFor="newPassword">
              New Password <span className="required">*</span>
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="input-field">
            <label htmlFor="confirmPassword">
              Confirm Password <span className="required">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          <button type="submit">Reset Password</button>
        </form>

        {/* Back to Login Link */}
        <div className="back-to-login">
          <button onClick={() => navigate('/login')}>Back to Login</button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;