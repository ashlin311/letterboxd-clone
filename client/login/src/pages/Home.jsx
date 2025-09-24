import React, { useState } from 'react';
import Header from './Header';
import Searchbar from './Searchbar';
import MovieGrid from './MovieGrid';
import './home.css';

const Home = () => {
  const [query, setQuery] = useState('');
  return (
    <div className="home-root">
      <Header />
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
