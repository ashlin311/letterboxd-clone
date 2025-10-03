import React from 'react';
import { useNavigate } from 'react-router-dom';

const Moviecard = ({ movie }) => {
  const navigate = useNavigate();
  const src = movie?.poster || 'https://placehold.co/300x450?text=No+Image';
  
  const handleCardClick = () => {
    if (movie?.id) {
      navigate(`/movie/${movie.id}`);
    }
  };

  return (
    <div className="movie-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="poster">
        <img className="poster-img" src={src} alt={movie?.title || 'poster'} />
      </div>
      <div className="movie-info">
        <div className="movie-title">{movie.title}</div>
        <div className="movie-year">{movie.year}</div>
      </div>
    </div>
  );
};

export default Moviecard;
