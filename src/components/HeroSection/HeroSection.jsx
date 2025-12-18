import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './HeroSection.css';
import { useNavigate, useLocation } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();
  const locationState = useLocation();

  // 🔴 HIDE HERO SECTION ON SEARCH PAGE
  if (locationState.pathname === '/search') {
    return null;
  }

  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bhkType, setBhkType] = useState('');
  const [area, setArea] = useState('');
  const [possession, setPossession] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Success message from booking
  useEffect(() => {
    if (locationState.state?.successMessage) {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [locationState]);

  const showBhkType = ['Flat', 'House', 'Villa'].includes(propertyType);
  const showArea = !!propertyType;

  const handlePropertyTypeChange = (e) => {
    const newType = e.target.value;
    setPropertyType(newType);
    setArea('');

    if (!['Flat', 'House', 'Villa'].includes(newType)) {
      setBhkType('');
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (location) params.append('location', location);
    if (propertyType) params.append('type', propertyType);
    if (bhkType && showBhkType) params.append('bhk', bhkType);
    if (area) params.append('area', area);
    if (possession) params.append('possession', possession);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="hero-section">
      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">✓</span>
            <span>{locationState.state?.successMessage}</span>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      <div className="hero-content">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Find Your Dream Property
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Search from a wide range of properties across India
        </motion.p>

        <motion.div
          className="search-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Location */}
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="search-input"
            placeholder="Enter or Select Location"
            list="location-suggestions"
          />

          <datalist id="location-suggestions">
            <option value="PAN India" />
            <option value="Mumbai" />
            <option value="Delhi" />
            <option value="Bangalore" />
            <option value="Hyderabad" />
            <option value="Ahmedabad" />
            <option value="Pune" />
            <option value="Surat" />
            <option value="Vadodara" />
            <option value="Rajkot" />
          </datalist>

          {/* Property Type */}
          <select
            value={propertyType}
            onChange={handlePropertyTypeChange}
            className="search-select"
          >
            <option value="">Property Type</option>
            <option value="Flat">Flat / Apartment</option>
            <option value="House">Independent House</option>
            <option value="Villa">Villa</option>
            <option value="Plot">Plot / Land</option>
            <option value="Commercial">Commercial</option>
            <option value="Shop">Shop</option>
            <option value="Office">Office</option>
            <option value="Warehouse">Warehouse</option>
            <option value="Showroom">Showroom</option>
          </select>

          {/* BHK */}
          {showBhkType && (
            <motion.select
              value={bhkType}
              onChange={(e) => setBhkType(e.target.value)}
              className="search-select"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <option value="">BHK</option>
              <option value="1RK">1 RK</option>
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
              <option value="3BHK">3 BHK</option>
              <option value="4BHK">4 BHK</option>
              <option value="5BHK">5 BHK</option>
              <option value="6BHK">6+ BHK</option>
            </motion.select>
          )}

          {/* Area */}
          {showArea && (
            <motion.select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="search-select"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <option value="">Area Size</option>
              <option value="Under 500 Sq Ft">Under 500 Sq Ft</option>
              <option value="500-1000 Sq Ft">500 - 1000 Sq Ft</option>
              <option value="1000-1500 Sq Ft">1000 - 1500 Sq Ft</option>
              <option value="1500-2000 Sq Ft">1500 - 2000 Sq Ft</option>
              <option value="Above 2000 Sq Ft">Above 2000 Sq Ft</option>
            </motion.select>
          )}

          {/* Possession */}
          <select
            value={possession}
            onChange={(e) => setPossession(e.target.value)}
            className="search-select"
          >
            <option value="">Possession</option>
            <option value="Just Launched">Just Launched</option>
            <option value="Under Construction">Under Construction</option>
            <option value="Ready to Move">Ready to Move</option>
          </select>

          <button onClick={handleSearch} className="search-button">
            🔍 Search
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
