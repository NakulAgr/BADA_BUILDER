import React, { useState } from 'react';
import './HeroSection.css';
import { useNavigate } from 'react-router-dom';
import listings from '../../data/listings';

const HeroSection = () => {
  const navigate = useNavigate(); // ✅ moved here

  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bhkType, setBhkType] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    const filtered = listings.filter(listing => {
      const matchesLocation =
        searchTerm === '' || listing.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = propertyType === '' || listing.type === propertyType;
      const matchesBHK = bhkType === '' || listing.bhk.replace(/\s+/g, '') === bhkType.replace(/\s+/g, '');
      return matchesLocation && matchesType && matchesBHK;
    });

    console.log("Search Triggered!");
    navigate('/search', { state: { results: filtered } });
  };

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>Find Your Dream Property</h1>
        <p>Search from a wide range of properties across India</p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
            <option value="">Property Type</option>
            <option value="Flat/Apartment">Flat/Apartment</option>
            <option value="Independent House/Villa">Independent House</option>
            <option value="Commercial Property">Commercial Property</option>
            <option value="Land">Land</option>
          </select>
          <select value={bhkType} onChange={(e) => setBhkType(e.target.value)}>
            <option value="">BHK Type</option>
            <option value="1RK">1RK</option>
            <option value="2BHK">2 BHK</option>
            <option value="3BHK">3 BHK</option>
            <option value="4BHK">4 BHK</option>
            <option value="5BHK">5 BHK</option>
            <option value="4B2HK">4B2HK</option>
            <option value="5B2HK">5B2HK</option>
          </select>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">Location</option>
            <option value="PAN India">PAN India</option>
            <option value="Vadodara">Vadodara</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Surat">Surat</option>
          </select>
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
