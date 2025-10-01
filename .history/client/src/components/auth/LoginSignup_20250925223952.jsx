import React, { useState } from 'react';
import './LoginSignup.css';
import user_icon from '../../assets/icons/person.png';
import email_icon from '../../assets/icons/email.png';
import password_icon from '../../assets/icons/password.png';

const LoginSignup = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false); 

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };
  
  const toggleForm = () => {
    setIsLogin((prev) => !prev);
  }

  return (
    <div className="container">
      <div className="text">{isLogin ? 'Login' : 'Sign Up'}</div>
      <div className="inputs">
      {!isLogin && (   
        <div className="input">
          <img src={user_icon} alt="name" />
          <input type="text" placeholder="Username" />
        </div>
      )}
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
      <div className="already-user">{isLogin ? 'New User? ' : 'Already a User? '}
        <span onClick = {toggleForm} style={{cursor : 'pointer', color: '#007bff'}}
         >Click Here</span></div>
      <div
        className="submit"
        onClick={() => {
          // placeholder for real auth logic; call onSuccess to navigate to Home
          if (typeof onSuccess === 'function') onSuccess();
        }}
        style={{ cursor: 'pointer' }}
      >
        {isLogin ? 'Login' : 'Sign Up'}
      </div>
    </div>
  );
};
export default LoginSignup;