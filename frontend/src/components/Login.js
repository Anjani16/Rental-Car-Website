import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
//import ForgotPassword from './ForgotPassword'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeUser, setActiveUser] = useState('owner'); // Default to owner
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Logging in as:', activeUser, email, password);
    const payload = { email, password, role: activeUser };
    console.log('Login request payload:', payload); 
  
    try {
      const response = await fetch('http://localhost:5555/api/users/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role: activeUser }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Save the token to localStorage or context
        localStorage.setItem('token', data.token);
        console.log('Login successful:', data.message);
  
        // Redirect based on role
        if (activeUser === 'owner') {
          navigate('/owner');
        } else if (activeUser === 'renter') {
          navigate('/renter');
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred during login');
    }
  };
  return (
    <div className="login-page">
    <div className="login-wrapper">
      {/* Header */}
      <header className="app-header">
        <h1>Car Rental Management System</h1>
      </header>

      {/* Login Heading */}
      <h2 className="login-heading">Login</h2>

      {/* Owner & Renter Buttons */}
      <div className="login-buttons">
        <button
          className={activeUser === 'owner' ? 'active' : ''}
          onClick={() => setActiveUser('owner')}
        >
          Owner Login
        </button>
        <button
          className={activeUser === 'renter' ? 'active' : ''}
          onClick={() => setActiveUser('renter')}
          style={{ color: 'black' }}
          >
          Renter Login
        </button>
      </div>

      {/* Login Form */}
      <div className="login-container">
        <form onSubmit={handleLogin} className="login-form">
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

          {/* Password */}
          <div className="input-field">
            <label htmlFor="password">
              Password <span className="required">*</span>
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

        {/* Forgot Password Link */}
        <div className="forgot-password">
  <span
    className="forgot-password-link"
    style={{ color: '#007bff' }}
    onClick={() => navigate('/forgot-password')}
  >
    Forgot your password?
  </span>
</div>

          {/* Login Button */}
          <button
            type="submit"
            style={{ backgroundColor: activeUser === 'owner' ? '#B7DBEF' : '#007bff' }}
          >
            Login
          </button>
        </form>

        {/* Signup Link */}
        <div className="signup-link">
          Don't have an account?{' '}
          <button
  className="register-link"
  style={{width:"30%"}}
  onClick={() => navigate('/register', { state: { role: activeUser } })}
>
  Register here
</button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;
