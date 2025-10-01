import React, { useEffect } from 'react';
import profileImg from '../../assets/icons/person.png';
import logo from '/Title.svg';

const Header = ({ onNavigate }) => {
  useEffect(() => {
    // Ensure the browser tab title matches the site name even during dev HMR
    document.title = 'Letterboxd Clone';
  }, []);

  const handleProfileClick = () => {
    if (onNavigate) {
      onNavigate('profile');
    }
  };

  const handleLogoClick = () => {
    if (onNavigate) {
      onNavigate('home');
    }
  };

  return (
    <header className="site-header">
      <div className="brand-wrap" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <img src={logo} alt="Logo" className="brand-logo" />
        <div className="brand-text">Letterboxd Clone</div>
      </div>

      <div className="header-right">
        <button 
          className="profile-btn" 
          aria-label="Profile"
          onClick={handleProfileClick}
          style={{ cursor: 'pointer' }}
        >
          <img src={profileImg} alt="Profile" className="profile-avatar" />
        </button>
      </div>
    </header>
  );
};

export default Header;