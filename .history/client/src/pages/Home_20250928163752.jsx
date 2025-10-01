import React, { useState } from 'react';
import Header from '../components/common/Header';
import Searchbar from '../components/common/Searchbar';
import MovieGrid from '../components/movie/MovieGrid';
import '../styles/home.css';

const Home = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  return (
    <div className="home-root">
      <Header onNavigate={onNavigate} />
      <Searchbar query={query} onChange={setQuery} />
      <div className="glass-wrap">
        <main className="home-main glass-inner">
          <MovieGrid searchQuery={query} />
        </main>
      </div>
    </div>
  );
};

export default Home;
