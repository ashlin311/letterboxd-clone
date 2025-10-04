import React, { useEffect, useState } from 'react';
import Moviecard from './Moviecard';

const API = 'http://localhost:3000/movies';

const MovieGrid = ({ searchQuery = '' }) => {
  const [tab, setTab] = useState('now');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMovies = async (q = '', now = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      // show first 30 items by default (5 rows approx)
      params.set('limit', '30');
      if (now) params.set('now', 'true');
      const res = await fetch(`${API}?${params.toString()}`);
      const data = await res.json();
      setMovies(data.movies || []);
    } catch (err) {
      console.error('fetchMovies error', err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMovies(searchQuery, tab === 'now'); }, [searchQuery, tab]);

  return (
    <section className="movie-grid-section">
      <div className="tabs">
        <button className={`tab ${tab === 'now' ? 'active' : ''}`} onClick={() => setTab('now')}>Now Showing</button>
        <button className={`tab ${tab === 'movies' ? 'active' : ''}`} onClick={() => setTab('movies')}>Movies</button>
      </div>

      {loading && <div>Loading movies...</div>}

      <div className="movie-grid">
        {movies.map((m) => (
          <Moviecard key={m.movie_id || m.id} movie={{
            title: m.name || m.title,
            poster: m.poster || m.Poster,
            id: m.movie_id || m.id,
            year: m.year || (m.Release_Date ? new Date(m.Release_Date).getFullYear() : '')
          }} />
        ))}
      </div>
    </section>
  );
};

export default MovieGrid;
