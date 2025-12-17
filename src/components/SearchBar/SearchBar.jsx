import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

// Shadcn UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SearchBar = ({ variant = 'default' }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bhkType, setBhkType] = useState('');
  const [location, setLocation] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);

  // Check if BHK type should be shown
  const showBhkType = ['flat', 'house', 'villa'].includes(propertyType);

  // Focus input when expanded
  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchExpanded]);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchExpanded && !e.target.closest('.search-container')) {
        setSearchExpanded(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [searchExpanded]);

  // Handle property type change
  const handlePropertyTypeChange = (e) => {
    const newType = e.target.value;
    setPropertyType(newType);
    // Reset BHK if property type doesn't support it
    if (!['flat', 'house', 'villa'].includes(newType)) {
      setBhkType('');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build search query parameters
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (propertyType) params.append('type', propertyType);
    // Only add BHK if it's applicable for the property type
    if (bhkType && showBhkType) params.append('bhk', bhkType);
    if (location) params.append('location', location);
    
    // Navigate to search results page
    navigate(`/search?${params.toString()}`);
    setSearchExpanded(false);
  };

  // Expandable search for header (compact variant)
  if (variant === 'compact') {
    return (
      <div className="search-container flex items-center justify-center">
        <AnimatePresence mode="wait">
          {searchExpanded ? (
            <motion.form
              key="expanded"
              initial={{ width: 48, opacity: 0 }}
              animate={{ width: 500, opacity: 1 }}
              exit={{ width: 48, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onSubmit={handleSearch}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-lg"
            >
              <Search className="w-5 h-5 text-gray-900 shrink-0" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search properties..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-8 text-gray-900"
              />
              <Button type="submit" size="sm" className="bg-gray-900 text-white hover:bg-gray-800 rounded-full h-8 px-4">
                Search
              </Button>
              <button 
                type="button" 
                onClick={() => setSearchExpanded(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </motion.form>
          ) : (
            <motion.button
              key="collapsed"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => { e.stopPropagation(); setSearchExpanded(true); }}
              className="flex w-10 h-10 items-center justify-center cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-6 h-6 text-gray-900" strokeWidth={2} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full version for hero section and pages
  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-900" />
            <input
              type="text"
              placeholder="Search by property name, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-transparent border-0 outline-none text-gray-900 placeholder:text-gray-500"
            />
          </div>

          {/* Property Type Select */}
          <select
            value={propertyType}
            onChange={handlePropertyTypeChange}
            className="h-12 px-4 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 outline-none"
          >
            <option value="">Property Type</option>
            <option value="flat">Flat/Apartment</option>
            <option value="house">Independent House</option>
            <option value="villa">Villa</option>
            <option value="land">Land/Plot</option>
            <option value="commercial">Commercial</option>
            <option value="shop">Shop</option>
            <option value="office">Office</option>
          </select>

          {/* BHK Type - Only show for flat, house, villa */}
          {showBhkType && (
            <select
              value={bhkType}
              onChange={(e) => setBhkType(e.target.value)}
              className="h-12 px-4 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 outline-none"
            >
              <option value="">BHK Type</option>
              <option value="1RK">1 RK</option>
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
              <option value="3BHK">3 BHK</option>
              <option value="4BHK">4 BHK</option>
              <option value="5BHK">5+ BHK</option>
            </select>
          )}

          {/* Location Input */}
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            list="location-list"
            className="h-12 px-4 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 outline-none w-40"
          />
          <datalist id="location-list">
            <option value="PAN India" />
            <option value="Mumbai" />
            <option value="Delhi" />
            <option value="Bangalore" />
            <option value="Hyderabad" />
            <option value="Ahmedabad" />
            <option value="Chennai" />
            <option value="Kolkata" />
            <option value="Pune" />
            <option value="Jaipur" />
            <option value="Surat" />
          </datalist>

          {/* Search Button */}
          <Button type="submit" className="h-12 px-8 bg-gray-900 text-white hover:bg-gray-800 rounded-full gap-2">
            <Search className="w-4 h-4" />
            Search
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
