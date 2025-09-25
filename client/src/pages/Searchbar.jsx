import React from 'react';

const Searchbar = ({ query, onChange }) => {
  return (
    <div className="searchbar-wrap">
      <input
        className="search-input"
        type="search"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search movies"
      />
    </div>
  );
};

export default Searchbar;
