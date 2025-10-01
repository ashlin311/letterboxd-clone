import React, { useState, useEffect } from 'react';
import './styles/App.css';
import Home from './pages/Home';
import Profile from './pages/Profile';
import LoginSignup from './components/auth/LoginSignup';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  // add/remove body class to prevent page background bleed-through when login is visible
  useLoginBodyToggle(!loggedIn);

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'profile':
        return <Profile onNavigate={navigateTo} />;
      case 'home':
      default:
        return <Home onNavigate={navigateTo} />;
    }
  };

  return (
    <div>
      {loggedIn ? (
        renderCurrentPage()
      ) : (
        <div className="login-root">
          <LoginSignup onSuccess={() => setLoggedIn(true)} />
        </div>
      )}
    </div>
  );
}

// ensure the body has a class while the login page is active so global background
// image rules are overridden by a stronger selector when needed
export function useLoginBodyToggle(isLoginVisible){
  useEffect(() => {
    if (isLoginVisible){
      document.body.classList.add('login-page');
    } else {
      document.body.classList.remove('login-page');
    }
    return () => { document.body.classList.remove('login-page'); };
  }, [isLoginVisible]);
}

export default App;