import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import MovieDetails from '../components/MovieDetails/movieDetails';
import './home.css'; // Reuse existing styles

const MovieDetailsPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();

  // Scroll to top when component mounts or movieId changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [movieId]);

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="home-root">
      <Header />
      <div className="glass-wrap">
        <main className="home-main glass-inner">
          <div className="movie-details-page">
            <button 
              className="back-button"
              onClick={handleBackToHome}
              aria-label="Back to home"
            >
              ← Back to Movies
            </button>
            <MovieDetails movieId={movieId} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MovieDetailsPage;