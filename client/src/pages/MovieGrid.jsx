import React, { useState, useMemo } from 'react';
import Moviecard from './Moviecard';

// Placeholder sample data — replace with real API data later
const SAMPLE_NOW = [
  { id: 1, title: 'The Shawshank Redemption', year: 1994, poster: 'https://via.placeholder.com/300x450?text=Shawshank' },
  { id: 2, title: 'Inception', year: 2010, poster: 'https://via.placeholder.com/300x450?text=Inception' },
  { id: 3, title: 'Parasite', year: 2019, poster: 'https://via.placeholder.com/300x450?text=Parasite' },
  { id: 4, title: 'Interstellar', year: 2014, poster: 'https://via.placeholder.com/300x450?text=Interstellar' },
];

const SAMPLE_MOVIES = [
  { id: 11, title: 'Pulp Fiction', year: 1994, poster: 'https://via.placeholder.com/300x450?text=Pulp+Fiction' },
  { id: 12, title: 'Fight Club', year: 1999, poster: 'https://via.placeholder.com/300x450?text=Fight+Club' },
  { id: 13, title: 'The Matrix', year: 1999, poster: 'https://via.placeholder.com/300x450?text=The+Matrix' },
  { id: 14, title: 'The Godfather', year: 1972, poster: 'https://via.placeholder.com/300x450?text=Godfather' },
];

const MovieGrid = ({ searchQuery = '' }) => {
  const [tab, setTab] = useState('now');

  const list = useMemo(() => {
    const base = tab === 'now' ? SAMPLE_NOW : SAMPLE_MOVIES;
    if (!searchQuery) return base;
    const q = searchQuery.toLowerCase();
    return base.filter((m) => m.title.toLowerCase().includes(q) || String(m.year).includes(q));
  }, [tab, searchQuery]);

  return (
    <section className="movie-grid-section">
      <div className="tabs">
        <button className={`tab ${tab === 'now' ? 'active' : ''}`} onClick={() => setTab('now')}>Now Showing</button>
        <button className={`tab ${tab === 'movies' ? 'active' : ''}`} onClick={() => setTab('movies')}>Movies</button>
      </div>

      <div className="movie-grid">
        {list.map((m) => (
          <Moviecard key={m.id} movie={m} />
        ))}
      </div>
    </section>
  );
};

export default MovieGrid;
