import React, { useState } from 'react';
import './LoginSignup.css';
import user_icon from '../assets/person.png';
import email_icon from '../assets/email.png';
import password_icon from '../assets/password.png';

const LoginSignup = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="container">
      <div className="text">Sign Up</div>
      <div className="inputs">
        <div className="input">
          <img src={user_icon} alt="name" />
          <input type="text" placeholder="Username" />
        </div>
        <div className="input">
          <img src={email_icon} alt="mail" />
          <input type="email" placeholder="Email ID" />
        </div>
        <div className="input" style={{ position: 'relative' }}>
          <img src={password_icon} alt="password" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            style={{ paddingRight: '50px' }}
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
      <div className="forgot-password">Forgot Password? <span>Click Here</span></div>
      <div className="already-user">Already a User? <span>Click Here</span></div>
      <div className="submit">Sign Up</div>
    </div>
  );
};
export default LoginSignup;
