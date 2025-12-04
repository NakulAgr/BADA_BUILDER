import React from 'react';
import { useLocation } from 'react-router-dom';
import './SearchResults.css';

const SearchResults = () => {
  const location = useLocation();
  const listings = location.state?.results || [];

  return (
    <div className="search-page">
      <h1>Search Results</h1>
      {listings.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="results-grid">
          {listings.map((item) => (
            <div className="result-card" key={item.id}>
              <img src={item.image} alt={item.title} />
              <h3>{item.title}</h3>
              <p>{item.bhk} • {item.area}</p>
              <strong>{item.price}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
