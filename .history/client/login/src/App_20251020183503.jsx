import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import MovieDetailsPage from './pages/MovieDetailsPage';
import ShowTimesPage from './pages/ShowTimesPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import Profile from './pages/Profile';
import LoginSignup from './components/LoginSignup/LoginSignup';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  // add/remove body class to prevent page background bleed-through when login is visible
  useLoginBodyToggle(!loggedIn);

  return (
    <div>
      {loggedIn ? (
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:movieId" element={<MovieDetailsPage />} />
            <Route path="/movie/:movieId/showtimes" element={<ShowTimesPage />} />
            <Route path="/seat-selection/:showId" element={<SeatSelectionPage />} />
ot">
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
