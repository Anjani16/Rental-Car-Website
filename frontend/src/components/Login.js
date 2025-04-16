import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CarLogo from '../images/CarLogo.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5555";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeUser, setActiveUser] = useState('owner');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Logging in as:', activeUser, email, password);
    const payload = { email, password, role: activeUser };
    console.log('Login request payload:', payload); 
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role: activeUser }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem('token', data.token);
        toast.success(data.message || 'Login successful!', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
  
        if (activeUser === 'owner') {
          navigate('/owner');
        } else if (activeUser === 'renter') {
          navigate('/renter');
        }
      } else {
        toast.error(data.message || 'Login failed. Please try again.', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('An error occurred during login. Please try again later.', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div className="login-body">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <div className="login-image-section">
        <img src={CarLogo} alt="Car Logo" className="login-car-logo" />
      </div>

      <div className="login-page">
        <div className="login-wrapper">
          <header className="app-header">
            <h1>Car Rental Management System</h1>
          </header>

          <h2 className="login-heading">Login</h2>

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

          <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
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

              <div className="forgot-password">
                <span
                  className="forgot-password-link"
                  style={{ color: '#007bff' }}
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot your password?
                </span>
              </div>

              <button
                type="submit"
                style={{ backgroundColor: activeUser === 'owner' ? '#B7DBEF' : '#007bff' }}
              >
                Login
              </button>
            </form>

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
    </div>
  );
};

export default Login;