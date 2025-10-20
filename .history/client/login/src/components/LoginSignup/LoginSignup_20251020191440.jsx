import React, { useState } from 'react';
import './LoginSignup.css';
import user_icon from '../assets/person.png';
import password_icon from '../assets/password.png';

const LoginSignup = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };
  
  const toggleForm = () => {
    setIsLogin((prev) => !prev);
    setError(''); // Clear errors when switching forms
    setFormData({ username: '', password: '' }); // Reset all form fields
    setShowPassword(false); // Reset password visibility
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear errors when user types
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user info in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call onSuccess to navigate to Home
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="text">{isLogin ? 'Login' : 'Sign Up'}</div>
      {error && <div className="error-message">{error}</div>}
      <div className="inputs">
      {!isLogin && (   
        <div className="input">
          <img src={user_icon} alt="name" />
          <input 
            type="text" 
            name="username"
            placeholder="Username" 
            value={formData.username}
            onChange={handleInputChange}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            required
          />
        </div>
      )}
      {isLogin && (
        <div className="input">
          <img src={user_icon} alt="name" />
          <input 
            type="text" 
            name="username"
            placeholder="Username" 
            value={formData.username}
            onChange={handleInputChange}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            required
          />
        </div>
      )}
        <div className="input" style={{ position: 'relative' }}>
          <img src={password_icon} alt="password" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            style={{ paddingRight: '50px' }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            required
          />
          <span
            onClick={togglePassword}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#888',
              userSelect: 'none'
            }}
          >
            {showPassword ? 'Hide' : 'Show'}
          </span>
        </div>
      </div>
      <div className="already-user">{isLogin ? 'New User? ' : 'Already a User? '}
        <span onClick = {toggleForm} style={{cursor : 'pointer', color: '#007bff'}}
         >Click Here</span></div>
      <div
        className={`submit ${loading ? 'loading' : ''}`}
        onClick={loading ? undefined : handleSubmit}
      >
        {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
      </div>
    </div>
  );
};
export default LoginSignup;
