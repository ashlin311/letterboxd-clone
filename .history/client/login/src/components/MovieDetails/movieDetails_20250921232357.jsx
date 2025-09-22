import React, { useState } from 'react';
import './movieDetails.css';

function MovieDetails({ movieId }) {
  const [movie, setMovie] = useState(null);

  React.useLayoutEffect(() => {
    async function fetchMovie() {
      try {
        const res = await fetch(`http://localhost:3000/movies/${movieId}`);
        const data = await res.json();
        console.log('Fetched data:', data);
        console.log('Data type:', typeof data);
        console.log('Is data truthy?', !!data);
        setMovie(data);
      } catch (error) {
        console.error('Fetch error:', error);
        setMovie(null);
      }
    }
    fetchMovie();
  }, [movieId]);

  if (!movie) return <div>Movie Not Found...</div>;

return (
  <>
    <div className="movie-details-container">
      <div className="movie-header">
        <img
          src={movie.Poster || 'https://placehold.co/300x450?text=NO\nIMAGE'}
          alt={movie.name}
          className="movie-poster"
        />
        <div className="movie-info">
          <h1>{movie.name}</h1>
          <p><strong>Language:</strong> {movie.language}</p>
          <p><strong>Release Date:</strong> {movie.Release_Date.split("T")[0]}</p>
          <p><strong>Synopsis :</strong> {movie.Synopsis}</p>
        </div>
      </div>
    </div>
    <div className="reviews-container">
      <h1>Reviews</h1>
          
     </div>
    
  </>
);
}

export default MovieDetails;