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
      <Link to="/" className="brand-wrap">
        <img src={logo} alt="Logo" className="brand-logo" />
        <div className="brand-text">Letterboxd Clone</div>
      </Link>

      <div className="header-right">
        <Link to="/profile" className="profile-btn" aria-label="Profile">
          <img src={profileImg} alt="Profile" className="profile-avatar" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
