import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import './home.css';

const ShowTimesPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [showTimes, setShowTimes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch movie details
        const movieRes = await fetch(`http://localhost:3000/movies/${movieId}`);
        if (!movieRes.ok) {
          throw new Error('Movie not found');
        }
        const movieData = await movieRes.json();
        setMovie(movieData);

        // Fetch show times
        const showTimesRes = await fetch(`http://localhost:3000/movies/${movieId}/showtimes`);
        if (!showTimesRes.ok) {
          const errorData = await showTimesRes.json().catch(() => ({}));
          throw new Error(errorData.error || 'Show times not available');
        }
        const showTimesData = await showTimesRes.json();
        setShowTimes(showTimesData.showTimes);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId]);

  const handleBackToMovie = () => {
    navigate(`/movie/${movieId}`);
  };

  const handleShowTimeSelect = (showId, showTime, theatreName) => {
    // TODO: Navigate to seat selection or booking page
    alert(`Selected show at ${theatreName} on ${new Date(showTime).toLocaleString()}`);
  };

  const formatTime = (timeString) => {
    // Handle both full datetime and time-only strings
    if (timeString.includes('T') || timeString.includes(' ')) {
      // Full datetime string
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      // Time-only string (HH:MM:SS)
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
  };

  const formatDate = (dateString) => {
    // Handle both full datetime and date-only strings
    let date;
    if (dateString.includes('T') || dateString.includes(' ')) {
      // Full datetime string
      date = new Date(dateString);
    } else {
      // Date-only string (YYYY-MM-DD)
      date = new Date(dateString + 'T00:00:00');
    }
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="home-root">
        <Header />
        <div className="showtimes-page">
          <div className="loading">Loading show times...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-root">
        <Header />
        <div className="showtimes-page">
          <div className="error">Error: {error}</div>
          <button onClick={handleBackToMovie} className="back-button">
            ← Back to Movie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-root">
      <Header />
      <div className="showtimes-page">
        <div className="showtimes-header">
          <button 
            className="back-button"
            onClick={handleBackToMovie}
            aria-label="Back to movie"
          >
            ← Back to Movie
          </button>
          
          {movie && (
            <div className="booking-title">
              <h1>You are booking for: {movie.name}</h1>
            </div>
          )}
        </div>

        <div className="showtimes-content">
          <h2>Select Show Time</h2>
          
          {Object.keys(showTimes).length === 0 ? (
            <div className="no-showtimes">
              <p>No show times available for this movie.</p>
            </div>
          ) : (
            <div className="showtimes-grid">
              {Object.entries(showTimes).map(([date, shows]) => (
                <div key={date} className="date-section">
                  <h3 className="date-header">{formatDate(date)}</h3>
                  <div className="theatres-container">
                    {shows.map((show) => (
                      <div key={show.show_id} className="theatre-card">
                        <div className="theatre-info">
                          <h4 className="theatre-name">{show.theatre_name}</h4>
                          <p className="theatre-location">{show.district_name}</p>
                        </div>
                        <div className="show-times">
                          <button
                            className="show-time-btn"
                            onClick={() => handleShowTimeSelect(show.show_id, show.time, show.theatre_name)}
                          >
                            {formatTime(show.time)}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowTimesPage;
