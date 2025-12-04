import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Projects.css';
import listings from '../data/listings';

const categories = ['All', 'Flat/Apartment', 'Independent House/Villa', 'Commercial Property', 'Land', 'Possession'];
const possessionOptions = ['Just Launched', 'Ready to move', 'Under-Construction'];

const Exhibition = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPossession, setSelectedPossession] = useState('All');
  const [showPossessionOptions, setShowPossessionOptions] = useState(false);
  const possessionRef = useRef(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (possessionRef.current && !possessionRef.current.contains(e.target)) {
        setShowPossessionOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredListings = listings.filter((listing) => {
    const matchesCategory = selectedCategory === 'All' || listing.type === selectedCategory;
    const matchesPossession = selectedCategory !== 'Possession' || selectedPossession === 'All' || listing.possession === selectedPossession;
    return matchesCategory && matchesPossession;
  });

  const handleBookVisit = (e) => {
    e.preventDefault();
    isAuthenticated ? navigate('/book-site-visit') : navigate('/login');
  };

  const handleContact = (e) => {
    e.preventDefault();
    isAuthenticated ? alert('Contact details: 123-456-7890') : navigate('/login');
  };

  return (
    <div className="project-container">
      <h1 className="project-title">Explore Projects</h1>

      <div className="filters-section">
        <div className="category-buttons">
          {categories.map((cat) =>
            cat === 'Possession' ? (
              <div key={cat} className="category-btn-wrapper" ref={possessionRef}>
                <button
                  className={`category-btn ${selectedCategory === 'Possession' ? 'active' : ''}`}
                  onClick={() => setShowPossessionOptions((prev) => !prev)}
                >
                  Possession ▾
                </button>
                {showPossessionOptions && (
                  <div className="possession-dropdown">
                    {possessionOptions.map((option) => (
                      <button
                        key={option}
                        className={`possession-btn ${selectedPossession === option ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedCategory('Possession');
                          setSelectedPossession(option);
                          setShowPossessionOptions(false);
                          navigate(`/possession/${option.toLowerCase().replace(/ /g, '-')}`);
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                key={cat}
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedPossession('All');
                  setShowPossessionOptions(false);
                }}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      <div className="project-grid">
        {filteredListings.map((listing) => (
          <Link to={`/projects/${listing.id}`} key={listing.id} className="project-link">
            <div className="project-card">
              <div className="card-img">
                <img src={listing.image} alt={listing.title} />
                <div className="tag-wrapper">
                  {listing.tags?.map((tag, i) => (
                    <span key={i} className="project-tag">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="card-details">
                <h3>{listing.title}</h3>
                <p className="text-gray-600">{listing.location}</p>
                <p className="price">{listing.priceRange}</p>
                <div className="card-actions">
                  <button className="view-btn" onClick={handleBookVisit}>
                    Book a Site Visit
                  </button>
                  <Link to={`/projects/${listing.id}`} className="contact-btn">
                    View More
                  </Link>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Exhibition;
