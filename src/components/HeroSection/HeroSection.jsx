import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, ChevronDown } from 'lucide-react';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const HeroSection = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bhkType, setBhkType] = useState('');
  const [possession, setPossession] = useState('');
  
  const [locationOpen, setLocationOpen] = useState(false);
  const [propertyOpen, setPropertyOpen] = useState(false);
  const [possessionOpen, setPossessionOpen] = useState(false);

  const showBhkType = ['Flat', 'House', 'Villa'].includes(propertyType);

  const handlePropertyTypeChange = (value) => {
    setPropertyType(value);
    setPropertyOpen(false);
    if (!['Flat', 'House', 'Villa'].includes(value)) {
      setBhkType('');
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (propertyType) params.append('type', propertyType);
    if (bhkType && showBhkType) params.append('bhk', bhkType);
    if (possession) params.append('possession', possession);
    navigate(`/search?${params.toString()}`);
  };

  const locationSuggestions = [
    'PAN India', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad',
    'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Surat'
  ];

  const propertyTypes = [
    { value: 'Flat', label: 'Flat/Apartment' },
    { value: 'House', label: 'Independent House' },
    { value: 'Villa', label: 'Villa' },
    { value: 'Plot', label: 'Plot/Land' },
    { value: 'Commercial', label: 'Commercial Space' },
    { value: 'Shop', label: 'Shop' },
    { value: 'Office', label: 'Office Space' }
  ];

  const possessionOptions = [
    'Just Launched', 'Under Construction', 'Ready to Move'
  ];

  // Custom Select Component
  const CustomSelect = ({ value, placeholder, options, open, setOpen, onChange, icon: Icon }) => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full h-12 px-4 flex items-center justify-between gap-2 rounded-full border border-gray-200 bg-white text-left transition-colors",
          "hover:border-gray-300 focus:outline-none focus:border-gray-400",
          value ? "text-gray-900" : "text-gray-500"
        )}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          <span className="text-sm">{value || placeholder}</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {options.map((option) => {
              const optValue = typeof option === 'string' ? option : option.value;
              const optLabel = typeof option === 'string' ? option : option.label;
              return (
                <button
                  key={optValue}
                  type="button"
                  onClick={() => onChange(optValue)}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors",
                    value === optValue && "bg-gray-100 font-medium"
                  )}
                >
                  {optLabel}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center bg-gray-100">
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-gray-500 italic mb-4"
        >
          — Your Dream Property Awaits —
        </motion.p>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
        >
          Find Your Dream Property
        </motion.h1>

        {/* Underline */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-32 h-1 bg-blue-500 mx-auto mb-6"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-gray-600 mb-10 max-w-2xl mx-auto"
        >
          Search from a wide range of properties across India. 
          Your perfect home is just a search away.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2">
              {/* Location Select */}
              <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                <CustomSelect
                  value={location}
                  placeholder="Select Location"
                  options={locationSuggestions}
                  open={locationOpen}
                  setOpen={(v) => { setLocationOpen(v); setPropertyOpen(false); setPossessionOpen(false); }}
                  onChange={(v) => { setLocation(v); setLocationOpen(false); }}
                  icon={MapPin}
                />
              </div>

              {/* Property Type Select */}
              <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                <CustomSelect
                  value={propertyType}
                  placeholder="Property Type"
                  options={propertyTypes}
                  open={propertyOpen}
                  setOpen={(v) => { setPropertyOpen(v); setLocationOpen(false); setPossessionOpen(false); }}
                  onChange={handlePropertyTypeChange}
                  icon={Home}
                />
              </div>

              {/* Possession Status Select */}
              <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                <CustomSelect
                  value={possession}
                  placeholder="Possession Status"
                  options={possessionOptions}
                  open={possessionOpen}
                  setOpen={(v) => { setPossessionOpen(v); setLocationOpen(false); setPropertyOpen(false); }}
                  onChange={(v) => { setPossession(v); setPossessionOpen(false); }}
                />
              </div>

              {/* Search Button */}
              <Button 
                onClick={handleSearch}
                className="h-12 px-8 bg-gray-900 text-white hover:bg-gray-800 rounded-full gap-2"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-gray-500"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">10K+</span>
            <span className="text-sm">Properties</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">50+</span>
            <span className="text-sm">Cities</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">5K+</span>
            <span className="text-sm">Happy Customers</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
