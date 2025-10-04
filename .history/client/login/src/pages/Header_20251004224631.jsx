import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import profileImg from '../components/assets/person.png';
import logo from '/Title.svg';

const Header = () => {
  useEffect(() => {
    // Ensure the browser tab title matches the site name even during dev HMR
    document.title = 'Letterboxd Clone';
  }, []);
  return (
    <header className="site-header">
      <div className="brand-wrap">
        <img src={logo} alt="Logo" className="brand-logo" />
        <div className="brand-text">Letterboxd Clone</div>
      </div>

      <div className="header-right">
        <button className="profile-btn" aria-label="Profile">
          <img src={profileImg} alt="Profile" className="profile-avatar" />
        </button>
      </div>
    </header>
  );
};

export default Header;
