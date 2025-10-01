import React from 'react';

const Moviecard = ({ movie }) => {
  const src = movie?.poster || 'https://placehold.co/300x450?text=No+Image';
  return (
    <div className="movie-card">
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