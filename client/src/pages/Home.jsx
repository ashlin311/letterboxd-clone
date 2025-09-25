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
      <main className="home-main">
        <MovieGrid searchQuery={query} />
      </main>
    </div>
  );
};

export default Home;
